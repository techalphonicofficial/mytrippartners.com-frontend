'use client';
/* Reel card (legacy reelCard + the reel part of videoInit/videoClick): lazy-loads and previews the clip on
   hover (or when mostly in view on touch screens) and opens the full-screen reel viewer on click with the
   visible reels of the same rail/grid. r = reelData(); CONFIG = site contact config (for the viewer's quote form) */
import { useEffect, useRef } from 'react';
import { useUI } from '@/components/providers/UIProvider';
import { I } from '@/components/icons';
import { inr } from '@/lib/format';
import { VPOS, VPLAY, reducedMotion } from '@/lib/media/video';
import { registerReel } from '@/lib/media/reelRegistry';

export default function ReelCard({ r, hidden, CONFIG }) {
  const ui = useUI(), card = useRef(null), vid = useRef(null), bar = useRef(null);
  const load = () => { const v = vid.current; if (v && !v.getAttribute('src')) v.src = VPLAY(r.id); };

  useEffect(() => { registerReel(r, CONFIG); }, [r, CONFIG]);

  /* touch screens: play while at least 70% visible */
  useEffect(() => {
    if (reducedMotion() || !matchMedia('(hover: none)').matches || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(es => es.forEach(e => { const v = vid.current; if (!v) return; if (e.intersectionRatio > 0.7) { load(); v.play().catch(() => {}); } else v.pause(); }), { threshold: [0, 0.7, 1] });
    io.observe(card.current);
    return () => io.disconnect();
  }, [r.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const onClick = e => {
    const scope = e.currentTarget.closest('.reels-rail,.reels-grid') || document;
    const list = [...scope.querySelectorAll('[data-reel]')].filter(x => !x.hidden).map(x => x.dataset.reel);
    ui.open('reel', r.id, [...new Set(list)]);
  };
  const onTime = () => { const v = vid.current; if (bar.current && v) bar.current.style.width = (v.currentTime / (v.duration || 1) * 100) + '%'; };

  return (
    <button type="button" className="reel" data-reel={r.id} aria-label={`Play ${r.name} reel`} hidden={hidden} ref={card} onClick={onClick}
      onMouseEnter={() => { if (reducedMotion()) return; load(); vid.current.play().catch(() => {}); }} onMouseLeave={() => vid.current.pause()}>
      <video ref={vid} muted loop playsInline preload="none" poster={VPOS(r.id)} onTimeUpdate={onTime}></video>
      <span className="reel-top"><span className="reel-tag">{r.tag}</span><span className="reel-play">{I.play}</span></span>
      <span className="reel-b"><b>{r.short}</b><small>{r.t}</small>{r.pkg ? <em>from {inr(r.pkg.price)}</em> : null}</span>
      <span className="reel-bar"><i ref={bar}></i></span></button>
  );
}
