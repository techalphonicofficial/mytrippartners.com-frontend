'use client';
/* Weekend getaways client parts (legacy weekend.js): trip cards with the next departure date, the distance /
   vibe filters (weekendInit) and the "next weekend" dates.
   Dates: the server passes its first Friday ("Y-M-D") so the first render matches; after mount the browser's
   own date replaces it (the original computed these in the browser). */
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { I } from '@/components/icons';
import { inr } from '@/lib/format';
import { PATHS } from '@/lib/routes';
import { HeartButton, RailNav } from '@/components/ui/buttons';
import { EnquireButton } from '@/components/ui/LeadForm';
import { WKT, WKV, nextWeekends, fmtD, plus, fromYmd } from '@/lib/media/weekend';

/* first upcoming Friday: server value first, browser value after mount */
export function useFriday(initial) {
  const [fri, setFri] = useState(() => fromYmd(initial));
  useEffect(() => { const d = nextWeekends(1)[0]; setFri(f => (f.getTime() === d.getTime() ? f : d)); }, []);
  return fri;
}
/* k weekends from the given Friday / the Saturday after it (local calendar days, as the original) */
const weekends = (fri, k) => Array.from({ length: k }, (_, i) => { const f = new Date(fri); f.setDate(fri.getDate() + i * 7); return f; });
const sat = fri => { const s = new Date(fri); s.setDate(fri.getDate() + 1); return s; };

/* "23 Oct – 25 Oct" (hero fact) */
export function NextWeekendRange({ fri: initial }) {
  const fri = useFriday(initial);
  return <b>{fmtD(fri)} – {fmtD(plus(fri, 2))}</b>;
}

/* "Upcoming weekends" list */
export function UpcomingWeekends({ fri: initial }) {
  const fri = useFriday(initial);
  return <ul className="checks">{weekends(fri, 4).map((d, i) => <li key={i}>{I.check}<span><b>{fmtD(d)} – {fmtD(plus(d, 2))}</b> · Fri–Sun</span></li>)}</ul>;
}

function BookLink({ p, CONFIG }) {
  if (p.blocked) return <EnquireButton className="btn btn-o btn-sm" subject={`${p.title} — availability`} CONFIG={CONFIG}>Enquire</EnquireButton>;
  return <Link className="btn btn-o btn-sm" href={PATHS.book(p.id)}>Book</Link>;
}

/* weekend trip card (legacy wkCard) */
export function WkCard({ p, fri, hidden, CONFIG }) {
  const w = p.wk, href = PATHS.pkg(p.id);
  return (
    <article className="wkc" data-wk={p.id} data-hrs={w.hrs} data-vibe={w.vibe} hidden={hidden}>
      <Link className="wkc-img" href={href}><img loading="lazy" src={`/img/${p.img}.jpg`} alt={p.title} decoding="async" /><span className="badge">{p.n}N/{p.n + 1}D</span>{p.tag ? <span className="wkc-tag">{p.tag}</span> : null}
        <span className="wkc-dist"><b className="num">{w.km} km</b><small>~{w.hrs} h {/Volvo|Overnight/.test(w.mode) ? 'overnight' : 'drive'}</small></span></Link>
      <HeartButton id={p.id} />
      <div className="wkc-b"><span className="wkc-v">{WKV[w.vibe]} · {w.mode}</span><h3><Link href={href}>{p.title}</Link></h3>
        <ul className="wkc-sch"><li>{I.car}<span>Leaves <b>{w.leave}</b></span></li><li>{I.clock}<span>Back <b>{w.back}</b></span></li><li>{I.cal}<span>Next: <b>{fmtD(w.leave.startsWith('Fri') ? fri : sat(fri))}</b></span></li></ul>
        <div className="wkc-f"><span><small>From</small><b className="price">{inr(p.price)}</b><small>per person</small></span><BookLink p={p} CONFIG={CONFIG} /></div></div></article>
  );
}

/* filters + cards. variant "section": distance tabs + rail (home); "page": distance + vibe tabs, count and grid */
export function WeekendBrowser({ list, fri: initial, variant = 'page', CONFIG }) {
  const fri = useFriday(initial);
  const [t, setT] = useState('all'), [v, setV] = useState('all');
  const rail = useRef(null);
  const f = WKT.find(x => x[0] === t)[2];
  const ok = p => f(p) && (v === 'all' || p.wk.vibe === v);
  const n = list.filter(ok).length;
  const pickT = k => { setT(k); if (rail.current) rail.current.scrollTo({ left: 0 }); };
  const tabs = <div className="pill-tabs" role="tablist" id="wkt">{WKT.map(([k, l]) => <button key={k} role="tab" aria-selected={t === k ? 'true' : 'false'} data-wkt={k} onClick={() => pickT(k)}>{l}</button>)}</div>;
  const cards = list.map(p => <WkCard key={p.id} p={p} fri={fri} hidden={!ok(p)} CONFIG={CONFIG} />);
  if (variant === 'section') return (
    <>
      <div className="wk-f">{tabs}<RailNav id="r-wk" /></div>
      <div className="rail" id="r-wk" style={{ '--cw': '300px' }} ref={rail}>{cards}</div>
    </>
  );
  return (
    <>
      <div className="filters wk-filters">{tabs}
        <div className="pill-tabs" role="tablist" id="wkv"><button role="tab" aria-selected={v === 'all' ? 'true' : 'false'} data-wkv="all" onClick={() => setV('all')}>All vibes</button>{Object.entries(WKV).map(([k, l]) => <button key={k} role="tab" aria-selected={v === k ? 'true' : 'false'} data-wkv={k} onClick={() => setV(k)}>{l}</button>)}</div><span className="count num" id="wkcount">{`${n} trip${n === 1 ? '' : 's'}`}</span></div>
      <div className="wk-grid">{cards}</div>
    </>
  );
}
