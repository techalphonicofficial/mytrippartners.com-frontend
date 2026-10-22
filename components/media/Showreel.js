'use client';
/* Showreel player + chapter list (legacy videoSection's .tv-main and the showreel part of videoInit/videoKey):
   play/pause, seek, mute, full screen, chapters, "Now showing" with a "Plan this trip" link to the current
   chapter's destination, autoplay while in view. reel = showreelData() */
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useUI } from '@/components/providers/UIProvider';
import { I } from '@/components/icons';
import { PATHS } from '@/lib/routes';
import { VSRC, VPOS, fmtT, reducedMotion } from '@/lib/media/video';

export default function Showreel({ reel }) {
  const ui = useUI();
  const c = reel.chapters, step = reel.step;
  const v = useRef(null), box = useRef(null), prog = useRef(null);
  const [paused, setPaused] = useState(true);
  const [muted, setMuted] = useState(true);
  const [t, setT] = useState({ cur: 0, pct: 0, time: 0 });
  /* chapters that were "on" before keep an empty class attribute, like the original classList.toggle() */
  const [seen, setSeen] = useState(() => new Set([0]));

  const onTime = () => {
    const el = v.current; if (!el) return;
    const d = el.duration || 1, cur = Math.min(c.length - 1, Math.floor(el.currentTime / step));
    setT({ cur, pct: el.currentTime / d * 100, time: el.currentTime });
    setSeen(s => (s.has(cur) ? s : new Set([...s, cur])));
  };
  const toggle = () => { const el = v.current; if (el.paused) el.play().catch(() => {}); else el.pause(); };

  /* autoplay while at least 45% visible */
  useEffect(() => {
    const el = v.current; if (!el) return;
    setPaused(el.paused);
    if (reducedMotion() || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) el.play().catch(() => {}); else el.pause(); }), { threshold: 0.45 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const mute = () => { const el = v.current; el.muted = !el.muted; setMuted(el.muted); ui.toast(el.muted ? 'Muted' : 'Sound on'); };
  const full = () => { const el = box.current; (el.requestFullscreen ? el.requestFullscreen() : Promise.reject()).catch(() => ui.toast('Full screen is not available here')); };
  const seek = e => { const el = v.current, r = prog.current.getBoundingClientRect(); el.currentTime = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)) * (el.duration || 0); };
  const progKey = e => { const el = v.current; if (e.key === 'ArrowRight') el.currentTime += 2; if (e.key === 'ArrowLeft') el.currentTime -= 2; };
  const boxKey = e => { if (e.key === ' ') { e.preventDefault(); toggle(); } };
  const chap = i => { const el = v.current; el.currentTime = i * step + 0.05; onTime(); el.play().catch(() => {}); };
  const now = c[t.cur];

  return (
    <div className="tv-main">
      <div className={'tv-player' + (paused ? '' : ' playing')} id="tvp" ref={box} onKeyDown={boxKey}>
        <video id="tvv" ref={v} playsInline muted loop preload="metadata" poster={VPOS(reel.src)} onTimeUpdate={onTime} onSeeked={onTime} onPlay={() => setPaused(false)} onPause={() => setPaused(true)}><source src={VSRC(reel.src)} type="video/mp4" /><source src={VSRC(reel.src).replace('.mp4', '.webm')} type="video/webm" /></video>
        <button type="button" className="tv-big" id="tvbig" aria-label="Play showreel" hidden={!paused} onClick={toggle}>{I.play}</button>
        <div className="tv-now"><span className="tv-live">● Now showing <i className="tv-n num" id="tvnum">{`${t.cur + 1}/${c.length}`}</i></span><b id="tvnow">{now.name}</b><Link className="btn btn-o btn-sm" id="tvcta" href={PATHS.dest(now.id)}>Plan this trip {I.arrow}</Link></div>
        <div className="tv-ctrl"><button type="button" id="tvpp" aria-label={paused ? 'Play' : 'Pause'} onClick={toggle}>{paused ? I.play : I.pause}</button>
          <div className="tv-prog" id="tvprog" role="slider" aria-label="Seek" tabIndex={0} ref={prog} onClick={seek} onKeyDown={progKey}><i id="tvfill" style={{ width: t.pct + '%' }}></i>{c.map((x, i) => (i ? <b key={i} className="tick" style={{ left: `${(i * step / ((c.length * step) + 0.7) * 100).toFixed(2)}%` }}></b> : null))}</div>
          <span id="tvtime" className="num">{fmtT(t.time)}</span><button type="button" id="tvmute" aria-label="Unmute" onClick={mute}>{muted ? I.mute : I.vol}</button><button type="button" id="tvfs" aria-label="Full screen" onClick={full}>{I.full}</button></div>
      </div>
      <ol className="tv-chap" id="tvchap">{c.map((x, i) => <li key={i}><button type="button" data-chap={i} className={i === t.cur ? 'on' : seen.has(i) ? '' : undefined} onClick={() => chap(i)}><img loading="lazy" src={x.img} alt="" decoding="async" /><span><b>{x.name}</b><small className="num">{fmtT(x.start)}</small></span></button></li>)}</ol>
    </div>
  );
}
