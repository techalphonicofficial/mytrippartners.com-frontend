'use client';
/* Christmas & New Year client parts (legacy festive.js): live countdown to New Year (fxCountdown + the timer
   in festiveInit), festive trip cards (fxCard) and the filter tabs (FX_TABS). */
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { I, TI } from '@/components/icons';
import { img, inr } from '@/lib/format';
import { PATHS } from '@/lib/routes';
import { HeartButton, RailNav } from '@/components/ui/buttons';
import { EnquireButton } from '@/components/ui/LeadForm';
import { FX_LAB, FX_TAB_LIST, fxDate, fxLeft } from '@/lib/media/festive';

const pad = n => String(n).padStart(2, '0');

/* initial = fxLeft() at server render (same first render on both sides); ticks every second after mount */
export function Countdown({ initial }) {
  const [t, setT] = useState(initial);
  useEffect(() => { const tick = () => setT(fxLeft()); tick(); const id = setInterval(tick, 1000); return () => clearInterval(id); }, []);
  return <div className="fx-cd" id="fxcd" aria-label="Countdown to New Year 2027">{[['d', 'Days'], ['h', 'Hours'], ['m', 'Mins'], ['s', 'Secs']].map(([k, l]) => <span key={k}><b className="num" data-cd={k}>{pad(t[k])}</b><small>{l}</small></span>)}</div>;
}

/* festive trip card. p = festiveList() item */
export function FxCard({ p, hidden, CONFIG }) {
  const f = p.fx, href = PATHS.pkg(p.id);
  return (
    <article className={`fxc ${f.occ}`} data-fx={p.id} data-occ={f.occ} data-type={p.type} hidden={hidden}>
      <Link className="fxc-img" href={href}><img loading="lazy" src={img(p.img)} alt={p.title} decoding="async" /><span className="fxc-occ">{TI.festive}{FX_LAB[f.occ]}</span><span className="badge">{p.n}N/{p.n + 1}D</span>
        <span className="fxc-date"><b>{fxDate(f.dep)}</b><i>→</i><b>{fxDate(f.ret)}</b></span></Link>
      <HeartButton id={p.id} />
      <div className="fxc-b"><span className="fxc-where">{p.where} · {p.type === 'intl' ? 'International' : 'India'}</span><h3><Link href={href}>{p.title}</Link></h3>
        <p className="fxc-hi">{I.star}<span>{f.hi}</span></p>
        <div className="fxc-f"><span><small>Early-bird</small><b className="price">{inr(p.eb)}</b><s className="num">{inr(p.price)}</s></span><span className={'fxc-seats ' + (f.seats <= 10 ? 'low' : '')}>{f.seats} seats left*</span></div>
        <div className="fxc-a">{p.blocked ? <EnquireButton className="btn btn-o btn-sm" subject={`${p.title} — availability`} CONFIG={CONFIG}>Enquire</EnquireButton> : <Link className="btn btn-o btn-sm" href={PATHS.book(p.id)}>Book now</Link>}<EnquireButton className="btn btn-ghost btn-sm" subject={`${p.title} — ${fxDate(f.dep)}`} CONFIG={CONFIG}>Enquire</EnquireButton></div></div></article>
  );
}

/* tabs + cards. variant "section": tabs + rail (home); "page": tabs + count + grid */
export function FestiveBrowser({ list, variant = 'page', CONFIG }) {
  const [tab, setTab] = useState('all'), [picked, setPicked] = useState(false);
  const rail = useRef(null);
  const ok = p => p.tabs.includes(tab);
  const n = list.filter(ok).length;
  const pick = k => { setTab(k); setPicked(true); if (rail.current) rail.current.scrollTo({ left: 0 }); };
  const tabs = <div className="pill-tabs fx-tabs" role="tablist" id="fxt">{FX_TAB_LIST.map(([k, l]) => <button key={k} role="tab" aria-selected={tab === k ? 'true' : 'false'} data-fxt={k} onClick={() => pick(k)}>{l}</button>)}</div>;
  const cards = list.map(p => <FxCard key={p.id} p={p} hidden={!ok(p)} CONFIG={CONFIG} />);
  if (variant === 'section') return (
    <>
      <div className="fx-f">{tabs}<RailNav id="r-fx" /></div>
      <div className="rail" id="r-fx" style={{ '--cw': '310px' }} ref={rail}>{cards}</div>
    </>
  );
  /* before the first click the original always wrote "N trips" */
  return (
    <>
      <div className="filters">{tabs}<span className="count num" id="fxcount">{picked ? `${n} trip${n === 1 ? '' : 's'}` : `${list.length} trips`}</span></div>
      <div className="fx-grid">{cards}</div>
    </>
  );
}
