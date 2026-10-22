'use client';
/* Book Now flow (original system.js bookPage + bkInit/bkDraw/bkRead/bkValidate/bkSummary, the coupon
   apply of improve.js + api.js, and the "pay advance" call-to-action payproof.js adds after confirming).
   Steps: Trip → Travellers → Add-ons → Review & pay. The state survives leaving and coming back to the
   same package during the visit (like the original BK.s). On confirm the booking is saved on the device
   (My Trips) and sent to the dashboard (POST /bookings, with offline outbox). */
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { I, withProps } from '@/components/icons';
import { img, inr, waLink, fmtDate, cx } from '@/lib/format';
import { PATHS, VIEW_PATHS } from '@/lib/routes';
import { DB, refNo } from '@/lib/client/storage';
import { post, send } from '@/lib/client/api';
import { useMounted } from '@/lib/client/hooks';
import { addonList, bkCalc, bkValidate, couponCheck, newBooking, minDeparture, CITIES, HOTELS, HOTEL_LABEL, PAY_METHODS, LIMITS } from '@/lib/booking/calc';
import StatusTrack from './StatusTrack';

const STEPS = ['Trip', 'Travellers', 'Add-ons', 'Review & pay'];
let saved = null;               /* BK.s — kept for this visit */
const serverCoupons = {};       /* backend answers to POST /coupon, by code */
const SHIELD = withProps(I.shield, { width: '14', height: '14', style: { verticalAlign: '-2px' } });

function Summary({ p, intl, s }) {
  const c = bkCalc(p, intl, s);
  return (
    <>
      <h3>Price summary</h3>
      <table className="jb-t"><tbody>
        <tr><td>{s.ad} adult{s.ad > 1 ? 's' : ''} × {inr(c.pp)}</td><td className="num">{inr(c.adults)}</td></tr>
        {s.ch ? <tr><td>{s.ch} child{s.ch > 1 ? 'ren' : ''} (extra bed)</td><td className="num">{inr(c.kids)}</td></tr> : null}
        {s.inf ? <tr><td>{s.inf} infant{s.inf > 1 ? 's' : ''}</td><td className="num">Free</td></tr> : null}
        {c.single ? <tr><td>Single-room supplement</td><td className="num">{inr(c.single)}</td></tr> : null}
        {c.disc ? <tr className="disc"><td>Coupon {s.coupon} (−{s.cpct}%)</td><td className="num">− {inr(c.disc)}</td></tr> : null}
        <tr><td>GST 5%</td><td className="num">{inr(c.gst)}</td></tr>
        <tr className="tot"><td>Estimated total</td><td className="num">{inr(c.total)}</td></tr>
        <tr><td><b>Pay now (25% advance)</b></td><td className="num"><b>{inr(c.adv)}</b></td></tr>
      </tbody></table>
      <p className="muted" style={{ fontSize: '12px' }}>{intl ? 'TCS applies on overseas packages as per income-tax rules and is shown in your final invoice. ' : ''}Flights not included. Final price is confirmed by your trip expert before payment.</p>
    </>
  );
}

function Stepper({ k, l, sub, v, onStep }) {
  return (
    <div className="est-row"><span>{l}<small className="muted" style={{ display: 'block', fontWeight: '500' }}>{sub}</small></span>
      <div className="step"><button type="button" aria-label={`Fewer ${l}`} onClick={() => onStep(k, -1)}>−</button><output>{v}</output><button type="button" aria-label={`More ${l}`} onClick={() => onStep(k, 1)}>+</button></div></div>
  );
}

