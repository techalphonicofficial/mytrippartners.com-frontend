'use client';
/* Full-screen vertical reel viewer (legacy video.js: openReel/drawReel/stepReel/closeReel, the [data-rv]
   part of videoClick and the reel part of videoKey).
   ui.open('reel', reelId, [ids]) — ids: the reels to step through (default: all reels).
   Arrows / ↑↓ / swipe step, Esc / × / swipe down close; the reel's package, quote, wishlist and share actions. */
import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUI } from '@/components/providers/UIProvider';
import { useSite, useWishlist } from '@/lib/client/hooks';
import { WL } from '@/lib/client/storage';
import { EnquireButton } from '@/components/ui/LeadForm';
import { I } from '@/components/icons';
import { img, inr } from '@/lib/format';
import { PATHS, VIEW_PATHS } from '@/lib/routes';
import { reelData, VPLAY, VPOS } from '@/lib/media/video';
import { REG } from '@/lib/media/reelRegistry';

export default function ReelViewer({ CONFIG: CONFIG0 }) {
  const ui = useUI(), S = useSite(), path = usePathname(), wl = useWishlist();
  const [req, setReq] = useState(null);          /* { id, list } requested (may wait for the site data) */
  const [st, setSt] = useState(null);            /* { ids, i } */
  const [muted, setMuted] = useState(true);
  const [prog, setProg] = useState(0);
  const v = useRef(null), closeBtn = useRef(null), touch = useRef(null);

  useEffect(() => ui.register('reel', (id, list) => setReq({ id, list })), [ui]);

  /* reel data: the cards on the page (instant), else the full site data */
  const info = id => REG.reels.get(id) || (S && S.RL(id) ? reelData(S, S.RL(id)) : null);
  const CONFIG = CONFIG0 || REG.CONFIG || (S && S.CONFIG);

  /* open once the reel data is available */
  useEffect(() => {
    if (!req) return;
    const list = req.list && req.list.length ? req.list : null;
    if (!S && !(list && list.every(id => REG.reels.has(id)))) return;   /* wait for the site data */
    const ids = (list || S.REELS.map(r => r.id)).filter(x => info(x));
    setReq(null); if (!ids.length) return;
    setMuted(true); setSt({ ids, i: Math.max(0, ids.indexOf(req.id)) });
  }, [req, S]); // eslint-disable-line react-hooks/exhaustive-deps

  const close = useCallback(() => { if (v.current) v.current.pause(); setSt(null); }, []);
  const step = useCallback(n => setSt(s => (s ? { ...s, i: (s.i + n + s.ids.length) % s.ids.length } : s)), []);
  const open = !!st;

  /* body scroll lock + focus the close button */
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    closeBtn.current && closeBtn.current.focus();
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  /* keys while open */
  useEffect(() => {
    if (!open) return;
    const k = e => { if (e.key === 'Escape') close(); if (e.key === 'ArrowRight' || e.key === 'ArrowDown') step(1); if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') step(-1); };
    document.addEventListener('keydown', k); return () => document.removeEventListener('keydown', k);
  }, [open, close, step]);

  /* a new page closes the viewer */
  useEffect(() => { close(); }, [path, close]);

  const cur = st ? info(st.ids[st.i]) : null;

  /* load + play the current reel */
  useEffect(() => {
    const el = v.current; if (!cur || !el) return;
    setProg(0); el.src = VPLAY(cur.id); el.poster = VPOS(cur.id); el.muted = muted; el.play().catch(() => {});
  }, [cur && cur.id, st && st.i]); // eslint-disable-line react-hooks/exhaustive-deps

  const onTouchStart = e => { touch.current = { y: e.touches[0].clientY, x: e.touches[0].clientX }; };
  const onTouchEnd = e => {
    const t0 = touch.current; if (!t0) return; touch.current = null;
    const dy = e.changedTouches[0].clientY - t0.y, dx = e.changedTouches[0].clientX - t0.x;
    if (Math.abs(dy) > 60 && Math.abs(dy) > Math.abs(dx)) step(dy < 0 ? 1 : -1); else if (dy > 120) close();
  };
  /* following the package link or asking for a quote closes the viewer */
  const onClick = e => { if (e.target.closest('[data-enquire], a[href]')) close(); };
  const toggleMute = () => { const m = !muted; setMuted(m); if (v.current) v.current.muted = m; };
  const save = id => { const on = WL.toggle(id); ui.toast(on ? 'Saved to wishlist' : 'Removed from wishlist'); };
  const share = () => { const u = location.origin + VIEW_PATHS.videos; (navigator.clipboard ? navigator.clipboard.writeText(u) : Promise.reject()).then(() => ui.toast('Link copied')).catch(() => ui.toast('Copy the link from your address bar')); };

  let body = null;
  if (cur) {
    const p = cur.pkg, saved = p && wl.includes(p.id);
    const nx = st.ids.length > 1 ? info(st.ids[(st.i + 1) % st.ids.length]) : null;
    body = (
      <div className="rv-stage"><div className="rv-bars" id="rvbars">{st.ids.map((x, j) => <span key={j}><i style={{ width: j < st.i ? '100%' : j === st.i ? prog + '%' : '0%' }}></i></span>)}</div>
        <div className="rv-top"><span className="rv-brand"><img src="/img/logo-new-dark.png" alt="TripPartner" /></span><button type="button" className="rv-ic" data-rv="mute" aria-label="Unmute" onClick={toggleMute}>{muted ? I.mute : I.vol}</button><button type="button" className="rv-ic" data-rv="close" aria-label="Close" ref={closeBtn} onClick={close}>×</button></div>
        <video id="rvv" ref={v} playsInline muted autoPlay onEnded={() => step(1)} onTimeUpdate={() => { const el = v.current; if (el) setProg(el.currentTime / (el.duration || 1) * 100); }}></video>
        <button type="button" className="rv-tap rv-prev" data-rv="prev" aria-label="Previous reel" onClick={() => step(-1)}></button><button type="button" className="rv-tap rv-next" data-rv="next" aria-label="Next reel" onClick={() => step(1)}></button>
        <div className="rv-info" id="rvinfo"><span className="reel-tag">{cur.tag}</span><h3>{cur.name}</h3><p>{cur.t} · {cur.best}</p>
          {p ? <div className="rv-pk"><img src={img(p.img)} alt="" /><span><b>{p.title}</b><small>{p.n}N/{p.n + 1}D · from {inr(p.price)}</small></span></div> : null}
          <div className="rv-cta">{p ? <Link className="btn btn-o" href={PATHS.pkg(p.id)}>View package</Link> : null}<EnquireButton className="btn btn-ghost rv-ghost" subject={`${cur.name} (from reel)`} CONFIG={CONFIG}>Get a quote</EnquireButton>{p ? <button type="button" className={'rv-ic ' + (saved ? 'on' : '')} data-rv="save" data-pid={p.id} aria-label="Save to wishlist" onClick={() => save(p.id)}>{saved ? I.heartF : I.heart}</button> : null}<button type="button" className="rv-ic" data-rv="share" aria-label="Share" onClick={share}>{I.share}</button></div>
          {nx ? <button type="button" className="rv-next-up" data-rv="next" onClick={() => step(1)}><img src={VPOS(nx.id)} alt="" /><span><small>Up next</small><b>{nx.short}</b></span></button> : null}</div>
        <button type="button" className="rv-arrow l" data-rv="prev" aria-label="Previous reel" onClick={() => step(-1)}>{I.left}</button><button type="button" className="rv-arrow r" data-rv="next" aria-label="Next reel" onClick={() => step(1)}>{I.right}</button></div>
    );
  }
  return <div className="reelview" id="reelview" hidden={!cur} role="dialog" aria-label="Reel viewer" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd} onClick={onClick}>{body}</div>;
}
