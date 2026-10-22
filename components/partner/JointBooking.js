'use client';
/* "Book a trip together" form + live price summary (original jointPage / jointInit / jointDraw / jointCalc).
   The form is uncontrolled like the original (values are read on every change); choices are kept in JB
   while the visitor browses. Presets: ?p=<package id> ?b=<traveller id>. */
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useUI } from '@/components/providers/UIProvider';
import { I } from '@/components/icons';
import { img, inr } from '@/lib/format';
import { VIEW_PATHS } from '@/lib/routes';
import { monthOptions } from '@/lib/months';
import { HOTELS, jointCalc, firstName } from '@/lib/partner/core';
import { PS, JB } from '@/lib/partner/state';
import { usePData, usePS } from './client';

const withPreset = (j, preset, pkgs) => ({ ...j, ...(preset.b ? { b: preset.b } : {}), pkg: preset.p || j.pkg || pkgs[0].id });

function Radio({ name, val, title, sub, checked }) {
  return <label className="ropt"><input type="radio" name={name} value={val} defaultChecked={checked} /><span><b>{title}</b><small>{sub}</small></span></label>;
}

export default function JointBooking({ preset, aside }) {
  const pd = usePData(), st = usePS(), ui = useUI();
  const [j0] = useState(() => {
    const fresh = { pkg: '', b: '', room: 'separate', pay: 'split', seat: true, hotel: 'std', c1: false, c2: false, month: '' };
    if (typeof window === 'undefined') return withPreset(fresh, preset, pd.pkgs);
    const v = withPreset(JB.touched ? JB.get() : fresh, preset, pd.pkgs); JB.set(v); JB.touched = true; return v;
  });
  const [j, setJ] = useState(j0);
  const [err, setErr] = useState('');
  const form = useRef(null);
  const B = id => pd.buddies.find(b => b.id === id);
  const partners = [...new Set([...st.req.map(r => r.b), ...pd.buddies.map(b => b.id)])].map(B).filter(Boolean);

  const sync = () => {
    const f = form.current, q = s => f.querySelector(s);
    const v = { ...JB.get(), pkg: q('#jb-pkg').value, b: q('#jb-b').value, hotel: q('#jb-hotel').value, month: q('#jb-month').value, seat: (q('input[name=seat]:checked') || {}).value === 'true', room: q('input[name=room]:checked').value, pay: q('input[name=pay]:checked').value, c1: q('#jb-c1').checked };
    JB.set(v); setJ(v);
  };
  /* the seat choice is applied after render (as jointInit did), then the summary reads the form */
  useEffect(() => { form.current.querySelectorAll('input[name=seat]').forEach(r => { r.checked = (r.value === 'true') === j0.seat; }); sync(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const p = pd.pkgs.find(x => x.id === j.pkg) || pd.pkgs[0], c = jointCalc(j, p), b = B(j.b);
  const pn = b ? firstName(b.name) : j.b === 'friend' ? 'Your partner' : 'Partner';
  const onSend = () => {
    const f = form.current;
    if (!j.b) { setErr('Please choose your travel partner (step 2).'); f.querySelector('#jb-b').focus(); return; }
    if (j.room === 'shared' && !f.querySelector('#jb-c1').checked) { setErr('For a shared room, please confirm your consent in step 4 — or choose separate rooms.'); f.querySelector('#jb-c1').focus(); return; }
    setErr(''); const s = PS.get();
    const x = { id: Date.now().toString(36), pkg: c.p.id, b: j.b, month: f.querySelector('#jb-month').value, hotel: j.hotel, seat: j.seat, room: j.room, pay: j.pay, total: c.total, you: c.you, them: c.them, status: 'Waiting for partner', at: new Date().toISOString() };
    PS.set({ ...s, book: [x, ...s.book] });
    ui.openModal(<div className="ok"><span className="tick">{I.tick}</span><h3>Proposal sent to {pn}</h3><p className="muted">{pn} will review the trip, seats, room choice and payment split. Nothing is booked or charged until both of you accept.</p><Link className="btn btn-o" href={VIEW_PATHS['partner-requests']} onClick={() => ui.closeModal()}>Track proposal</Link></div>, 'Booking proposal');
  };

  return (
    <section className="sec"><div className="wrap layout"><form className="jb" id="jbf" style={{ display: 'grid', gap: '18px', minWidth: '0' }} ref={form} onChange={sync} onSubmit={e => e.preventDefault()}>
      <div className="box"><h3><span className="jn">1</span> Choose your trip</h3><select id="jb-pkg" className="big-sel" defaultValue={j0.pkg} aria-label="Choose your trip">{pd.pkgs.map(x => <option key={x.id} value={x.id}>{x.title} — {x.n}N/{x.n + 1}D · from {inr(x.price)} pp</option>)}</select>
        <div className="row2" style={{ marginTop: '12px' }}><label className="lbl">Travel month<select id="jb-month" defaultValue={j0.month || undefined}>{monthOptions()}</select></label><label className="lbl">Hotel category<select id="jb-hotel" defaultValue={j0.hotel}>{HOTELS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></label></div></div>
      <div className="box"><h3><span className="jn">2</span> Your travel partner</h3><select id="jb-b" className="big-sel" defaultValue={j0.b} aria-label="Choose your travel partner"><option value="">Select a partner{pd.demo ? ' (sample profiles)' : ''}</option>{partners.map(x => <option key={x.id} value={x.id}>{x.name} · {x.age} · {x.city}</option>)}<option value="friend">Someone I already know (invite by mobile)</option></select>
        <p className="muted" style={{ fontSize: '13px', marginTop: '8px' }}>Your partner receives the proposal and must accept it from their own account before anything is booked.</p></div>
      <div className="box"><h3><span className="jn">3</span> Seats</h3><div className="ropts"><Radio name="seat" val="true" title="Sit together" sub="Adjacent seats on flights, trains & coaches (subject to availability)" checked={false} /><Radio name="seat" val="false" title="No preference" sub="Any available seats" checked={false} /></div></div>
      <div className="box"><h3><span className="jn">4</span> Room</h3><div className="ropts"><Radio name="room" val="separate" title="Separate rooms" sub="Each traveller gets a private room (+ single supplement)" checked={j0.room === 'separate'} /><Radio name="room" val="shared" title="Shared room" sub="Twin/double room — booked only if both agree" checked={j0.room === 'shared'} /></div>
        <div id="jb-consent" hidden={j.room !== 'shared'} className="consent"><label className="chk"><input type="checkbox" id="jb-c1" defaultChecked={j0.c1} /> I agree to share a room with my travel partner on this trip</label><p className="cstat">{I.clock} Partner&apos;s consent: <b>pending</b> — asked when they open the proposal</p><p className="muted" style={{ fontSize: '12.5px' }}>Either traveller can switch to separate rooms any time before final payment. Both travellers must carry a valid government photo ID at hotel check-in.</p></div></div>
      <div className="box"><h3><span className="jn">5</span> Who pays?</h3><div className="ropts"><Radio name="pay" val="me" title="I pay for both" sub="One booking, one payment by you" checked={j0.pay === 'me'} /><Radio name="pay" val="partner" title="Partner pays for both" sub="Your partner gets the payment link" checked={j0.pay === 'partner'} /><Radio name="pay" val="split" title="Split 50 / 50" sub="One booking, two payment links" checked={j0.pay === 'split'} /><Radio name="pay" val="individual" title="Book individually" sub="Two separate bookings on the same departure" checked={j0.pay === 'individual'} /></div></div>
    </form>
    <aside className="side"><div className="box jb-sum" id="jb-sum"><img src={img(c.p.img)} alt="" className="jb-img" decoding="async" /><h3 style={{ margin: '12px 0 2px' }}>{c.p.title}</h3><p className="muted" style={{ fontSize: '13px' }}>{c.p.n}N/{c.p.n + 1}D · {c.p.route}</p>
      <div className="jb-people"><span>{I.users} You + {pn}</span><span>{j.seat ? 'Seats together' : 'Any seats'}</span><span>{j.room === 'shared' ? 'Shared room' : 'Separate rooms'}</span></div>
      <table className="jb-t"><tbody><tr><td>Package × 2 travellers</td><td className="num">{inr(c.pp * 2)}</td></tr>{c.sup ? <tr><td>Single-room supplement × 2</td><td className="num">{inr(c.sup * 2)}</td></tr> : null}<tr className="tot"><td>Estimated total</td><td className="num">{inr(c.total)}</td></tr>
        <tr><td>You pay</td><td className="num"><b>{inr(c.you)}</b></td></tr><tr><td>{pn} pays</td><td className="num"><b>{inr(c.them)}</b></td></tr></tbody></table>
      <p className="muted" style={{ fontSize: '12px' }}>{j.pay === 'individual' ? 'Two separate bookings; each confirmed with a 25% advance.' : `Confirm with 25% advance (${inr(c.adv)}); balance 21 days before travel.`} Indicative price; final quote confirmed by your trip expert.</p>
      <p className="err" id="jb-err" aria-live="polite">{err}</p><button className="btn btn-o" style={{ width: '100%' }} id="jb-send" onClick={onSend}>Send booking proposal</button></div>{aside}</aside></div></section>
  );
}
