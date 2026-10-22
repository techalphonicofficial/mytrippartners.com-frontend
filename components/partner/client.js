'use client';
/* Travel Partner client building blocks: data context, device-state hooks, traveller card, request modal,
   shortlist button, smart match quiz, share button (original buddyCard, openRequest, openMatchQuiz, partnerClick). */
import { createContext, useContext, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useUI } from '@/components/providers/UIProvider';
import { I } from '@/components/icons';
import { img } from '@/lib/format';
import { PATHS, VIEW_PATHS } from '@/lib/routes';
import { monthOptions } from '@/lib/months';
import { useStoreValue } from '@/lib/client/hooks';
import { STYLES, BUDS, PACES, DIETS, myPrefs, firstName } from '@/lib/partner/core';
import { psStore, pqStore, PS, PQ, PF, shortlist } from '@/lib/partner/state';
import Avatar from './Avatar';
import { PAvatar, MatchPill } from './blocks';

/* ---------- data + device state ---------- */
const Ctx = createContext(null);
/* value = partnerData(S): { demo, buddies, dests: {id: {n, name, img}}, destOrder, pkgs } */
export function PartnerData({ value, children }) { return <Ctx.Provider value={value}>{children}</Ctx.Provider>; }
export const usePData = () => useContext(Ctx);

const EMPTY = { me: null, req: [], book: [] };
/* tp_partner (empty during server render and hydration, then the device copy) */
export function usePS() { const v = useStoreValue(psStore) || EMPTY; return { ...v, me: v.me || null, req: v.req || [], book: v.book || [] }; }
/* my compatibility preferences (quiz answers or my profile), null when none */
export function usePrefs() { const pq = useStoreValue(pqStore); const ps = usePS(); return myPrefs(pq, ps); }

const dn = (pd, id) => (pd.dests[id] || { n: id }).n;

/* ---------- traveller card (buddyCard) ---------- */
export function BuddyCard({ b }) {
  const pd = usePData(), t = b.trips[0], dd = pd.dests[t[0]] || { n: t[0], img: 'group-lake' };
  return (
    <article className="bcard bc2">{pd.demo ? <span className="sample-tag">Sample profile</span> : null}
      <div className="bc2-cover" style={{ backgroundImage: `url(${img(dd.img)})` }}><span>{I.pin}{dd.n} · {t[1]}</span></div>
      <div className="bc2-top"><PAvatar b={b} /><div className="bc2-id"><h3><Link href={PATHS.buddy(b.id)}>{b.name}</Link>, {b.age}</h3><p>{b.g} · {b.city}{b.womenOnly ? <>{' · '}<span className="wo">Women-only</span></> : null}</p></div><MatchPill n={b._m} /></div>
      <div className="vbadges">{b.ver.map(v => <span key={v}>{I.shield}{v}</span>)}{b.selfie ? <span>{I.check}Selfie</span> : null}</div>
      <p className="bc-style">{b.style}</p>
      <div className="bc2-facts"><span title="Budget">{I.wallet}{b.bud || '—'}</span><span title="Pace">{I.clock}{b.pace || '—'}</span><span title="Food">{I.star}{b.diet || '—'}</span>{b.smoke === false ? <span title="Non-smoker">{I.check}Non-smoker</span> : null}</div>
      <div className="bc-trips">{b.trips.map(([d, m]) => <Link key={d + m} href={PATHS.dest(d)}>{dn(pd, d)} · {m}</Link>)}</div>
      <div className="bc-act"><Link className="btn btn-ghost btn-sm" href={PATHS.buddy(b.id)}>View profile</Link><RequestButton b={b} className="btn btn-o btn-sm">Send request</RequestButton><FavButton b={b} /></div></article>
  );
}

