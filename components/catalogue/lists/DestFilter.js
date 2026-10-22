'use client';
/* "Search N destinations…" box on the India / International index (legacy destFilterInit):
   hides non-matching destination tiles and empty regions, and shows the match count. */
import { useEffect, useRef, useState } from 'react';
import { I } from '@/components/icons';
import { useAsyncImages } from './asyncImages';

export default function DestFilter({ count, children }) {
  const [q, setQ] = useState(''), [msg, setMsg] = useState(''), ref = useRef(null);
  useAsyncImages();
  useEffect(() => {
    const root = ref.current; if (!root) return;
    const s = q.trim().toLowerCase(); let shown = 0;
    root.querySelectorAll('[id^="reg-"]').forEach(sec => { let n = 0; sec.querySelectorAll('.tall').forEach(c => { const m = !s || c.textContent.toLowerCase().includes(s); c.hidden = !m; if (m) n++; }); sec.hidden = !n; shown += n; });
    setMsg(s ? `${shown} destination${shown === 1 ? '' : 's'} match “${q.trim()}”` : '');
  }, [q]);
  return (
    <div className="wrap" style={{ display: 'grid', gap: '40px' }} ref={ref}>
      <div className="dsearch"><label htmlFor="dfilter" className="sr">Search destinations</label>{I.search}<input id="dfilter" placeholder={`Search ${count} destinations…`} autoComplete="off" value={q} onChange={e => setQ(e.target.value)} /><span id="dcount" className="muted" aria-live="polite">{msg}</span></div>
      {children}
    </div>
  );
}
