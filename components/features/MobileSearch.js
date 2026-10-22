'use client';
/* Full-screen mobile search (legacy system.js openSearch / closeSearch / systemClick data-msq):
   input with instant suggestions (↑/↓ + Enter), popular chips and themes. Enter without a highlighted
   suggestion searches all packages (/search/?q=…). Opened with ui.open('search'). */
import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useUI } from '@/components/providers/UIProvider';
import { useSite } from '@/lib/client/hooks';
import { I, TI } from '@/components/icons';
import { PATHS, VIEW_PATHS } from '@/lib/routes';
import Suggest from '@/components/ui/Suggest';

const POPULAR = ['Kashmir', 'Goa', 'Kerala', 'Char Dham', 'Bali', 'Thailand', 'Dubai', 'Ladakh', 'Andaman', 'Maldives'];

export default function MobileSearch() {
  const ui = useUI(), router = useRouter(), path = usePathname(), S = useSite();
  const [open, setOpen] = useState(false), [built, setBuilt] = useState(false), [q, setQ] = useState(''), [focus, setFocus] = useState(false);
  const inp = useRef(null);

  const close = useCallback(() => { setOpen(o => { if (o) document.body.style.overflow = ''; return false; }); }, []);
  const show = useCallback(() => { setBuilt(true); setQ(''); setOpen(true); document.body.style.overflow = 'hidden'; setTimeout(() => inp.current && inp.current.focus(), 50); }, []);
  useEffect(() => ui.register('search', show), [ui, show]);
  useEffect(() => { close(); }, [path, close]);
  useEffect(() => { if (!open) return; const k = e => { if (e.key === 'Escape') close(); }; document.addEventListener('keydown', k); return () => document.removeEventListener('keydown', k); }, [open, close]);

  const search = query => { close(); router.push(`${VIEW_PATHS.search}${query ? '?q=' + encodeURIComponent(query) : ''}`); };
  const onKey = e => { if (e.key === 'Enter' && !e.defaultPrevented && !document.querySelector('#msearch .sugg a.on')) { e.preventDefault(); search(q.trim()); } };

  return (
    <div className="msearch" id="msearch" hidden={!open} role="dialog" aria-label="Search" onClick={e => { if (e.target.closest('a[href]')) close(); }}>
      {built ? <>
        <div className="ms-bar"><button type="button" className="ms-x" aria-label="Close search" onClick={close}>{I.left}</button><div className="ms-in" style={{ position: 'relative' }}>
          <input id="msq" ref={inp} placeholder="Where do you want to go?" autoComplete="off" enterKeyHint="search" value={q} onChange={e => setQ(e.target.value)} onKeyDown={onKey} onFocus={() => setFocus(true)} onBlur={() => setTimeout(() => setFocus(false), 180)} />
          <Suggest query={q} open={open && focus && !!q.trim()} inputRef={inp} onPick={close} /></div></div>
        <div className="ms-body"><p className="pl-l">Popular</p><div className="pchips">{POPULAR.map(x => <button key={x} type="button" onClick={() => search(x)}>{x}</button>)}</div>
          <p className="pl-l">Themes</p><div className="ms-themes">{(S ? S.THEMES.slice(0, 8) : []).map(t => <Link key={t.id} href={PATHS.theme(t.id)}>{TI[t.icon]}<span>{t.name}</span></Link>)}</div></div>
      </> : null}
    </div>
  );
}
