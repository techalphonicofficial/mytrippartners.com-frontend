'use client';
/* Interactive parts of the India places pages (same markup as the original places.js):
   <HeroGallery>    .ph-gal — click a photo or "View photos" (data-gal) → lightbox      (design.js / improve.js handlers)
   <JumpTabs>       .tabs-sticky "On this page" links (data-jump) → smooth scroll        (boot() click handler)
   <StateFilter>    #stf trip-type tabs filtering #stlist                                  (stateInit)
   <PlacesSearch>   #pfind search box with #pcount2 / #pfres results                        (placesIndexInit) */
import { useEffect, useState } from 'react';
import { useUI } from '@/components/providers/UIProvider';
import { I } from '@/components/icons';
import { img } from '@/lib/format';
import { PlaceCard } from '@/components/ui/boxes';

/* The original's route() wrapper (polish.js) set decoding="async" on every #app image after a view rendered;
   the shared cards (PlaceCard, PkgCard) don't render it, so each places page applies it once after mounting. */
export function AsyncImages() {
  useEffect(() => { document.querySelectorAll('#app img:not([decoding])').forEach(i => { i.decoding = 'async'; }); }, []);
  return null;
}

/* imgs: [image name, alt]; more: show the "View photos" button */
export function HeroGallery({ imgs, className = 'ph-gal', more = false }) {
  const ui = useUI();
  const open = (e, i) => { const list = [...e.currentTarget.closest('.ph-gal').querySelectorAll('img')].map(x => ({ src: x.src, alt: x.alt })); ui.open('lightbox', list, i); };
  return (
    <div className={className}>
      {imgs.map(([g, alt], i) => <img key={g + i} src={img(g)} alt={alt} decoding="async" onClick={e => open(e, i)} />)}
      {more ? <button type="button" className="ph-more" onClick={e => open(e, 0)}>{I.globe} View photos</button> : null}
    </div>
  );
}

/* tabs: [[target id, label]]; href: the page's own URL */
export function JumpTabs({ tabs, href }) {
  const jump = (e, id) => { e.preventDefault(); const el = document.getElementById(id); if (el) window.scrollTo({ top: el.getBoundingClientRect().top + scrollY - 240, behavior: 'smooth' }); };
  return <nav className="tabs-sticky" aria-label="On this page">{tabs.map(([a, l]) => <a key={a} href={href} onClick={e => jump(e, a)}>{l}</a>)}</nav>;
}

/* tabs: [[type, label]]; cards: [{ id, types: [..], el: <PlaceCard/> }] */
export function StateFilter({ title, tabs, cards }) {
  const [sel, setSel] = useState('');
  return (
    <div><div className="sec-head"><h2>{title}</h2><div className="pill-tabs" role="tablist" id="stf">{[['', 'All'], ...tabs].map(([t, l]) => <button key={t} role="tab" aria-selected={sel === t ? 'true' : 'false'} onClick={() => setSel(t)}>{l}</button>)}</div></div>
      <div className="plc-grid big" id="stlist">{cards.map(c => <div key={c.id} hidden={!!sel && !c.types.includes(sel)}>{c.el}</div>)}</div></div>
  );
}

/* places: [{ id, s, n, t, best, img, hay }]; states: { s: name } */
export function PlacesSearch({ places, states }) {
  const [q, setQ] = useState('');
  const S = { placeImg: p => p.img, ST: s => ({ n: states[s] }) };
  const query = q.trim().toLowerCase();
  const m = query ? places.filter(p => p.hay.includes(query)) : [];
  return (
    <>
      <div className="dsearch"><label htmlFor="pfind" className="sr">Search places</label>{I.search}<input id="pfind" placeholder={`Search ${places.length} places, states or attractions…`} autoComplete="off" value={q} onChange={e => setQ(e.target.value)} /><span id="pcount2" className="muted" aria-live="polite">{query ? `${m.length} match${m.length === 1 ? '' : 'es'}` : ''}</span></div>
      <div id="pfres" className="plc-grid big" hidden={!query}>{query ? (m.length ? m.map(p => <PlaceCard key={p.id} p={p} S={S} />) : <p className="muted">No places match. Try a state or attraction name.</p>) : null}</div>
    </>
  );
}
