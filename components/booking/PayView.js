'use client';
/* Payment pages (original payproof.js): /pay/ finds a booking (payFindPage + payFindInit); /pay/REF/ shows the
   amount choice, UPI QR / bank details and the payment-proof upload (payPage + payInit + payRedraw + paySubmit),
   or the "proof submitted" / paid / cancelled states. Bookings are read from this device (tp_db) after mount and
   refreshed from the backend (GET /booking/REF?phone=). */
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { I } from '@/components/icons';
import { img, inr, waLink, telHref, fmtDate, cx } from '@/lib/format';
import { PATHS, VIEW_PATHS } from '@/lib/routes';
import { DB } from '@/lib/client/storage';
import { post } from '@/lib/client/api';
import { useDeviceDB, useMounted } from '@/lib/client/hooks';
import { useUI } from '@/components/providers/UIProvider';
import { CopyButton } from '@/components/ui/buttons';
import { payCalc, payDigits, payMask, payNormUtr, upiLink, todayLocal, fromServer } from '@/lib/booking/calc';
import { payFetch, payLocal, paySave } from '@/lib/booking/device';
import { readProof } from '@/lib/booking/files';
import UpiQr from './UpiQr';

/* PAY — payment page state for this visit (kept when leaving and coming back to the same booking) */
const PAY = { route: null, cur: null, mode: 'UPI', amt: null, file: null, fileName: '', fileType: '', done: null, err: '', ref: null };
let fetchBusy = false;
const blankFields = b => ({ utr: '', pamt: null, date: todayLocal(), payer: (b && b.name) || '', note: '', app: 'Google Pay', ok: false, modeSel: PAY.mode });

