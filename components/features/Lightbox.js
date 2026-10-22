'use client';
/* Photo lightbox (original improve.js: openLightbox / drawLB / stepLB / closeLB + improveKey).
   ui.open('lightbox', images, index) — images: [{ src, alt }]. ←/→ step, Esc closes, swipe on touch screens,
   a click on the dark backdrop closes. Closes on navigation (the original closed it on every route change). */
import { useCallback, useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useUI } from '@/components/providers/UIProvider';
import { I } from '@/components/icons';

export default function Lightbox() {
  const ui = useUI(), path = usePathname();
  const [st, setSt] = useState(null);                 /* { list, i } while open */
  const closeRef = useRef(null), sx = useRef(null);

  const open = useCallback((list, start = 0) => { if (list && list.length) setSt({ list, i: Math.max(0, Math.min(list.length - 1, start | 0)) }); }, []);
  const step = useCallback(d => setSt(s => (s ? { ...s, i: (s.i + d + s.list.length) % s.list.length } : s)), []);
  const close = useCallback(() => setSt(null), []);

  useEffect(() => ui.register('lightbox', open), [ui, open]);
  useEffect(() => { setSt(null); }, [path]);
  const isOpen = !!st;
  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = 'hidden'; closeRef.current && closeRef.current.focus();
    const onKey = e => { if (e.key === 'ArrowRight') step(1); if (e.key === 'ArrowLeft') step(-1); if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [isOpen, step, close]);

  const cur = st ? st.list[st.i] : null;
  return (
    <div className="lightbox" id="lightbox" hidden={!st} role="dialog" aria-label="Photo viewer"
      onClick={e => { if (e.target.id === 'lightbox') close(); }}
      onTouchStart={e => { sx.current = e.touches[0].clientX; }}
      onTouchEnd={e => { if (sx.current === null) return; const dx = e.changedTouches[0].clientX - sx.current; if (Math.abs(dx) > 40) step(dx < 0 ? 1 : -1); sx.current = null; }}>
      {st ? <>
        <button type="button" className="lb-x" aria-label="Close photos" ref={closeRef} onClick={close}>×</button>
        <button type="button" className="lb-n lb-p" aria-label="Previous photo" onClick={() => step(-1)}>{I.left}</button>
        <figure><img id="lb-img" src={cur.src} alt={cur.alt || ''} /><figcaption id="lb-cap">{`${st.i + 1} / ${st.list.length}${cur.alt ? ' · ' + cur.alt : ''}`}</figcaption></figure>
        <button type="button" className="lb-n lb-f" aria-label="Next photo" onClick={() => step(1)}>{I.right}</button>
      </> : null}
    </div>
  );
}