/* ---------- shortlist ♥ (data-pfav): card variant, or the big profile button with `big` ---------- */
export function FavButton({ b, big }) {
  const ui = useUI(), ps = usePS(), on = (ps.fav || []).includes(b.id);
  const onClick = e => { e.preventDefault(); const now = shortlist.toggle(b.id); ui.toast(now ? 'Added to your shortlist' : 'Removed from shortlist'); };
  if (big) return <button type="button" className="btn btn-ghost bp2-g" aria-pressed={on} onClick={onClick}>{on ? <>{I.heartF} Shortlisted</> : <>{I.heart} Shortlist</>}</button>;
  return <button type="button" className={`bc2-fav ${on ? 'on' : ''}`} aria-label={`Shortlist ${b.name}`} aria-pressed={on} onClick={onClick}>{on ? I.heartF : I.heart}</button>;
}

/* ---------- partner request (data-preq → openRequest) ---------- */
export function RequestButton({ b, className, style, children }) {
  const ui = useUI(), pd = usePData();
  const open = () => {
    const pkgs = pd.pkgs.filter(p => b.trips.some(t => t[0] === p.dest));
    ui.openModal(<RequestForm b={b} pkgs={pkgs} />, 'Send partner request', 'Contact details stay private until both accept');
  };
  return <button className={className} style={style} onClick={open}>{children}</button>;
}

function RequestForm({ b, pkgs }) {
  const ui = useUI(), [err, setErr] = useState(''), [sent, setSent] = useState(false), fn = firstName(b.name);
  const onSubmit = e => {
    e.preventDefault(); const fm = e.currentTarget, q = s => fm.querySelector(s);
    if (!q('#pr-ok').checked) return setErr('Please confirm you are 18+ and accept the safety rules.');
    const st = PS.get(); if (st.req.some(r => r.b === b.id && r.status !== 'Declined')) return setErr('You already have an open request with this traveller.');
    const r = { id: Date.now().toString(36), b: b.id, trip: q('#pr-trip').value, month: q('#pr-month').value, msg: q('#pr-msg').value.trim(), seat: q('#pr-seat').checked, room: q('input[name=pr-room]:checked').value, status: 'Awaiting response', at: new Date().toISOString() };
    PS.set({ ...st, req: [r, ...st.req] });
    setSent(true);
  };
  if (sent) return <div className="ok"><span className="tick">{I.tick}</span><h3>Request sent to {fn}</h3><p className="muted">You&apos;ll be notified when {fn} responds. Chat opens once the request is accepted.</p><Link className="btn btn-o" href={VIEW_PATHS['partner-requests']} onClick={() => ui.closeModal()}>View my requests</Link></div>;
  return (
    <form className="form" id="preqf" onSubmit={onSubmit}><div className="bp-head" style={{ marginBottom: '6px' }}><Avatar b={b} /><div><b>{b.name}</b><br /><small className="muted">{b.style}</small></div></div>
      <label>Which trip?<select id="pr-trip">{pkgs.map(p => <option key={p.id} value={p.id}>{p.title} · {p.n}N/{p.n + 1}D</option>)}<option value="">Something else / not decided</option></select></label>
      <label>When?<select id="pr-month">{b.trips.map(t => <option key={t[0] + t[1]}>{t[1]}</option>)}<option>Flexible</option></select></label>
      <label>Message<textarea id="pr-msg" maxLength={400} placeholder="Hi! I'm planning the same trip. Would you like to travel together?"></textarea></label>
      <fieldset className="pr-opts"><legend>Your preferences (shared with {fn})</legend>
        <label className="chk"><input type="checkbox" id="pr-seat" defaultChecked /> Sit together while travelling</label>
        <label className="chk"><input type="radio" name="pr-room" value="separate" defaultChecked /> Separate rooms</label>
        <label className="chk"><input type="radio" name="pr-room" value="shared" /> Open to a shared room (only if both agree)</label></fieldset>
      <label className="chk"><input type="checkbox" id="pr-ok" /> I am 18+ and agree to the <Link href={VIEW_PATHS['partner-safety']} style={{ textDecoration: 'underline' }} onClick={() => ui.closeModal()}>Travel Partner safety rules</Link></label>
      <p className="err" aria-live="polite">{err}</p><button className="btn btn-o">Send request</button></form>
  );
}

