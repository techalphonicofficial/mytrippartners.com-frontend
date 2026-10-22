'use client';
/* Side-by-side package comparison (legacy improve.js comparePage body), from the device's compare list.
   Fewer than 2 packages → empty state. Packages that can't be booked online get "Enquire" instead of "Book Now". */
import Link from 'next/link';
import { useCompare, useSite } from '@/lib/client/hooks';
import { CMP } from '@/lib/client/storage';
import { EmptyState } from '@/components/ui/boxes';
import { EnquireButton } from '@/components/ui/LeadForm';
import { img, inr } from '@/lib/format';
import { PATHS, VIEW_PATHS } from '@/lib/routes';
import { pace, permitNote, mealsLabel, transportLabel } from '@/lib/catalogue/detail';

export default function CompareView() {
  const ids = useCompare(), S = useSite();
  const a = S ? ids.map(S.P).filter(Boolean) : [];
  if (a.length < 2) return <section className="sec"><div className="wrap"><EmptyState h={a.length ? 'Add one more package' : 'Nothing to compare yet'} p="Tap “+ Compare” on at least two package cards." href={VIEW_PATHS.packages} btn="Browse packages" /></div></section>;
  const D = id => S.D(id) || { name: id, best: '', type: '' };
  const cheapest = Math.min(...a.map(p => p.price)), shortest = Math.min(...a.map(p => p.n));
  const row = (label, fn) => <tr key={label || 'act'}><th scope="row">{label}</th>{a.map(p => <td key={p.id}>{fn(p)}</td>)}</tr>;
  return (
    <section className="sec"><div className="wrap"><div className="cmp-wrap"><table className="cmp-t"><thead><tr><th></th>{a.map(p => <th key={p.id}><img src={img(p.img)} alt="" decoding="async" /><b>{p.title}</b><button type="button" className="link-arrow" onClick={() => CMP.toggle(p.id)}>Remove</button></th>)}</tr></thead><tbody>
      {row('Starting price', p => <><b className="price">{inr(p.price)}</b>{p.price === cheapest ? <span className="best-tag">Lowest</span> : null}<small className="muted" style={{ display: 'block' }}>per person</small></>)}
      {row('Duration', p => <>{p.n}N / {p.n + 1}D{p.n === shortest && a.some(x => x.n !== p.n) ? <span className="best-tag">Shortest</span> : null}</>)}
      {row('Destination', p => <Link href={PATHS.dest(p.dest)} style={{ color: 'var(--blue)' }}>{D(p.dest).name}</Link>)}
      {row('Route', p => p.route)}
      {row('Best time', p => D(p.dest).best.split(';')[0])}
      {row('Meals', mealsLabel)}
      {row('Transport', transportLabel)}
      {row('Pace', p => pace(p)[0])}
      {row('Themes', p => p.themes.map(t => (S.T(t) || {}).name).join(', '))}
      {row('Visa / permits', p => (D(p.dest).type === 'intl' ? 'Visa assistance included' : permitNote(p.dest).split('.')[0]))}
      {row('Price per day', p => inr(Math.round(p.price / (p.n + 1) / 10) * 10))}
      {row('', p => <div style={{ display: 'grid', gap: '8px' }}>{S.blocked.has(p.id) ? <EnquireButton className="btn btn-o btn-sm" subject={`${p.title} — availability`} CONFIG={S.CONFIG}>Enquire</EnquireButton> : <Link className="btn btn-o btn-sm" href={PATHS.book(p.id)}>Book Now</Link>}<Link className="btn btn-ghost btn-sm" href={PATHS.pkg(p.id)}>View details</Link></div>)}
    </tbody></table></div></div></section>
  );
}
