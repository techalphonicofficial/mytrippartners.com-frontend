'use client';
/* Small client parts of the home page:
   - <RecentSection/>  "Continue planning" rail of recently viewed packages (original recentHTML)
   - <SectionNav/>     the #snav "On this page" navigator appended to <body> (original polish.js sectionNav)
   - <LongWeekend/>    next long weekend text in the "Long weekend getaways" banner (original nextLongWeekend) */
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useRecent, useSite } from '@/lib/client/hooks';
import { PkgCard, SecHead } from '@/components/ui/cards';
import { RailNav } from '@/components/ui/buttons';
import { I } from '@/components/icons';
import { todayISO } from '@/lib/format';
import { nextLongWeekend } from './longWeekend';

export function RecentSection() {
  const S = useSite(), ids = useRecent();
  const a = S ? ids.map(S.P).filter(Boolean) : [];
  if (!a.length) return null;
  return <section className="sec-tight"><div className="wrap"><SecHead h="Continue planning" p="Packages you viewed recently" right={<RailNav id="r-rv" />} /><div className="rail" id="r-rv" style={{ '--cw': '280px' }}>{a.map(p => <PkgCard key={p.id} p={p} />)}</div></div></section>;
}

/* sections directly under #app that have a heading (the reviews block and dashboard SEO copy were never part of it) */
const homeSections = () => [...document.querySelectorAll('#app > section')].filter(s => s.id !== 'tp-rv' && !s.matches('.pseo-about,.pseo-faq'))
  .map(s => [s, s.querySelector('h2')]).filter(x => x[1] && x[1].textContent.trim());

/* original polish.js: after a page renders, its images decode asynchronously (shared cards don't set it themselves) */
const asyncImages = () => document.querySelectorAll('#app img:not([decoding])').forEach(i => { i.decoding = 'async'; });

export function SectionNav() {
  const [secs, setSecs] = useState([]);
  const [on, setOn] = useState(-1);
  /* rebuilt when sections are added or removed (e.g. "Continue planning" renders after the device data is read) */
  useEffect(() => {
    const app = document.getElementById('app'); if (!app) return;
    const build = () => { asyncImages(); const s = homeSections(); setSecs(s.length < 5 ? [] : s); setOn(-1); };
    build();
    const mo = new MutationObserver(build); mo.observe(app, { childList: true });
    return () => mo.disconnect();
  }, []);
  useEffect(() => {
    if (!secs.length) return;
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) setOn(secs.findIndex(x => x[0] === e.target)); }), { rootMargin: '-45% 0px -50% 0px' });
    secs.forEach(x => io.observe(x[0]));
    return () => io.disconnect();
  }, [secs]);
  if (!secs.length) return null;
  return createPortal(
    <nav id="snav" className="snav" aria-label="On this page">
      {secs.map(([s, h], i) => <button key={i} type="button" className={i === on ? 'on' : undefined} onClick={() => window.scrollTo({ top: s.getBoundingClientRect().top + scrollY - 150, behavior: 'smooth' })}><span>{h.textContent.trim().replace(/\s+/g, ' ').slice(0, 34)}</span><i></i></button>)}
    </nav>, document.body);
}

/* server-rendered with the server's date, re-checked with the visitor's date after mount */
export function LongWeekend({ list, initial }) {
  const [lw, setLw] = useState(initial);
  useEffect(() => { const x = nextLongWeekend(list, todayISO()); if (x[1] !== lw[1]) setLw(x); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return <div style={{ textAlign: 'center' }}><span className="lw-date">{I.cal} {lw[1]}</span><div className="lw-logo"><span>LONG WEEKEND</span><i>GETAWAYS</i></div><p style={{ fontSize: '22px', fontWeight: '600' }}>You Can&apos;t Miss!</p><p style={{ opacity: '.8', fontSize: '14px', marginTop: '6px' }}>{lw[2]}</p></div>;
}