/* ---------- find a booking ---------- */
function PayFind({ initialRef, pkgs, onDirect }) {
  const router = useRouter(), db = useDeviceDB();
  const [ref, setRef] = useState(initialRef || ''), [ph, setPh] = useState(''), [msg, setMsg] = useState('');
  const hasPkg = id => !!pkgs[id];
  const mine = db.bookings.filter(b => pkgs[b.pkg] && !b.cancelled && payCalc(b).due > 0).slice(0, 4);
  const onSubmit = async e => {
    e.preventDefault(); const R = payNormUtr(ref), P = payDigits(ph);
    if (!/^TP\d{2}[A-Z0-9]{5}$/.test(R)) return setMsg('Enter a booking reference like TP26AB12C.');
    if (!/^[6-9]\d{9}$/.test(P)) return setMsg('Enter the 10-digit mobile number used for the booking.');
    const loc = payLocal(R);
    if (loc && payDigits(loc.phone) === P) return router.push(PATHS.pay(R));
    setMsg('Checking…');
    try { const b = await payFetch(R, P, hasPkg); if (!payLocal(R)) { onDirect(b); return; } router.push(PATHS.pay(R)); } catch (err) { setMsg(err.message); }
  };
  return (
    <div className="py-find">
      <form className="box form" id="py-find" noValidate onSubmit={onSubmit}><h2>Find your booking</h2><p className="muted" style={{ margin: '-6px 0 4px' }}>Enter the booking reference from your confirmation (e.g. TP26AB12C) and the mobile number used for booking.</p>
        <label>Booking reference<input id="py-ref" value={ref} onChange={e => setRef(e.target.value)} placeholder="TP26XXXXX" autoComplete="off" style={{ textTransform: 'uppercase' }} required /></label>
        <label>Mobile number<input id="py-ph" type="tel" inputMode="numeric" maxLength={14} placeholder="10-digit mobile" autoComplete="tel" value={ph} onChange={e => setPh(e.target.value)} required /></label>
        <p className="err" id="py-ferr" role="alert">{msg}</p><button className="btn btn-o" type="submit">Continue to payment {I.arrow}</button></form>
      <div className="box py-side-help">{mine.length ? <><h3>Your bookings on this device</h3><div className="py-mine">{mine.map(b => { const p = pkgs[b.pkg], c = payCalc(b); return <Link key={b.ref} href={PATHS.pay(b.ref)}><img src={img(p.img)} alt="" decoding="async" /><span><b>{p.title}</b><small><span className="refno">{b.ref}</span> · due {inr(c.due)}</small></span>{I.arrow}</Link>; })}</div></> : <><h3>Got a payment link?</h3><p className="muted">Your trip expert shares a link like <b>trippartner.com/#pay-TP26XXXXX</b> on WhatsApp or email once hotels are confirmed. Open it, or enter the reference here.</p></>}
        <div className="py-safe">{I.shield}<p><b>Stay safe.</b> TripPartner never asks for your UPI PIN, OTP or card CVV, and never asks you to pay to a personal number. Pay only to the details on this page.</p></div></div>
    </div>
  );
}

/* copy button with an accessible name (bank detail rows) */
function RowCopy({ value, label }) {
  const ui = useUI();
  return <button type="button" className="btn btn-ghost btn-sm" data-copy={value} aria-label={label} onClick={() => (navigator.clipboard ? navigator.clipboard.writeText(value) : Promise.reject()).then(() => ui.toast('Copied')).catch(() => ui.toast('Copy not allowed in this browser'))}>Copy</button>;
}

const chip = s => <span className={`py-st ${s === 'Approved' ? 'ok' : s === 'Rejected' ? 'bad' : 'wait'}`}>{s === 'Approved' ? 'Verified' : s === 'Rejected' ? 'Rejected' : 'Under verification'}</span>;

function PaySummary({ b, p, c, CONFIG }) {
  const proofs = (b.proofs || []).slice().reverse();
  return (
    <aside className="py-aside"><div className="box py-sum"><div className="py-pk"><img src={img(p.img)} alt="" decoding="async" /><div><b>{p.title}</b><small>{b.date ? fmtDate(b.date) : ''}{b.ad ? ` · ${b.ad} adult${b.ad > 1 ? 's' : ''}${b.ch ? `, ${b.ch} child` : ''}` : ''}</small></div></div>
      <p className="py-ref">Booking <span className="refno">{b.ref}</span></p>
      <dl className="py-dl"><dt>Trip total</dt><dd className="num">{inr(c.total)}</dd><dt>Advance (25%)</dt><dd className="num">{inr(c.adv)}</dd><dt>Paid &amp; verified</dt><dd className="num py-g">{inr(c.paid)}</dd>{c.pending ? <><dt>Under verification</dt><dd className="num py-w">{inr(c.pending)}</dd></> : null}<dt className="py-due">Balance due</dt><dd className="num py-due">{inr(c.due)}</dd></dl>
      <div className="py-bar" aria-hidden="true"><i style={{ width: `${c.total ? Math.min(100, c.paid / c.total * 100) : 0}%` }}></i><em style={{ width: `${c.total ? Math.min(100, c.pending / c.total * 100) : 0}%` }}></em></div></div>
      <div className="box"><h3>Payment history</h3>{proofs.length ? <ul className="py-hist">{proofs.map(x => (
        <li key={x.id}><div><b className="num">{inr(x.approved || x.amount)}</b> · {x.mode}<small>UTR {payMask(x.utr)} · paid {fmtDate(x.paidAt)}</small>{x.status === 'Rejected' && x.reason ? <small className="py-why">Reason: {x.reason} — please upload a correct proof.</small> : null}</div>{chip(x.status)}{x.status === 'Approved' && x.receipt ? <Link className="btn btn-ghost btn-sm" href={PATHS.receipt(b.ref, x.id)}>Receipt</Link> : null}</li>
      ))}</ul> : <p className="muted" style={{ fontSize: '14px' }}>No payments yet.</p>}</div>
      <div className="box py-help"><h3>Need help?</h3><p className="muted">Payment done but stuck? Share your booking reference with us.</p><div className="py-hb"><a className="btn btn-wa btn-sm" href={waLink(CONFIG, `Hi TripPartner, I need help with payment for booking ${b.ref}.`)} target="_blank" rel="noopener">{I.wa} WhatsApp</a><a className="btn btn-ghost btn-sm" href={telHref(CONFIG.phone)}>{I.phone} Call</a></div>
        <div className="py-safe">{I.shield}<p>We never ask for your UPI PIN, OTP or CVV. Pay only to the account shown here.</p></div></div></aside>
  );
}

/* ---------- pay + upload proof for one booking ---------- */
function PayBooking({ b, pkgs, pay: cfg, CONFIG }) {
  const ui = useUI();
  const [, bump] = useState(0);
  const set = patch => { Object.assign(PAY, patch); bump(x => x + 1); };
  const [f, setF] = useState(() => blankFields(b));
  const [otherSel, setOtherSel] = useState(false), [oamt, setOamt] = useState(null), [over, setOver] = useState(false), [busy, setBusy] = useState(false);
  const oRef = useRef(null), errRef = useRef(null);
  const p = pkgs[b.pkg] || { title: b.pkgTitle || b.pkg, img: 'group-lake', n: 0 }, c = payCalc(b);
  PAY.cur = b;
  if (PAY.amt == null || PAY.amt > c.due || PAY.ref !== b.ref) { PAY.amt = c.advDue || c.due; PAY.ref = b.ref; }
  const amt = Math.max(0, Math.round(PAY.amt || 0));
  const fld = k => e => setF(v => ({ ...v, [k]: e.target.value }));
  const summary = <PaySummary b={b} p={p} c={c} CONFIG={CONFIG} />;

  if (b.cancelled) return <div className="py-grid"><div className="box"><h2>This booking is cancelled</h2><p className="muted">Please don’t make any payment. Contact us if you think this is a mistake.</p></div>{summary}</div>;
  if (PAY.done && PAY.done.ref === b.ref) {
    const d = PAY.done;
    return (
      <div className="py-grid"><div className="box py-done"><span className="tick">{I.tick}</span><h2>Payment proof submitted</h2><p>Proof ID <b className="refno">{d.id}</b> · {inr(d.amount)} · UTR {payMask(d.utr)}</p>
        <ol className="track py-track"><li className="done"><span>{I.tick}</span><small>Proof submitted</small></li><li className="cur"><span>2</span><small>Accounts team verifies</small></li><li><span>3</span><small>Receipt &amp; booking updated</small></li></ol>
        <p className="muted">Our accounts team matches this with the bank statement within {cfg.tat}. You’ll get an update on WhatsApp / SMS, and the receipt appears in My Trips.</p>
        <div className="pl-nav" style={{ justifyContent: 'center' }}><Link className="btn btn-o" href={VIEW_PATHS.account}>View in My Trips</Link><a className="btn btn-wa" href={waLink(CONFIG, `Hi TripPartner, I have paid ${inr(d.amount)} for booking ${b.ref}. UTR ${d.utr}. Proof ID ${d.id}.`)} target="_blank" rel="noopener">{I.wa} Inform on WhatsApp</a><button type="button" className="btn btn-ghost" onClick={() => { set({ done: null }); setF(blankFields(b)); setOtherSel(false); setOamt(null); }}>Upload another payment</button></div></div>{summary}</div>
    );
  }
  if (!c.due) return <div className="py-grid"><div className="box py-done"><span className="tick">{I.tick}</span><h2>{c.pending ? 'Your payment is under verification' : 'Fully paid — thank you!'}</h2><p className="muted">{c.pending ? `We’ll verify ${inr(c.pending)} within ${cfg.tat} and send your receipt.` : 'Nothing is due on this booking. Your receipts are in the payment history.'}</p><div className="pl-nav" style={{ justifyContent: 'center' }}><Link className="btn btn-o" href={VIEW_PATHS.account}>Go to My Trips</Link></div></div>{summary}</div>;

  const opts = [];
  if (c.advDue && c.advDue < c.due) opts.push(['adv', c.advDue, 'Advance', 'Confirms your booking']);
  opts.push(['full', c.due, c.paid || c.pending ? 'Balance' : 'Full amount', c.paid || c.pending ? 'Clear the remaining amount' : 'Pay the whole trip now']);
  const other = !opts.some(o => o[1] === amt), otherOn = other || otherSel;
  const setAmt = v => { const a = Math.max(0, Math.round(+v || 0)); set({ amt: a }); setF(x => ({ ...x, pamt: a || '' })); };
  const commitOther = () => { if (oamt == null || oamt === '') return; const v = Math.min(c.due, Math.max(1, Math.round(+oamt || 0))); setOamt(String(v)); setAmt(v); };
  const upi = upiLink(cfg, amt, b.ref);
  const step = (n, t) => <h2 className="py-h"><span>{n}</span>{t}</h2>;
  const isUpi = PAY.mode === 'UPI';
  const pamt = f.pamt == null ? (amt || '') : f.pamt;

  const take = async file => {
    set({ err: '' });
    try { if (!file) return; const r = await readProof(file); set({ file: r.file, fileType: r.fileType, fileName: r.fileName }); }
    catch (err) { set({ err: err.message }); }
  };
  const fail = m => { set({ err: m }); setTimeout(() => errRef.current && errRef.current.scrollIntoView({ block: 'center', behavior: 'smooth' }), 0); };
  const submit = async e => {
    e.preventDefault();
    const mode = f.modeSel, utr = payNormUtr(f.utr), amount = Math.round(+pamt || 0), paidAt = f.date;
    if (mode === 'UPI' ? !/^\d{12}$/.test(utr) : !/^[A-Z0-9]{6,22}$/.test(utr)) return fail(mode === 'UPI' ? 'Enter the 12-digit UPI transaction ID (UTR) from your payment app.' : 'Enter the UTR / reference number (6–22 letters or digits).');
    if (!(amount > 0)) return fail('Enter the amount you paid.');
    if (c.total && amount > c.due + 1) return fail(`The amount is more than the balance due (${inr(c.due)}).`);
    if (!paidAt || paidAt > todayLocal()) return fail('Choose the date of the payment.');
    if (!PAY.file) return fail('Add the screenshot of the successful payment (or the bank receipt PDF).');
    if (!f.ok) return fail('Please confirm the payment details.');
    const used = (DB.get().bookings || []).some(x => (x.proofs || []).some(q => payNormUtr(q.utr) === utr && q.status !== 'Rejected'));
    if (used) return fail('This transaction ID has already been submitted.');
    const body = { phone: b.phone, mode, utr, amount, paidAt, payer: f.payer.trim(), app: f.app, note: f.note.trim(), file: PAY.file };
    setBusy(true);
    try {
      const d = await post(`/bookings/${encodeURIComponent(b.ref)}/proof`, body).catch(err => { throw new Error(err.message && err.message !== 'Request failed' ? err.message : 'Could not submit right now — please try again.'); });
      const nb = fromServer(d.booking, b.phone); paySave(b.ref, { status: nb.status, paid: nb.paid, proofs: nb.proofs, payments: nb.payments });
      set({ done: { ref: b.ref, id: d.id, amount, utr }, file: null, fileName: '', err: '', amt: null });
      setBusy(false); setF(blankFields(b)); setOtherSel(false); setOamt(null);
      scrollTo({ top: 0, behavior: 'instant' }); ui.toast('Payment proof submitted');
    } catch (err) { setBusy(false); fail(err.message); }
  };

  const upiTab = (
    <div className="py-upi"><div className="py-qr"><UpiQr text={upi} />{cfg.sample ? <span className="py-qr-s">SAMPLE</span> : null}</div>
      <div className="py-upi-b"><p className="py-amt">Scan &amp; pay <b className="num">{inr(amt)}</b></p><p className="muted">Open any UPI app → Scan QR → check the name shows <b>{cfg.payee}</b> → pay.</p>
        <div className="py-apps"><span>Google Pay</span><span>PhonePe</span><span>Paytm</span><span>BHIM</span><span>Bank UPI apps</span></div>
        <a className="btn btn-o py-open" href={upi} aria-disabled={cfg.sample ? 'true' : undefined} onClick={cfg.sample ? e => { e.preventDefault(); ui.toast('Sample UPI ID — add your real UPI ID in Admin → Site settings before going live'); } : undefined}>Pay {inr(amt)} with a UPI app</a>
        <div className="py-copy"><span>UPI ID</span><b className="num">{cfg.upi}</b><CopyButton className="btn btn-ghost btn-sm" value={cfg.upi} /></div>
        <p className="py-note">Add <b>{b.ref}</b> in the payment note. After paying, open the payment in your app and copy the 12-digit <b>UPI transaction ID / UTR</b>.</p></div></div>
  );
  const bk = cfg.bank, row = (k, v) => <tr key={k}><th>{k}</th><td className="num">{v}</td><td><RowCopy value={v} label={`Copy ${k}`} /></td></tr>;
  const bankTab = (
    <div className="py-bank"><p className="py-amt">Transfer <b className="num">{inr(amt)}</b> by NEFT / IMPS / RTGS</p><table className="py-bt"><tbody>{row('Account name', bk.acName)}{row('Account number', bk.acNo)}{row('IFSC', bk.ifsc)}{row('Bank', bk.name)}{row('Branch', bk.branch)}{row('Remarks', b.ref)}</tbody></table>
      <p className="py-note">{bk.type}. Use <b>{b.ref}</b> as the remark. After the transfer, note the <b>UTR / reference number</b> from your bank’s confirmation.</p></div>
  );

  return (
    <>
      <ol className="bk-steps py-steps"><li className="on"><span>1</span>Amount</li><li className="on"><span>2</span>Pay</li><li><span>3</span>Upload proof</li><li><span>4</span>Verification</li></ol>
      <div className="py-grid"><div className="py-main">
        <div className="box">{step(1, 'Choose amount')}<div className="ropts py-amts">{opts.map(([k, v, t, s]) => <label className="ropt" key={k}><input type="radio" name="py-amt" value={v} checked={!otherOn && v === amt} onChange={() => { setOtherSel(false); setOamt(''); setAmt(v); }} /><span><b className="num">{inr(v)}</b><small>{t} · {s}</small></span></label>)}
          <label className="ropt py-oth"><input type="radio" name="py-amt" value="other" checked={otherOn} onChange={() => { setOtherSel(true); if (oRef.current) oRef.current.focus(); if (+oamt > 0) commitOther(); }} /><span><b>Other amount</b><small>Part payment agreed with your expert</small><input type="number" id="py-oamt" ref={oRef} min="1" max={c.due} value={oamt == null ? (other ? amt : '') : oamt} placeholder="₹ amount" inputMode="numeric" aria-label="Other amount" onFocus={() => setOtherSel(true)} onChange={e => setOamt(e.target.value)} onBlur={commitOther} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); commitOther(); } }} /></span></label></div>
          {c.pending ? <p className="py-note">{inr(c.pending)} is already under verification and is not counted again.</p> : null}</div>
        <div className="box">{step(2, 'Pay to TripPartner')}{cfg.sample ? <span className="py-sample">Sample details — replace before going live</span> : null}<div className="py-tabs" role="tablist">{[['UPI', 'UPI / QR'], ['Bank transfer', 'Bank transfer']].map(([k, l]) => <button key={k} type="button" role="tab" aria-selected={PAY.mode === k ? 'true' : 'false'} onClick={() => { set({ mode: k }); setF(v => ({ ...v, modeSel: k })); }}>{l}</button>)}</div>
          <div id="py-pane">{isUpi ? upiTab : bankTab}</div>
          <p className="py-note py-cards">{I.wallet} Want to pay by card, net banking or EMI? <a href={waLink(CONFIG, `Hi TripPartner, please send a card / net-banking payment link for booking ${b.ref} (${inr(amt)}).`)} target="_blank" rel="noopener">Ask for a secure payment link</a>.</p></div>
        <form className="box form py-form" id="py-form" noValidate onSubmit={submit}>{step(3, 'Upload payment proof')}<p className="muted" style={{ margin: '-6px 0 2px' }}>Upload the screenshot of the successful payment and enter its transaction ID — we match it with our bank statement.</p>
          <div className="row2"><label>Paid via<select id="py-mode" value={f.modeSel} onChange={e => { const v = e.target.value; if (v !== 'Other') set({ mode: v }); setF(x => ({ ...x, modeSel: v })); }}>{['UPI', 'Bank transfer', 'Other'].map(x => <option key={x}>{x}</option>)}</select></label>
            <label>{isUpi ? 'UPI transaction ID / UTR (12 digits)' : 'UTR / bank reference number'}<input id="py-utr" autoComplete="off" inputMode={isUpi ? 'numeric' : 'text'} maxLength={22} placeholder={isUpi ? 'e.g. 4285 1234 5678' : 'e.g. HDFCN52026101912345'} required value={f.utr} onChange={e => { let v = e.target.value; if (f.modeSel === 'UPI') { const d = v.replace(/\D/g, '').slice(0, 12); v = d.replace(/(\d{4})(?=\d)/g, '$1 '); } setF(x => ({ ...x, utr: v })); }} /></label></div>
          <div className="row2"><label>Amount paid (₹)<input id="py-pamt" type="number" min="1" max={c.due} value={pamt} onChange={fld('pamt')} inputMode="numeric" required /></label><label>Payment date<input id="py-date" type="date" max={todayLocal()} value={f.date} onChange={fld('date')} required /></label></div>
          <div className="row2"><label>Payer name (as in bank / UPI)<input id="py-payer" value={f.payer} onChange={fld('payer')} autoComplete="name" /></label><label>App / bank used<select id="py-app" value={f.app} onChange={fld('app')}>{['Google Pay', 'PhonePe', 'Paytm', 'BHIM', 'Bank app / net banking', 'Other'].map(x => <option key={x}>{x}</option>)}</select></label></div>
          <label className={cx('py-file', PAY.file && 'done', over && 'over')} id="py-drop" onDragEnter={e => { e.preventDefault(); setOver(true); }} onDragOver={e => { e.preventDefault(); setOver(true); }} onDragLeave={e => { e.preventDefault(); setOver(false); }} onDrop={e => { e.preventDefault(); setOver(false); take(e.dataTransfer.files[0]); }}>
            <input type="file" id="py-fileinp" accept="image/jpeg,image/png,image/webp,application/pdf" onChange={e => { take(e.target.files[0]); e.target.value = ''; }} />
            <span className="py-fz" id="py-fz">{PAY.file ? (PAY.fileType === 'pdf' ? <><span className="py-pdf">PDF</span><b>{PAY.fileName}</b><small>Tap to change</small></> : <><img src={PAY.file} alt="Payment screenshot preview" /><small>{PAY.fileName} · tap to change</small></>) : <>{I.plan}<b>Add payment screenshot</b><small>JPG, PNG or PDF · max 3 MB · drag &amp; drop or tap to choose</small></>}</span></label>
          <label>Note for our team (optional)<textarea id="py-note" maxLength={300} placeholder="e.g. Paid from my father’s account" value={f.note} onChange={fld('note')}></textarea></label>
          <label className="chk"><input type="checkbox" id="py-ok" checked={f.ok} onChange={e => setF(x => ({ ...x, ok: e.target.checked }))} /> I confirm this payment was made to TripPartner for booking {b.ref}, and the details above are correct.</label>
          <p className="err" id="py-err" role="alert" ref={errRef}>{PAY.err || ''}</p>
          <button className="btn btn-o" type="submit" id="py-sub" disabled={busy}>{busy ? 'Submitting…' : <>Submit payment proof {I.arrow}</>}</button>
          <p className="py-note" style={{ textAlign: 'center' }}>Your booking is counted as paid only after our team verifies the amount in our account ({cfg.tat}).</p></form>
      </div>{summary}</div>
    </>
  );
}