/* p: { id, title, img, n, route, price }; CONFIG: { phone, whatsapp, coupons, payTat }; help: the help side box */
export default function BookFlow({ p, intl, CONFIG, help }) {
  const [s, setS] = useState(() => (saved && saved.pkg === p.id ? saved : newBooking(p.id)));
  const [err, setErr] = useState('');
  const [code, setCode] = useState(s.coupon || '');
  const [cmsg, setCmsg] = useState(() => (s.coupon ? { text: `Applied: ${(CONFIG.coupons[s.coupon] || {}).desc || ''}`, cls: 'ok' } : { text: '', cls: '' }));
  const [tc, setTc] = useState(false);
  const [done, setDone] = useState(null);
  const mounted = useMounted();
  const addons = useMemo(() => addonList(intl), [intl]);
  useEffect(() => { if (!done) saved = s; }, [s, done]);

  const upd = patch => setS(v => ({ ...v, ...patch }));
  const field = k => e => upd({ [k]: e.target.value });
  const onStep = (k, d) => { const lim = LIMITS[k]; setErr(''); upd({ [k]: Math.max(lim[0], Math.min(lim[1], s[k] + d)) }); };
  const trimmed = v => ({ ...v, date: v.date.trim(), name: v.name.trim(), phone: v.phone.trim(), email: v.email.trim(), names: v.names.trim(), notes: v.notes.trim() });
  const goStep = dir => {
    const cur = trimmed(s);
    if (dir > 0) { const e = bkValidate(cur); if (e) { setS(cur); setErr(e); return; } }
    const step = Math.max(0, Math.min(3, cur.step + dir));
    setS({ ...cur, step }); setErr(''); setTc(false);
    if (step === 3) { setCode(cur.coupon || ''); setCmsg(cur.coupon ? { text: `Applied: ${couponDesc(cur.coupon)}`, cls: 'ok' } : { text: '', cls: '' }); }
    scrollTo({ top: 0, behavior: 'smooth' });
  };
  const couponDesc = K => { const sv = serverCoupons[K]; return (sv && sv.ok ? sv.desc || sv.pct + '% off' : (CONFIG.coupons[K] || {}).desc) || ''; };

  const applyCoupon = async () => {
    const K = code.trim().toUpperCase();
    if (K) {
      try { serverCoupons[K] = await post('/coupon', { code: K, date: s.date }); }
      catch (e) { serverCoupons[K] = { ok: false, msg: e.status === 404 ? 'This code is not valid.' : 'Could not check the code right now — please try again.' }; }
    }
    const r = couponCheck(CONFIG.coupons, serverCoupons, code, s.date);
    if (r.ok) { upd({ coupon: K, cpct: r.pct }); setCmsg({ text: `Applied: ${r.desc}`, cls: 'ok' }); }
    else { upd({ coupon: '', cpct: 0 }); setCmsg({ text: r.msg, cls: 'bad' }); }
  };

  const confirm = () => {
    if (!tc) { setErr('Please accept the terms and cancellation policy.'); return; }
    let cur = s;
    if (cur.coupon && !couponCheck(CONFIG.coupons, serverCoupons, cur.coupon, cur.date).ok) cur = { ...cur, coupon: '', cpct: 0 };
    const c = bkCalc(p, intl, cur), ref = refNo();
    const b = { ref, pkg: cur.pkg, date: cur.date, from: cur.from, hotel: cur.hotel, ad: cur.ad, ch: cur.ch, inf: cur.inf, name: cur.name, phone: cur.phone, email: cur.email, addons: cur.addons, notes: cur.notes, pay: cur.pay, coupon: cur.coupon, disc: c.disc, total: c.total, adv: c.adv, status: 1, at: new Date().toISOString() };
    DB.addBooking(b);
    send('/bookings', { ...b, names: cur.names, pkgTitle: p.title || b.pkg, addons: (b.addons || []).map(String) });
    const txt = `Hi TripPartner, booking request ${ref}\n${p.title}\nDeparture: ${fmtDate(cur.date)} from ${cur.from}\nTravellers: ${cur.ad}A ${cur.ch}C ${cur.inf}I · ${HOTEL_LABEL[cur.hotel]} hotels\nEst. total: ${inr(c.total)} · Advance: ${inr(c.adv)}\nName: ${cur.name} · ${cur.phone}`;
    saved = null; setS(cur); setDone({ ref, adv: c.adv, txt });
  };

  const c = bkCalc(p, intl, s);
  const nav = (back, next) => (
    <><p className="err" id="bk-err" aria-live="polite">{err}</p><div className="pl-nav">{back ? <button type="button" className="btn btn-ghost" onClick={() => goStep(-1)}>Back</button> : <span></span>}<button type="button" className="btn btn-o" onClick={() => goStep(1)}>{next} {I.arrow}</button></div></>
  );

  let body;
  if (done) {
    body = (
      <div className="ok"><span className="tick">{I.tick}</span><h2>Booking request received</h2><p>Reference <b className="refno">{done.ref}</b></p><p className="muted">Your trip expert will confirm hotels and send a secure payment link for the {inr(done.adv)} advance. Nothing has been charged yet.</p><StatusTrack n={1} />
        <div className="py-cta"><p><b>Want to lock your seats now?</b> Pay the advance by UPI or bank transfer and upload the payment proof — our team verifies it within {CONFIG.payTat}.</p><Link className="btn btn-o" href={PATHS.pay(done.ref)}>{I.wallet} Pay advance &amp; upload proof</Link></div>
        <div className="pl-nav" style={{ justifyContent: 'center' }}><Link className="btn btn-o" href={VIEW_PATHS.account}>View in My Trips</Link><a className="btn btn-wa" href={waLink(CONFIG, done.txt)} target="_blank" rel="noopener">{I.wa} Share on WhatsApp</a></div></div>
    );
  } else if (s.step === 0) {
    body = (
      <><h2>Trip details</h2><div className="form">
        <div className="row2"><label>Departure date<input type="date" id="bk-date" min={mounted ? minDeparture() : undefined} value={s.date} onChange={field('date')} required /></label><label>Departing from<select id="bk-from" value={s.from} onChange={field('from')}>{CITIES.map(x => <option key={x}>{x}</option>)}</select></label></div>
        <p className="pl-l">Hotel category</p><div className="ropts three">{HOTELS.map(([k, t, x]) => <label className="ropt" key={k}><input type="radio" name="bk-hotel" value={k} checked={s.hotel === k} onChange={() => upd({ hotel: k })} /><span><b>{t}</b><small>{x}</small></span></label>)}</div></div>{nav(false, 'Continue')}</>
    );
  } else if (s.step === 1) {
    body = (
      <><h2>Who&apos;s travelling?</h2><Stepper k="ad" l="Adults" sub="12+ years" v={s.ad} onStep={onStep} /><Stepper k="ch" l="Children" sub="5–11 years, with extra bed" v={s.ch} onStep={onStep} /><Stepper k="inf" l="Infants" sub="Under 5, no extra bed" v={s.inf} onStep={onStep} />
        <div className="form" style={{ marginTop: '14px' }}><label>Lead traveller&apos;s full name (as on ID)<input id="bk-name" value={s.name} onChange={field('name')} autoComplete="name" /></label>
          <div className="row2"><label>Mobile number<input id="bk-phone" value={s.phone} onChange={field('phone')} inputMode="tel" autoComplete="tel" /></label><label>Email<input id="bk-email" type="email" value={s.email} onChange={field('email')} autoComplete="email" /></label></div>
          <label>Other travellers&apos; names (optional)<textarea id="bk-names" placeholder="One name per line — you can add these later" value={s.names} onChange={field('names')}></textarea></label>
          <p className="muted" style={{ fontSize: '13px' }}>Travelling with someone new? <Link href={`${VIEW_PATHS['partner-book']}?p=${encodeURIComponent(s.pkg)}`} style={{ color: 'var(--blue)' }}>Book with a Travel Partner</Link> to split payment and choose rooms together.</p></div>{nav(true, 'Continue')}</>
    );
  } else if (s.step === 2) {
    const toggle = k => { const on = new Set(s.addons); if (on.has(k)) on.delete(k); else on.add(k); upd({ addons: addons.map(a => a[0]).filter(a => on.has(a)) }); }; /* list order, as the original read the ticked boxes */
    body = (
      <><h2>Add-ons</h2><p className="muted" style={{ margin: '-4px 0 14px' }}>Optional. Your trip expert quotes these separately.</p><div className="ropts">{addons.map(([k, t, x]) => <label className="ropt" key={k}><input type="checkbox" checked={s.addons.includes(k)} onChange={() => toggle(k)} /><span><b>{t}</b><small>{x}</small></span></label>)}</div>
        <div className="form" style={{ marginTop: '14px' }}><label>Special requests (optional)<textarea id="bk-notes" placeholder="Anniversary, dietary needs, senior travellers, early check-in…" value={s.notes} onChange={field('notes')}></textarea></label></div>{nav(true, 'Review booking')}</>
    );
  } else {
    const picked = addons.map(a => a[0]).filter(a => s.addons.includes(a));
    body = (
      <><h2>Review &amp; pay</h2>
        <div className="rev"><div><small>Package</small><b>{p.title}</b></div><div><small>Departure</small><b>{s.date ? fmtDate(s.date) : '—'} from {s.from}</b></div><div><small>Hotels</small><b>{HOTEL_LABEL[s.hotel]}</b></div><div><small>Travellers</small><b>{s.ad} adult{s.ad > 1 ? 's' : ''}{s.ch ? `, ${s.ch} child${s.ch > 1 ? 'ren' : ''}` : ''}{s.inf ? `, ${s.inf} infant${s.inf > 1 ? 's' : ''}` : ''}</b></div><div><small>Lead traveller</small><b>{s.name} · {s.phone}</b></div><div><small>Add-ons</small><b>{picked.length ? picked.map(a => addons.find(x => x[0] === a)[1]).join(', ') : 'None'}</b></div></div>
        <div className="coupon"><label htmlFor="bk-coupon">Have a coupon?</label><div className="cp-row"><input id="bk-coupon" value={code} onChange={e => setCode(e.target.value)} placeholder="e.g. LASTMINUTE" autoCapitalize="characters" /><button type="button" className="btn btn-ghost btn-sm" onClick={applyCoupon}>Apply</button></div><p id="bk-cmsg" className={cx('cmsg', cmsg.cls)} aria-live="polite">{cmsg.text}</p></div>
        <p className="pl-l">Pay 25% advance ({inr(c.adv)}) with</p><div className="ropts three">{PAY_METHODS.map(([k, t, x]) => <label className="ropt" key={k}><input type="radio" name="bk-pay" value={k} checked={s.pay === k} onChange={() => upd({ pay: k })} /><span><b>{t}</b><small>{x}</small></span></label>)}</div>
        <label className="chk" style={{ marginTop: '14px' }}><input type="checkbox" id="bk-tc" checked={tc} onChange={e => setTc(e.target.checked)} /> I accept the <Link href={PATHS.info('terms')} style={{ textDecoration: 'underline' }}>terms</Link> and <Link href={PATHS.info('cancellation')} style={{ textDecoration: 'underline' }}>cancellation policy</Link></label>
        <p className="err" id="bk-err" aria-live="polite">{err}</p><div className="pl-nav"><button type="button" className="btn btn-ghost" onClick={() => goStep(-1)}>Back</button><button type="button" className="btn btn-o" id="bk-pay" onClick={confirm}>Confirm &amp; pay {inr(c.adv)}</button></div>
        <p className="muted" style={{ fontSize: '12px', marginTop: '10px' }}>{SHIELD} Secure payment. Your trip expert confirms hotel availability before your advance is charged.</p></>
    );
  }

  return (
    <>
      <section className="bk-top"><div className="wrap"><nav className="crumbs dark"><Link href="/">Home</Link><span>/</span><Link href={PATHS.pkg(p.id)}>{p.title}</Link><span>/</span><span>Book</span></nav>
        <div className="bk-head"><img src={img(p.img)} alt="" decoding="async" /><div><h1>{p.title}</h1><p className="muted">{p.n}N/{p.n + 1}D · {p.route}</p></div></div>
        <ol className="bk-steps" id="bk-steps">{STEPS.map((t, i) => <li key={t} className={done ? (i === 3 ? 'on done' : 'done') : (cx(i === s.step && 'on', i < s.step && 'done') || undefined)}><span>{i + 1}</span>{t}</li>)}</ol></div></section>
      <section className="sec-tight"><div className="wrap layout"><div className="box" id="bk-body">{body}</div><aside className="side"><div className="box" id="bk-sum"><Summary p={p} intl={intl} s={s} /></div>{help}</aside></div></section>
    </>
  );
}