/* ---------- smart match quiz (data-pmatch → openMatchQuiz) ---------- */
export function useOpenQuiz() {
  const ui = useUI(), pd = usePData();
  return () => {
    const dests = pd.destOrder.map(id => [id, pd.dests[id].n]);
    ui.openModal(<MatchQuiz dests={dests} />, 'Smart match', 'Answer 7 quick questions — we score every traveller for you');
  };
}
export function MatchButton({ className, style, children }) {
  const open = useOpenQuiz();
  return <button type="button" className={className} style={style} onClick={e => { e.preventDefault(); open(); }}>{children}</button>;
}

function MatchQuiz({ dests }) {
  const ui = useUI(), router = useRouter(), path = usePathname();
  const [init] = useState(() => ({ p: myPrefs(PQ.get(), PS.get()) || {}, me: PS.get().me || {} }));
  const { p, me } = init;
  const [styles, setStyles] = useState(() => (p.styles || []).slice());
  const [err, setErr] = useState('');
  const toggle = s => { const on = !styles.includes(s); if (on && styles.length >= 3) return ui.toast('Pick up to 3 styles'); setStyles(on ? [...styles, s] : styles.filter(x => x !== s)); };
  const onSubmit = e => {
    e.preventDefault(); const fm = e.currentTarget, v = id => fm.querySelector('#' + id).value;
    const age = +v('pq-age'); if (age && age < 18) return setErr('Travel Partner is for adults 18 and above.');
    PQ.set({ dest: v('pq-dest'), month: v('pq-month'), styles: STYLES.filter(s => styles.includes(s)), bud: v('pq-bud'), pace: v('pq-pace'), diet: v('pq-diet'), age: age || 0, lang: [] });
    PF.set({ ...PF.get(), sort: 'match' }); PF.touched = true;
    ui.closeModal(); if (path !== VIEW_PATHS.partner) router.push(VIEW_PATHS.partner);
    ui.toast('Sorted by your best matches');
  };
  return (
    <form className="form pq" id="pqf" onSubmit={onSubmit}>
      <div className="pq-step"><b>1. Where do you want to go?</b><select id="pq-dest" defaultValue={p.dest || ''}><option value="">Open to anywhere</option>{dests.map(([id, n]) => <option key={id} value={id}>{n}</option>)}</select></div>
      <div className="pq-step"><b>2. When?</b><select id="pq-month" defaultValue={p.month || 'Flexible'}>{monthOptions()}</select></div>
      <div className="pq-step"><b>3. Your travel style</b> <small className="muted">pick up to 3</small><div className="pchips">{STYLES.map(s => <button key={s} type="button" className={styles.includes(s) ? 'on' : ''} onClick={() => toggle(s)}>{s}</button>)}</div></div>
      <div className="row2"><div className="pq-step"><b>4. Budget per person</b><select id="pq-bud" defaultValue={p.bud || ''}><option value="">Flexible</option>{BUDS.map(x => <option key={x}>{x}</option>)}</select></div>
        <div className="pq-step"><b>5. Pace</b><select id="pq-pace" defaultValue={p.pace || ''}><option value="">Any</option>{PACES.map(x => <option key={x}>{x}</option>)}</select></div></div>
      <div className="row2"><div className="pq-step"><b>6. Food</b><select id="pq-diet" defaultValue={p.diet || ''}><option value="">Any</option>{DIETS.map(x => <option key={x}>{x}</option>)}</select></div>
        <div className="pq-step"><b>7. Your age</b><input id="pq-age" type="number" min="18" max="80" inputMode="numeric" defaultValue={p.age || me.age || ''} /></div></div>
      <p className="err" aria-live="polite">{err}</p><button className="btn btn-o" type="submit">Show my matches</button></form>
  );
}

/* ---------- share profile link (data-pshare) ---------- */
export function ShareProfileButton() {
  const ui = useUI();
  return <button type="button" onClick={() => { const u = location.href; (navigator.clipboard ? navigator.clipboard.writeText(u) : Promise.reject()).then(() => ui.toast('Profile link copied')).catch(() => ui.toast('Copy the link from your address bar')); }}>{I.ne} Share profile</button>;
}