/* bookingRef: '' for /pay/, else the reference from the URL. pay: payment details; CONFIG: { phone, whatsapp } */
export default function PayView({ bookingRef, pkgs, pay, CONFIG }) {
  const db = useDeviceDB(), mounted = useMounted();
  const [direct, setDirect] = useState(null);
  const loc = bookingRef ? db.bookings.find(b => b.ref === bookingRef) : null;
  /* opening another booking starts a fresh payment (original router) */
  if (mounted && bookingRef && PAY.route !== bookingRef) { PAY.route = bookingRef; if (PAY.ref !== bookingRef) Object.assign(PAY, { done: null, file: null, fileName: '', err: '', amt: null }); }
  useEffect(() => {
    if (!bookingRef) return;
    const l = payLocal(bookingRef);
    if (l && l.phone && !fetchBusy) { fetchBusy = true; payFetch(bookingRef, l.phone, id => !!pkgs[id]).catch(() => { /* offline: device copy */ }).finally(() => { setTimeout(() => { fetchBusy = false; }, 4000); }); }
  }, [bookingRef, pkgs]);
  const b = direct || (mounted ? loc : null);
  return b ? <PayBooking b={b} pkgs={pkgs} pay={pay} CONFIG={CONFIG} /> : <PayFind key={bookingRef} initialRef={bookingRef} pkgs={pkgs} onDirect={setDirect} />;
}
