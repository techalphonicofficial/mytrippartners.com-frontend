'use client';
/* Plan My Trip wizard (original extra.js PL, openPlanner, drawPlanner, plannerClick): 5 quick questions in the
   site modal → an enquiry ("Trip Planner: <destination>") saved on the device (My Trips) and sent to the
   dashboard, a WhatsApp brief, and up to 3 matching packages (the search results for the destination).
   Opened from any button with ui.open('planner', dest). */
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useUI } from '@/components/providers/UIProvider';
import { I } from '@/components/icons';
import { CopyButton } from '@/components/ui/buttons';
import { img, inr, waLink, cx } from '@/lib/format';
import { PATHS } from '@/lib/routes';
import { DB } from '@/lib/client/storage';
import { send } from '@/lib/client/api';
import { useSite } from '@/lib/client/hooks';
import { searchItems } from '@/lib/booking/search';

const STEPS = 5;
const DESTS = ['Kashmir', 'Kerala', 'Goa', 'Char Dham', 'Bali', 'Thailand', 'Dubai', 'Not sure — suggest me'];
const fresh = pre => ({ dest: pre || '', month: '', nights: '5–6', ad: 2, ch: 0, from: 'New Delhi', budget: '₹25k–50k', hotel: 'Deluxe', themes: [], name: '', phone: '', email: '' });
const plannerMonths = () => Array.from({ length: 9 }, (_, i) => { const x = new Date(); x.setDate(1); x.setMonth(x.getMonth() + i); return x.toLocaleString('en-IN', { month: 'short', year: 'numeric' }); });

