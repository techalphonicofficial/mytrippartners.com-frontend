'use client';
/* Instant search suggestions under a search input (destinations, themes, packages).
   <Suggest query open inputRef onPick/> renders the original <div class="sugg" role="listbox">;
   ↑/↓ move the selection, Enter opens it. */
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSite } from '@/lib/client/hooks';
import { img, inr } from '@/lib/format';
import { PATHS } from '@/lib/routes';

export function suggestions(S, query) {
  const q = query.trim().toLowerCase(); if (!S || !q) return [];
  const ds = S.DEST.filter(d => (d.name + ' ' + d.tag + ' ' + d.region).toLowerCase().includes(q)).slice(0, 5);
  const ps = S.PKG.filter(p => (p.title + ' ' + p.route).toLowerCase().includes(q)).slice(0, 5);
  const ts = S.THEMES.filter(t => t.name.toLowerCase().includes(q)).slice(0, 2);
  return [...ds.map(d => [PATHS.dest(d.id), d.img, d.name, `Destination · from ${inr(d.price)}`]), ...ts.map(t => [PATHS.theme(t.id), t.img, t.name + ' holidays', 'Theme']), ...ps.map(p => [PATHS.pkg(p.id), p.img, p.title, `${p.n}N/${p.n + 1}D · ${inr(p.price)}`])];
}

export default function Suggest({ query, open, inputRef, onPick }) {
  const S = useSite(), router = useRouter();
  const rows = useMemo(() => suggestions(S, query), [S, query]);
  const [sel, setSel] = useState(-1);
  useEffect(() => setSel(-1), [query]);
  useEffect(() => {
    const el = inputRef && inputRef.current; if (!el) return;
    const k = e => {
      if (!open || !rows.length) return;
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); setSel(s => (s + (e.key === 'ArrowDown' ? 1 : -1) + rows.length) % rows.length); }
      if (e.key === 'Enter' && sel > -1) { e.preventDefault(); router.push(rows[sel][0]); onPick && onPick(); }
    };
    el.addEventListener('keydown', k); return () => el.removeEventListener('keydown', k);
  }, [inputRef, open, rows, sel, router, onPick]);
  return (
    <div className="sugg" role="listbox" hidden={!open || !query.trim()} onMouseDown={e => e.preventDefault()}>
      {open && query.trim() ? (rows.length ? rows.map(([h, i, t, s], n) => <Link key={h} href={h} role="option" className={n === sel ? 'on' : undefined} onClick={() => onPick && onPick()}><img src={img(i)} alt="" /><span><b>{t}</b><small>{s}</small></span></Link>)
        : <div className="sg-empty">No matches. Press Enter to search all packages.</div>) : null}
    </div>
  );
}
