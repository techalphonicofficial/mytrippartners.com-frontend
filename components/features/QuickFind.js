'use client';
/* Ctrl/⌘ + K quick find (legacy next.js QF: qfItems / qfSearch / qfDraw / qfOpen / qfClose / qfRun):
   one box to jump to any action, page, destination, package, theme or India place.
   ↑/↓ move, Enter opens, Esc or Ctrl+K closes. Opened with ui.open('quickfind'). */
import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUI } from '@/components/providers/UIProvider';
import { useRecent, useSite } from '@/lib/client/hooks';
import { I } from '@/components/icons';
import { img, inr, dname, waLink } from '@/lib/format';
import { PATHS, hashToPath } from '@/lib/routes';

const PAGES = [['Home', 'home'], ['All packages', 'packages'], ['Deals & offers', 'deals'], ['Christmas & New Year packages', 'christmas-new-year'], ['Weekend getaways from Delhi', 'weekend'], ['Group departures calendar', 'departures'], ['Visa guide', 'visa'], ['Travel Partner — find a partner', 'partner'], ['Travel Partner requests', 'partner-requests'], ['My Trips & bookings', 'account'], ['Wishlist', 'wishlist'], ['Compare packages', 'compare'], ['TripPartner TV — reels', 'videos'], ['Travel guides', 'guides'], ['Holiday themes', 'themes'], ['India holidays', 'india'], ['International holidays', 'international'], ['FAQs', 'faq'], ['About us', 'about'], ['Contact us', 'contact'], ['Cancellation policy', 'cancellation']];

/* legacy qfItems(): actions get `run` names, everything else an `h` URL */
function buildItems(S) {
  const a = [
    { k: 'Action', t: 'Plan my trip — get a free quote', i: I.plan, run: 'plan' }, { k: 'Action', t: 'Talk to a travel expert', i: I.headset, run: 'expert' },
    { k: 'Action', t: 'Chat on WhatsApp', i: I.wa, run: 'wa' }, { k: 'Action', t: 'Switch dark / light mode', i: I.star, run: 'theme' },
  ];
  PAGES.forEach(([t, h]) => a.push({ k: 'Page', t, i: I.arrow, h: hashToPath(h, S) || '/' }));
  if (S) {
    S.DEST.forEach(d => a.push({ k: 'Destination', t: dname(d), s: `${d.type === 'intl' ? 'International' : 'India'} · from ${inr(d.price)}`, img: d.img, h: PATHS.dest(d.id), x: d.region + ' ' + d.tag }));
    S.PKG.forEach(p => a.push({ k: 'Package', t: p.title, s: `${p.n}N/${p.n + 1}D · ${inr(p.price)}`, img: p.img, h: PATHS.pkg(p.id), x: p.route + ' ' + (S.D(p.dest) || {}).name + ' ' + p.themes.join(' ') }));
    S.THEMES.forEach(t => a.push({ k: 'Theme', t: t.name, i: I.umbrella, h: PATHS.theme(t.id) }));
    S.PLACES.forEach(p => a.push({ k: 'Place', t: p.n, s: `Best time ${p.best} · ${p.days} day${p.days === '1' ? '' : 's'}`, i: I.pin, h: PATHS.place(p), x: p.s + ' ' + (p.t || []).join(' ') }));
  }
  a.forEach(x => { x.q = (x.t + ' ' + (x.x || '') + ' ' + x.k).toLowerCase(); });
  return a;
}

/* legacy qfSearch(q) */
function qfSearch(all, S, recent, q) {
  q = q.trim().toLowerCase();
  if (!q) return [...all.filter(x => x.k === 'Action'), ...(S ? recent.map(S.P).filter(Boolean).slice(0, 3) : []).map(p => ({ k: 'Recently viewed', t: p.title, s: `${p.n}N/${p.n + 1}D · ${inr(p.price)}`, img: p.img, h: PATHS.pkg(p.id) })), ...all.filter(x => x.k === 'Page').slice(0, 7)];
  const ws = q.split(/\s+/), out = [];
  for (const x of all) { if (!ws.every(w => x.q.includes(w))) continue; const t = x.t.toLowerCase(); out.push([t.startsWith(q) ? 0 : t.includes(q) ? 1 : 2, x]); }
  const ord = { Action: 0, Destination: 1, Package: 2, Page: 3, Theme: 4, Place: 5 };
  return out.sort((a, b) => a[0] - b[0]).slice(0, 14).sort((a, b) => ord[a[1].k] - ord[b[1].k] || a[0] - b[0]).slice(0, 14).map(x => x[1]);
}

