'use client';
/* Partner search on /travel-partner/: search modes (PMODES), smart form + more filters, chips, sort, results
   (original partnerPage search section + partnerInit + partnerPageClick).
   URL presets: ?g=Female|Male ?women=1 ?d=<dest> ?m=<month> ?mode=<mode> ?match=1 (opens the quiz). */
import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { I } from '@/components/icons';
import { img } from '@/lib/format';
import { VIEW_PATHS } from '@/lib/routes';
import { STYLES, BUDS, AGES, PACES, SORTS, PF_DEFAULT, pfReset, applyPreset, buddyMatches, filterChips, buddyDestIds, buddyMonths } from '@/lib/partner/core';
import { PF, JB } from '@/lib/partner/state';
import { usePData, usePrefs, BuddyCard, useOpenQuiz } from './client';

const PMODES = [['smart', 'Smart search', 'search'], ['dest', 'By destination', 'pin'], ['month', 'By month', 'cal'], ['trip', 'By trip package', 'bag'], ['interest', 'By interest', 'star'], ['city', 'From your city', 'car'], ['women', 'Women-only', 'shield']];

function Sel({ id, label, opts, v, onChange }) {
  return <label>{label}<select id={id} value={v} onChange={e => onChange(e.target.value)}>{opts.map(o => { const [val, l] = Array.isArray(o) ? o : [o, o]; return <option key={val} value={val}>{l}</option>; })}</select></label>;
}

