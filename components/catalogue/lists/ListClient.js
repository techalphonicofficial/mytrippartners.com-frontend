'use client';
/* Package list with filters, active-filter chips, sort and "show more" paging
   (legacy listPage filters markup + listInit as composed by polish.js: LIST_PAGE = 24). */
import { useState } from 'react';
import { PkgCard } from '@/components/ui/cards';
import { EnquireButton } from '@/components/ui/LeadForm';
import { inr } from '@/lib/format';
import { useAsyncImages } from './asyncImages';

export const LIST_PAGE = 24;

const TYPES = [['', 'India & International'], ['india', 'India'], ['intl', 'International']];
const DURS = [['', 'Any duration'], ['1-3', 'Up to 3 nights'], ['4-6', '4–6 nights'], ['7-99', '7+ nights']];
const BUDS = [['', 'Any budget'], ['0-15000', 'Under ₹15,000'], ['15000-40000', '₹15,000 – ₹40,000'], ['40000-100000', '₹40,000 – ₹1 lakh'], ['100000-9999999', 'Above ₹1 lakh']];
const SORTS = [['pop', 'Sort: Popular'], ['lo', 'Price: low to high'], ['hi', 'Price: high to low'], ['dur', 'Duration']];
const FILTER_IDS = ['f-type', 'f-theme', 'f-dur', 'f-bud'];
const EMPTY = { 'f-type': '', 'f-theme': '', 'f-dur': '', 'f-bud': '', 'f-sort': 'pop' };

function apply(items, f) {
  let a = items.slice();
  const ty = f['f-type'], th = f['f-theme'], du = f['f-dur'], bu = f['f-bud'], so = f['f-sort'];
  if (ty) a = a.filter(p => p.type === ty);
  if (th) a = a.filter(p => p.themes.includes(th));
  if (du) { const [x, y] = du.split('-').map(Number); a = a.filter(p => p.n >= x && p.n <= y); }
  if (bu) { const [x, y] = bu.split('-').map(Number); a = a.filter(p => p.price >= x && p.price <= y); }
  if (so === 'lo') a.sort((x, y) => x.price - y.price); if (so === 'hi') a.sort((x, y) => y.price - x.price); if (so === 'dur') a.sort((x, y) => x.n - y.n);
  return a;
}

/* items: slim packages { id, title, img, n, price, tag, route, themes, type }; themes: [[id, name]]; CONFIG: contact config */
export default function ListClient({ items, themes, CONFIG, filters = true }) {
  const [f, setF] = useState(EMPTY);
  const [shown, setShown] = useState(LIST_PAGE);
  useAsyncImages();
  const opts = { 'f-type': TYPES, 'f-theme': [['', 'All themes'], ...themes], 'f-dur': DURS, 'f-bud': BUDS, 'f-sort': SORTS };
  const set = patch => { setF(o => ({ ...o, ...patch })); setShown(LIST_PAGE); };
  const sel = (id, label) => <><label className="sr" htmlFor={id}>{label}</label><select id={id} value={f[id]} onChange={e => set({ [id]: e.target.value })}>{opts[id].map(([v, t]) => <option key={v} value={v}>{t}</option>)}</select></>;

  const a = filters ? apply(items, f) : items;
  const n = Math.min(shown, a.length), left = a.length - n;
  const count = a.length ? `${a.length} package${a.length === 1 ? '' : 's'} · ${inr(Math.min(...a.map(p => p.price)))} – ${inr(Math.max(...a.map(p => p.price)))}` : '0 packages';
  const act = FILTER_IDS.filter(id => f[id]).map(id => [id, opts[id].find(o => o[0] === f[id])[1]]);
  const clear = id => set(Object.fromEntries((id === '*' ? FILTER_IDS : [id]).map(k => [k, ''])));

  return (
    <>
      {filters ? <div className="filters">{sel('f-type', 'Type')}{sel('f-theme', 'Theme')}{sel('f-dur', 'Duration')}{sel('f-bud', 'Budget')}{sel('f-sort', 'Sort')}<span className="count num" id="f-count">{count}</span></div> : null}
      {filters ? <div id="fchips" className="fchips">{act.length ? <>{act.map(([id, t]) => <button key={id} type="button" aria-label={`Remove filter ${t}`} onClick={() => clear(id)}>{t} <span aria-hidden="true">×</span></button>)}{act.length > 1 ? <button type="button" className="all" onClick={() => clear('*')}>Clear all</button> : null}</> : null}</div> : null}
      <div className="grid g3" id="plist">{a.length ? a.slice(0, shown).map(p => <PkgCard key={p.id} p={p} />)
        : <div className="empty" style={{ gridColumn: '1/-1' }}><h3>No packages match these filters</h3><p style={{ margin: '8px 0 16px' }}>Try another filter, or ask us for a custom itinerary.</p><EnquireButton className="btn btn-o" subject="Custom itinerary" CONFIG={CONFIG}>Request a custom trip</EnquireButton></div>}</div>
      <div id="pmore" className="pmore">{a.length > LIST_PAGE ? <>
        <div className="pm-bar" aria-hidden="true"><i style={{ width: `${Math.round(n / a.length * 100)}%` }}></i></div><p className="muted num">Showing {n} of {a.length} packages</p>
        {left ? <><button type="button" className="btn btn-ghost" id="pm-btn" onClick={() => setShown(s => s + LIST_PAGE)}>Show {Math.min(LIST_PAGE, left)} more</button>{left > LIST_PAGE ? <button type="button" className="btn btn-ghost" id="pm-all" onClick={() => setShown(1e4)}>Show all {a.length}</button> : null}</> : null}
      </> : null}</div>
    </>
  );
}