export default function QuickFind() {
  const ui = useUI(), router = useRouter(), S = useSite(), recent = useRecent();
  const [built, setBuilt] = useState(false), [open, setOpen] = useState(false), [q, setQ] = useState(''), [sel, setSel] = useState(0);
  const inp = useRef(null), last = useRef(null), listRef = useRef(null);
  const all = useMemo(() => buildItems(S), [S]);
  const list = useMemo(() => qfSearch(all, S, recent, q), [all, S, recent, q]);
  const cur = Math.min(sel, Math.max(0, list.length - 1));

  const show = useCallback(() => { last.current = document.activeElement; setBuilt(true); setQ(''); setSel(0); setOpen(true); document.body.style.overflow = 'hidden'; setTimeout(() => inp.current && inp.current.focus(), 0); }, []);
  const close = useCallback(() => setOpen(o => { if (!o) return o; document.body.style.overflow = ''; const l = last.current; if (l && document.body.contains(l)) setTimeout(() => l.focus(), 0); return false; }), []);
  useEffect(() => ui.register('quickfind', show), [ui, show]);
  useEffect(() => {
    const k = e => {
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey && e.key.toLowerCase() === 'k') { e.preventDefault(); if (open) close(); else show(); }
      else if (e.key === 'Escape') close();
    };
    document.addEventListener('keydown', k); return () => document.removeEventListener('keydown', k);
  }, [open, show, close]);
  useEffect(() => { if (!open || !listRef.current) return; const c = listRef.current.querySelector('.qf-i[aria-selected="true"]'); if (c) c.scrollIntoView({ block: 'nearest' }); }, [open, cur, list]);

  const run = i => {
    const x = list[i]; if (!x) return; close();
    if (x.run === 'plan') return ui.open('planner', '');
    if (x.run === 'expert') { const b = document.querySelector('[data-expert]'); if (b) b.click(); return; }
    if (x.run === 'wa') return window.open(waLink(S ? S.CONFIG : {}, 'Hi TripPartner, I want to plan a trip.'), '_blank', 'noopener');
    if (x.run === 'theme') return ui.theme.toggle();
    router.push(x.h);
  };
  const onKey = e => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSel(Math.min(list.length - 1, cur + 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setSel(Math.max(0, cur - 1)); }
    else if (e.key === 'Enter') { e.preventDefault(); run(cur); }
  };

  if (!built) return null;
  let prev = '';
  return (
    <div id="qf" className="qf" hidden={!open}>
      <div className="qf-bg" onClick={close}></div>
      <div className="qf-box" role="dialog" aria-modal="true" aria-label="Quick find">
        <div className="qf-h">{I.search}<label className="sr" htmlFor="qf-q">Quick find</label><input id="qf-q" ref={inp} placeholder="Search destinations, packages, places or actions…" autoComplete="off" role="combobox" aria-expanded="true" aria-controls="qf-list" value={q} onChange={e => { setQ(e.target.value); setSel(0); }} onKeyDown={onKey} /><kbd>Esc</kbd></div>
        <div className="qf-list" id="qf-list" role="listbox" ref={listRef}>
          {list.length ? list.map((x, i) => {
            const head = x.k !== prev ? <p className="qf-k">{x.k === 'Recently viewed' ? x.k : x.k + 's'}</p> : null; prev = x.k;
            return <Fragment key={i}>{head}<button type="button" role="option" className="qf-i" aria-selected={i === cur ? 'true' : 'false'} onClick={() => run(i)} onMouseMove={() => { if (i !== cur) setSel(i); }}>
              {x.img ? <img src={img(x.img)} alt="" /> : <span className="qf-ic">{x.i || I.arrow}</span>}<span className="qf-t"><b>{x.t}</b>{x.s ? <small>{x.s}</small> : null}</span><em>{x.k === 'Action' ? 'Run' : 'Open'} ↵</em></button></Fragment>;
          }) : <div className="qf-empty"><b>No match for “{q}”</b><p className="muted">Tell us what you need and we&apos;ll plan it.</p><button type="button" className="btn btn-o btn-sm" onClick={() => { close(); ui.open('planner', ''); }}>{I.plan} Plan my trip</button></div>}
        </div>
        <div className="qf-f"><span><kbd>↑</kbd><kbd>↓</kbd> move</span><span><kbd>↵</kbd> open</span><span><kbd>Ctrl</kbd><kbd>K</kbd> toggle</span></div>
      </div>
    </div>
  );
}