function Wizard({ pre, CONFIG }) {
  const ui = useUI(), S = useSite();
  const [st, setSt] = useState(0), [d, setD] = useState(() => fresh(pre)), [err, setErr] = useState(''), [done, setDone] = useState(null);
  const [months] = useState(plannerMonths);
  const upd = patch => setD(v => ({ ...v, ...patch }));
  const chips = (k, opts, multi) => (
    <div className="pchips">{opts.map(o => { const on = multi ? d[k].includes(o) : d[k] === o; return <button key={o} type="button" className={on ? 'on' : ''} data-multi={multi ? '' : undefined} onClick={() => upd({ [k]: multi ? (d[k].includes(o) ? d[k].filter(x => x !== o) : [...d[k], o]) : o })}>{o}</button>; })}</div>
  );
  const count = k => <div className="est-row"><span>{k === 'ad' ? 'Adults' : 'Children'}</span><div className="step"><button type="button" onClick={() => upd({ [k]: Math.max(k === 'ad' ? 1 : 0, Math.min(30, d[k] - 1)) })}>−</button><output>{d[k]}</output><button type="button" onClick={() => upd({ [k]: Math.max(k === 'ad' ? 1 : 0, Math.min(30, d[k] + 1)) })}>+</button></div></div>;

  const finish = () => {
    const name = d.name.trim(), phone = d.phone.trim(), email = d.email.trim(); upd({ name, phone, email });
    if (!name) return setErr('Please enter your name.');
    if (!/^[6-9]\d{9}$/.test(phone.replace(/\D/g, '').slice(-10))) return setErr('Please enter a valid 10-digit mobile number.');
    const txt = `Hi TripPartner, please plan my trip:\nDestination: ${d.dest || 'Suggest me'}\nMonth: ${d.month || 'Flexible'} · ${d.nights} nights\nTravellers: ${d.ad} adult(s), ${d.ch} child(ren) from ${d.from}\nBudget: ${d.budget} pp · ${d.hotel} hotels\nInterests: ${d.themes.join(', ') || '—'}\nName: ${name}\nMobile: ${phone}${email ? `\nEmail: ${email}` : ''}`;
    const lead = { subject: 'Trip Planner: ' + (d.dest || 'Suggest me'), name, phone, email, month: d.month, pax: `${d.ad}A ${d.ch}C`, msg: `${d.nights} nights · ${d.budget} · ${d.hotel}` };
    DB.addLead(lead);
    send('/leads', { ...lead, source: 'Plan My Trip', page: location.pathname });
    const m = S && d.dest ? searchItems(S, { q: d.dest.replace('Not sure — suggest me', '') }).slice(0, 3) : [];
    setDone({ first: name.split(' ')[0], txt, m });
  };
  const go = dir => {
    if (st === 4 && dir === 1) return finish();
    if (st === 0) upd({ dest: d.dest.trim() });
    setErr(''); setSt(Math.max(0, Math.min(4, st + dir)));
  };

  if (done) return (
    <div id="plw"><div className="ok"><span className="tick">{I.tick}</span><h3>Your trip brief is ready, {done.first}</h3><p className="muted">Send it to our travel desk on WhatsApp and a trip expert will build your itinerary.</p><a className="btn btn-wa" href={waLink(CONFIG, done.txt)} target="_blank" rel="noopener">{I.wa} Send on WhatsApp</a><div className="copyline">Or call <code>{CONFIG.phone}</code><CopyButton value={CONFIG.phone} /></div></div>
      {done.m.length ? <><p className="pl-l" style={{ marginTop: '22px' }}>Packages that match</p><div style={{ display: 'grid', gap: '10px' }}>{done.m.map(p => <Link key={p.id} className="mini-g" href={PATHS.pkg(p.id)} onClick={ui.closeModal}><img src={img(p.img)} alt="" /><span><b>{p.title}</b><br /><small className="muted">{p.n}N/{p.n + 1}D · from {inr(p.price)}</small></span></Link>)}</div></> : null}</div>
  );

  const steps = [
    ['Where do you want to go?', <><label className="form"><span className="sr">Destination</span><input id="pl-dest" value={d.dest} onChange={e => upd({ dest: e.target.value })} placeholder="Type a destination, e.g. Kashmir" autoComplete="off" /></label><p className="muted" style={{ fontSize: '13px', margin: '12px 0 8px' }}>Popular picks</p>{chips('dest', DESTS)}</>],
    ['When and for how long?', <><p className="pl-l">Month of travel</p>{chips('month', [...months, 'Flexible'])}<p className="pl-l">Trip length</p>{chips('nights', ['2–3', '4–5', '5–6', '7–9', '10+'])}</>],
    ['Who is travelling?', <>{count('ad')}{count('ch')}<p className="pl-l">Departing from</p>{chips('from', ['New Delhi', 'Mumbai', 'Bengaluru', 'Kolkata', 'Chennai', 'Hyderabad', 'Patna', 'Other'])}</>],
    ['Budget and style', <><p className="pl-l">Budget per person</p>{chips('budget', ['Under ₹15k', '₹15k–25k', '₹25k–50k', '₹50k–1L', '₹1L+'])}<p className="pl-l">Hotels</p>{chips('hotel', ['Standard', 'Deluxe', 'Premium', 'Luxury'])}<p className="pl-l">Interests (pick any)</p>{chips('themes', ['Sightseeing', 'Adventure', 'Honeymoon', 'Spiritual', 'Beach', 'Snow', 'Shopping', 'Food'], true)}</>],
    ['Where should we send your plan?', <div className="form"><label>Full name<input id="pl-name" value={d.name} onChange={e => upd({ name: e.target.value })} autoComplete="name" /></label><div className="row2"><label>Mobile number<input id="pl-phone" value={d.phone} onChange={e => upd({ phone: e.target.value })} inputMode="tel" autoComplete="tel" /></label><label>Email (optional)<input id="pl-email" value={d.email} onChange={e => upd({ email: e.target.value })} type="email" autoComplete="email" /></label></div><p className="err" id="pl-err" aria-live="polite">{err}</p></div>],
  ];
  const [h, body] = steps[st];
  return (
    <div id="plw"><div className="pl-prog"><span style={{ width: `${(st + 1) / STEPS * 100}%` }}></span></div><p className="pl-step">Step {st + 1} of {STEPS}</p><h3 className="pl-h">{h}</h3>{body}
      <div className="pl-nav">{st ? <button type="button" className="btn btn-ghost" onClick={() => go(-1)}>Back</button> : <span></span>}<button type="button" className={cx('btn', 'btn-o')} onClick={() => go(1)}>{st === STEPS - 1 ? 'Get my plan' : 'Next'} {I.arrow}</button></div></div>
  );
}

export default function Planner({ CONFIG }) {
  const ui = useUI();
  useEffect(() => ui.register('planner', pre => ui.openModal(<Wizard key={Date.now()} pre={pre || ''} CONFIG={CONFIG} />, 'Plan My Trip', 'Answer 5 quick questions — get a custom itinerary')), [ui, CONFIG]);
  return null;
}