export default function Browse({ preset, pkey, match }) {
  const pd = usePData(), pr = usePrefs(), openQuiz = useOpenQuiz();
  const B = pd.buddies, dn = id => (pd.dests[id] || { n: id }).n;
  /* filters: the URL preset on first load (same as the server render); later visits keep this visit's filters */
  const [f, setF0] = useState(() => {
    if (typeof window === 'undefined') return applyPreset({ ...PF_DEFAULT, styles: [] }, preset);
    const base = PF.touched ? PF.get() : { ...PF_DEFAULT, styles: [] };
    const v = applyPreset(base, preset); PF.set(v); PF.touched = true; return v;
  });
  const setF = upd => { const v = typeof upd === 'function' ? upd(PF.get()) : upd; PF.set(v); };
  useEffect(() => PF.subscribe(v => setF0(v)), []);
  /* a new preset while on the page (header menu links) */
  const first = useRef(true);
  useEffect(() => { if (first.current) { first.current = false; return; } setF(cur => { const n = applyPreset(cur, preset); setMoreOpen(moreOf(n)); return n; }); }, [pkey]); // eslint-disable-line react-hooks/exhaustive-deps
  /* ?match=1 opens the quiz */
  useEffect(() => { if (match) openQuiz(); }, [match]); // eslint-disable-line react-hooks/exhaustive-deps

  const [q, setQ] = useState(f.q);
  const qt = useRef(null);
  useEffect(() => { setQ(f.q); }, [f.q]);
  const [trip, setTrip] = useState('');

  const destIds = useMemo(() => buddyDestIds(B), [B]);
  const months = useMemo(() => buddyMonths(B), [B]);
  const cities = useMemo(() => [...new Set(B.map(b => b.from || b.city))].sort(), [B]);
  const langs = useMemo(() => [...new Set(B.flatMap(b => b.lang))].sort(), [B]);
  const r = useMemo(() => buddyMatches(B, f, pr, dn), [B, f, pr]); // eslint-disable-line react-hooks/exhaustive-deps
  const chips = filterChips(f, dn);

  const moreOf = x => !!(x.bud || x.lang || x.from || x.pace || x.ver || x.selfie || x.nonsmoke || x.veg || x.styles.length);
  /* 'More filters' open state: from the filters when the original re-rendered the page (load, chip removal, clear all), else as the visitor left it */
  const [moreOpen, setMoreOpen] = useState(() => moreOf(f));
  const set = patch => setF(cur => ({ ...cur, ...patch }));
  const scrollRes = () => { const h = document.getElementById('pcount'); if (h && matchMedia('(max-width:720px)').matches) h.scrollIntoView({ behavior: 'smooth', block: 'start' }); };
  const toggleStyle = s => setF(cur => ({ ...cur, styles: cur.styles.includes(s) ? cur.styles.filter(x => x !== s) : [...cur.styles, s] }));
  const setMode = k => setF(cur => (k === 'women' && !cur.women ? { ...cur, mode: k, women: true, g: 'Female' } : { ...cur, mode: k }));
  const removeChip = k => setF(cur => { const n = removeChip0(cur, k); setMoreOpen(moreOf(n)); return n; });
  const removeChip0 = (cur, k) => {
    if (k.startsWith('style:')) { const s = k.slice(6); return { ...cur, styles: cur.styles.filter(x => x !== s) }; }
    if (k === 'g') return { ...cur, g: 'Anyone' }; if (k === 'age') return { ...cur, age: '18–60' };
    return { ...cur, [k]: typeof cur[k] === 'boolean' ? false : '' };
  };
  const clearAll = () => { setTrip(''); setMoreOpen(false); setF(cur => pfReset(cur)); };
  const onQ = e => { const v = e.target.value; setQ(v); clearTimeout(qt.current); qt.current = setTimeout(() => set({ q: v.trim() }), 220); };
  const onSubmit = e => { e.preventDefault(); clearTimeout(qt.current); set({ q: q.trim() }); };
  const styleChips = cls => <div className={cls}>{STYLES.map(s => <button key={s} type="button" className={f.styles.includes(s) ? 'on' : ''} aria-pressed={f.styles.includes(s)} onClick={() => toggleStyle(s)}>{s}</button>)}</div>;

  return (
    <section className="sec-tight p2-search-sec"><div className="wrap">
      <div className="p2-modes" role="tablist" aria-label="Ways to search">{PMODES.map(([k, l, ic]) => <button key={k} type="button" role="tab" aria-selected={f.mode === k} onClick={() => setMode(k)}>{I[ic]}<span>{l}</span></button>)}</div>
      <div className="p2-panel" id="p2-panel">
        <div className="p2-mp" hidden={f.mode !== 'smart'}>
          <form className="psearch p2-form" id="psearch" onSubmit={onSubmit}>
            <label className="p2-q">Search<span className="p2-qi">{I.search}<input id="pf-q" value={q} onChange={onQ} placeholder="Name, city, destination, interest… e.g. “Goa December”" /></span></label>
            <Sel id="pf-dest" label="Destination" opts={[['', 'Anywhere'], ...destIds.map(id => [id, dn(id)])]} v={f.dest} onChange={v => set({ dest: v })} />
            <Sel id="pf-month" label="Month" opts={[['', 'Any month'], ...months]} v={f.month} onChange={v => set({ month: v })} />
            <Sel id="pf-g" label="Looking for" opts={[['Anyone', 'Anyone'], ['Female', 'Women'], ['Male', 'Men']]} v={f.g} onChange={v => set({ g: v })} />
            <Sel id="pf-age" label="Age" opts={AGES} v={f.age} onChange={v => set({ age: v })} />
            <button className="btn btn-o" type="submit">{I.search} Find partners</button>
          </form>
          <details className="p2-more" open={moreOpen} onToggle={e => setMoreOpen(e.currentTarget.open)}><summary>More filters <small>budget, language, habits, verification</small></summary>
            <div className="p2-more-g">
              <Sel id="pf-bud" label="Budget per person" opts={[['', 'Any budget'], ...BUDS]} v={f.bud} onChange={v => set({ bud: v })} />
              <Sel id="pf-lang" label="Language" opts={[['', 'Any language'], ...langs]} v={f.lang} onChange={v => set({ lang: v })} />
              <Sel id="pf-from" label="Travelling from" opts={[['', 'Any city'], ...cities]} v={f.from} onChange={v => set({ from: v })} />
              <Sel id="pf-pace" label="Travel pace" opts={[['', 'Any pace'], ...PACES]} v={f.pace} onChange={v => set({ pace: v })} />
              <div className="p2-checks">{[['ver', 'ID verified only'], ['selfie', 'Selfie verified'], ['nonsmoke', 'Non-smoker'], ['veg', 'Vegetarian / Jain']].map(([k, l]) => <label key={k} className="chk"><input type="checkbox" checked={f[k]} onChange={e => set({ [k]: e.target.checked })} /> {l}</label>)}</div>
              <div className="p2-styles"><span>Travel style</span>{styleChips('pchips')}</div>
            </div></details>
        </div>
        <div className="p2-mp" hidden={f.mode !== 'dest'}><div className="p2-dgrid">{destIds.map(id => { const d = pd.dests[id] || { n: id, img: 'group-lake' }, n = B.filter(b => b.trips.some(t => t[0] === id)).length; return <button key={id} type="button" className={`p2-d ${f.dest === id ? 'on' : ''}`} onClick={() => { set({ dest: f.dest === id ? '' : id }); scrollRes(); }}><img loading="lazy" src={img(d.img)} alt="" decoding="async" /><span><b>{d.n}</b><small>{n} traveller{n > 1 ? 's' : ''}</small></span></button>; })}</div></div>
        <div className="p2-mp" hidden={f.mode !== 'month'}><div className="p2-months">{months.map(m => { const n = B.filter(b => b.trips.some(t => t[1] === m)).length; const [mo, yr] = m.split(' '); return <button key={m} type="button" className={f.month === m ? 'on' : ''} onClick={() => { set({ month: f.month === m ? '' : m }); scrollRes(); }}><b>{mo}</b><small>{yr}</small><em>{n}</em></button>; })}</div><p className="muted p2-hint">Pick the month you want to travel — we show everyone travelling then.</p></div>
        <div className="p2-mp" hidden={f.mode !== 'trip'}><label className="p2-trip">Choose a TripPartner package<select id="pf-trip" value={trip} onChange={e => { const v = e.target.value, p = pd.pkgs.find(x => x.id === v); setTrip(v); set({ dest: p ? p.dest : '' }); if (v) JB.set({ ...JB.get(), pkg: v }); }}><option value="">Select a package…</option>{pd.pkgs.filter(p => destIds.includes(p.dest)).map(p => <option key={p.id} value={p.id}>{p.title} — {p.n}N/{p.n + 1}D</option>)}</select></label><p className="muted p2-hint">We&apos;ll show travellers planning the same destination, so you can book this exact trip together.</p></div>
        <div className="p2-mp" hidden={f.mode !== 'interest'}>{styleChips('pchips p2-int')}<p className="muted p2-hint">Pick one or more interests.</p></div>
        <div className="p2-mp" hidden={f.mode !== 'city'}><div className="pchips">{cities.map(c => <button key={c} type="button" className={f.from === c ? 'on' : ''} onClick={() => { set({ from: f.from === c ? '' : c }); scrollRes(); }}>{I.pin} {c}</button>)}</div><p className="muted p2-hint">Start the trip with someone from your own city — easier to meet before you travel.</p></div>
        <div className="p2-mp" hidden={f.mode !== 'women'}><div className="p2-women"><span>{I.shield}</span><div><b>Women-only circle</b><p className="muted">Women who chose to be visible only to verified women. Turn this on to see them — men cannot see these profiles.</p></div><label className="p2-switch"><input type="checkbox" id="pf-women" checked={f.women} onChange={e => set(e.target.checked ? { women: true, g: 'Female' } : { women: false })} /><span></span> Show women-only profiles</label></div></div>
      </div>
      {pd.demo ? <p className="sample-note" style={{ marginTop: '14px' }}>Sample profiles shown for preview. Real, ID-verified members appear here after launch.</p> : null}
      <div className="p2-bar"><h2 id="pcount">{`${r.length} travel partner${r.length === 1 ? '' : 's'} found`}</h2><div className="p2-chips" id="pchips">{chips.map(([k, l]) => <button key={k} type="button" onClick={() => { setTrip(''); removeChip(k); }}>{l} <span aria-hidden="true">×</span></button>)}{chips.length > 1 ? <button type="button" className="all" onClick={clearAll}>Clear all</button> : null}</div>
        <div className="p2-bar-r">{pr ? <button type="button" className="p2-prefs" onClick={openQuiz}>{I.star} Matching with your preferences · edit</button> : <button type="button" className="p2-prefs on" onClick={openQuiz}>{I.star} Get match % — take the 30-sec quiz</button>}
          <label className="sr" htmlFor="pf-sort">Sort</label><select id="pf-sort" value={f.sort} onChange={e => set({ sort: e.target.value })}>{SORTS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></div></div>
      <div className="grid g3" id="plist-b">{r.length ? r.map(b => <BuddyCard key={b.id} b={b} />) : <div className="empty" style={{ gridColumn: '1/-1' }}><h3>No partners match yet</h3><p style={{ margin: '8px 0 16px' }}>Try fewer filters, another month or destination — or create your profile so others can find you.</p><button type="button" className="btn btn-ghost" onClick={clearAll}>Clear all filters</button> <Link className="btn btn-o" href={VIEW_PATHS['partner-create']}>Create profile</Link></div>}</div>
    </div></section>
  );
}
