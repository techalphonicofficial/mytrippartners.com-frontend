'use client';
/* Small interactive building blocks used across the site (same markup/classes as the original). */
import { useState } from 'react';
import { useWishlist, useCompare } from '@/lib/client/hooks';
import { WL, CMP } from '@/lib/client/storage';
import { useUI } from '@/components/providers/UIProvider';
import { I } from '@/components/icons';

/* ♥ on cards: <button class="heart [on]" data-wl> */
export function HeartButton({ id }) {
  const list = useWishlist(), ui = useUI(), on = list.includes(id);
  return <button className={'heart ' + (on ? 'on' : '')} data-wl={id} aria-label="Save to wishlist" onClick={e => { e.preventDefault(); const now = WL.toggle(id); ui.toast(now ? 'Saved to wishlist' : 'Removed from wishlist'); }}>{I.heart}</button>;
}

/* big "Save to wishlist" button on detail pages (data-wl-big) */
export function WishlistBigButton({ id, className = 'btn btn-ghost' }) {
  const list = useWishlist(), ui = useUI(), on = list.includes(id);
  return <button type="button" className={className} data-wl-big={id} onClick={() => { const now = WL.toggle(id); ui.toast(now ? 'Saved to wishlist' : 'Removed from wishlist'); }}>{on ? I.heartF : I.heart} {on ? 'Saved to wishlist' : 'Save to wishlist'}</button>;
}

/* "+ Compare" toggle (max 3) */
export function CmpButton({ id }) {
  const list = useCompare(), ui = useUI(), on = list.includes(id);
  return <button type="button" className={'cmp-btn ' + (on ? 'on' : '')} data-cmp={id} aria-pressed={on ? 'true' : 'false'} onClick={e => { e.preventDefault(); if (!CMP.toggle(id)) ui.toast(`You can compare up to ${CMP.MAX} packages`); }}>{on ? '✓ Comparing' : '+ Compare'}</button>;
}

/* carousel arrows for a horizontally scrolling rail with the given id */
export function RailNav({ id }) {
  const go = dir => { const r = document.getElementById(id); if (r) r.scrollBy({ left: dir * r.clientWidth * 0.8, behavior: 'smooth' }); };
  return <div className="rail-nav"><button data-rail={id} data-dir="-1" aria-label="Previous" onClick={() => go(-1)}>{I.left}</button><button data-rail={id} data-dir="1" aria-label="Next" onClick={() => go(1)}>{I.right}</button></div>;
}

/* copy text to the clipboard (falls back to selecting the previous element's text) */
export function CopyButton({ value, children = 'Copy', className, ...rest }) {
  const ui = useUI();
  const onClick = e => {
    const btn = e.currentTarget;
    (navigator.clipboard ? navigator.clipboard.writeText(value) : Promise.reject()).then(() => ui.toast('Copied')).catch(() => {
      const c = btn.previousElementSibling; if (!c) return; const r = document.createRange(); r.selectNodeContents(c); const s = getSelection(); s.removeAllRanges(); s.addRange(r); ui.toast('Press Ctrl+C to copy');
    });
  };
  return <button type="button" {...rest} className={className} data-copy={value} onClick={onClick}>{children}</button>;
}

/* share the current page link */
export function ShareButton({ className = 'btn btn-ghost', children = 'Share this package' }) {
  const ui = useUI();
  return <button className={className} data-share onClick={() => { const u = location.href; (navigator.clipboard ? navigator.clipboard.writeText(u) : Promise.reject()).then(() => ui.toast('Link copied — paste it anywhere to share')).catch(() => ui.toast('Copy the link from your address bar to share')); }}>{children}</button>;
}

/* opens a registered feature by name, e.g. <OpenButton feature="planner" arg="Goa" className="btn btn-o">Plan</OpenButton>
   data-* props are passed through so the markup matches the original (data-plan, data-msearch …) */
export function OpenButton({ feature, arg, children, ...rest }) {
  const ui = useUI();
  return <button type="button" {...rest} onClick={() => ui.open(feature, arg)}>{children}</button>;
}

/* "Plan My Trip" buttons: <button data-plan="Goa"> */
export function PlanButton({ dest = '', children, className, type = 'button', ...rest }) {
  const ui = useUI();
  return <button type={type} className={className} data-plan={dest} {...rest} onClick={() => ui.open('planner', dest)}>{children}</button>;
}

/* accordion: <div class="acc [on]"><button>title</button><div>body</div></div> */
export function Acc({ title, children, defaultOpen = false, className = 'acc', buttonExtra }) {
  const [on, setOn] = useState(defaultOpen);
  return <div className={className + (on ? ' on' : '')}><button type="button" onClick={() => setOn(v => !v)}>{title}{buttonExtra}</button><div>{children}</div></div>;
}
