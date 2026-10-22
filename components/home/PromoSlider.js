'use client';
/* Offers slider (original slider(#promo)): prev/next arrows, one dot per slide, dot follows the scroll position,
   auto-advances every 6 s unless hovered or the visitor prefers reduced motion. Slides are server-rendered children. */
import { Children, useEffect, useRef, useState } from 'react';
import { I } from '@/components/icons';

export default function PromoSlider({ children }) {
  const n = Children.count(children);
  const root = useRef(null), track = useRef(null);
  const [cur, setCur] = useState(0);
  const idx = () => { const t = track.current; return t && t.clientWidth ? Math.round(t.scrollLeft / t.clientWidth) : 0; };
  const to = i => { const t = track.current; if (t) t.scrollTo({ left: ((i + n) % n) * t.clientWidth, behavior: 'smooth' }); };

  useEffect(() => {
    const t = track.current; if (!t) return;
    const onScroll = () => requestAnimationFrame(() => setCur(idx()));
    t.addEventListener('scroll', onScroll);
    let timer = null;
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches) timer = setInterval(() => { if (!root.current.matches(':hover')) to(idx() + 1); }, 6000);
    return () => { t.removeEventListener('scroll', onScroll); clearInterval(timer); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="slider" id="promo" ref={root}>
      <button className="s-arrow s-prev" aria-label="Previous offer" onClick={() => to(idx() - 1)}>{I.left}</button>
      <div className="slides" ref={track}>{children}</div>
      <button className="s-arrow s-next" aria-label="Next offer" onClick={() => to(idx() + 1)}>{I.right}</button>
      <div className="dots">{Array.from({ length: n }, (_, i) => <button key={i} aria-label={`Offer ${i + 1}`} className={i === cur ? 'on' : undefined} onClick={() => to(i)}></button>)}</div>
    </div>
  );
}
