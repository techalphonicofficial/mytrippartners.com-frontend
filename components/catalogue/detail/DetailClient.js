'use client';
/* Client islands of the destination and package pages:
   <Gallery>        .ph-gal photos; a photo or "View n photos" opens the lightbox (designClick data-gal, improveClick .ph-gal img)
   <JumpTabs>       sticky section tabs (boot() data-jump: smooth scroll to the section, 240px above it)
   <Estimator>      price estimator (extra.js estimatorBox + estimatorInit)
   <PrintButton>    "Print / save itinerary (PDF)" (polish.js: opens every <details> on the page, then prints)
   <CmpWideButton>  "+ Compare" in the price card (cmpBtn with the cmp-wide class)
   <RecordView>     adds the package to "recently viewed" (pkgPage RV.add) */
import { useEffect, useState } from 'react';
import { useUI } from '@/components/providers/UIProvider';
import { useCompare } from '@/lib/client/hooks';
import { CMP, RV } from '@/lib/client/storage';
import { I } from '@/components/icons';
import { inr } from '@/lib/format';
import { estimate } from '@/lib/catalogue/detail';

export function Gallery({ images, total, alt }) {
  const ui = useUI();
  const show = i => ui.open('lightbox', images.map(src => ({ src, alt })), i);
  return (
    <div className={'ph-gal ' + (total < 3 ? 'one' : '')}>
      {images.map((src, i) => <img key={i} src={src} alt={alt} decoding="async" onClick={() => show(i)} />)}
      <button type="button" className="ph-more" onClick={() => show(0)}>{I.globe} View {total} photo{total > 1 ? 's' : ''}</button>
    </div>
  );
}

export function JumpTabs({ href, tabs }) {
  const go = (e, id) => { e.preventDefault(); const el = document.getElementById(id); if (el) window.scrollTo({ top: el.getBoundingClientRect().top + scrollY - 240, behavior: 'smooth' }); };
  return <nav className="tabs-sticky">{tabs.map(([a, l]) => <a key={a} href={href} onClick={e => go(e, a)}>{l}</a>)}</nav>;
}

const STEPS = [['ad', 'Adults', 'Fewer adults', 'More adults'], ['ch', 'Children (5–11)', 'Fewer children', 'More children']];
const HOTELS = [['std', 'Standard'], ['dlx', 'Deluxe'], ['prm', 'Premium']];
export function Estimator({ price }) {
  const [s, setS] = useState({ ad: 2, ch: 0, hc: 'std' });
  const r = estimate(price, s);
  const bump = (k, d) => setS(x => ({ ...x, [k]: Math.max(k === 'ad' ? 1 : 0, Math.min(20, x[k] + d)) }));
  return (
    <div className="box est" id="est"><h3>Estimate your trip cost</h3>
      {STEPS.map(([k, l, less, more]) => <div className="est-row" key={k}><span>{l}</span><div className="step"><button type="button" aria-label={less} onClick={() => bump(k, -1)}>−</button><output id={'e-' + k}>{s[k]}</output><button type="button" aria-label={more} onClick={() => bump(k, 1)}>+</button></div></div>)}
      <div className="est-row"><span>Hotel category</span><div className="seg" role="radiogroup">{HOTELS.map(([k, l]) => <button type="button" role="radio" aria-checked={s.hc === k ? 'true' : 'false'} key={k} onClick={() => setS(x => ({ ...x, hc: k }))}>{l}</button>)}</div></div>
      <div className="est-total"><span>Estimated total</span><b className="num" id="e-tot">{inr(r.tot)}</b><small id="e-pp" className="muted">{`${inr(r.avg)} per person avg.${r.single ? ' Includes single-room supplement.' : ''}`}</small></div>
      <p className="muted" style={{ fontSize: '12px' }}>Indicative estimate on twin sharing (children with extra bed). Your final quote is confirmed by your trip expert.</p></div>
  );
}

export function PrintButton() {
  const onClick = () => { document.querySelectorAll('#app details').forEach(d => { d.open = true; }); setTimeout(() => window.print(), 60); };
  return <button type="button" className="btn btn-ghost" onClick={onClick}>Print / save itinerary (PDF)</button>;
}

export function CmpWideButton({ id }) {
  const list = useCompare(), ui = useUI(), on = list.includes(id);
  return <button type="button" className={'cmp-btn cmp-wide ' + (on ? 'on' : '')} aria-pressed={on ? 'true' : 'false'} onClick={e => { e.preventDefault(); if (!CMP.toggle(id)) ui.toast(`You can compare up to ${CMP.MAX} packages`); }}>{on ? '✓ Comparing' : '+ Compare'}</button>;
}

export function RecordView({ id }) {
  useEffect(() => { RV.add(id); }, [id]);
  return null;
}
