/* Upcoming fixed group departures table (original depTable / depRows, extra.js).
   Server component: <DepTable S={S} limit={5} /> — used by the departures page and the home page.
   "Today" is the UTC date at render time, like the original (new Date().toISOString()). */
import Link from 'next/link';
import { img, inr, fmtDate, wkday } from '@/lib/format';
import { PATHS } from '@/lib/routes';
import { EnquireButton } from '@/components/ui/LeadForm';

export function depRows(S, limit) {
  const today = new Date().toISOString().slice(0, 10);
  return S.DEPARTURES.filter(([id, d]) => d >= today && S.P(id)).sort((a, b) => a[1].localeCompare(b[1])).slice(0, limit || 99);
}

export default function DepTable({ S, limit }) {
  return (
    <div className="dep-wrap"><table className="dep"><thead><tr><th>Departs</th><th>Tour</th><th>Duration</th><th>Price</th><th>Status</th><th></th></tr></thead>
      <tbody>{depRows(S, limit).map(([id, d], i) => {
        const p = S.P(id);
        return (
          <tr key={id + d + i}><td><div className="dep-date"><b>{fmtDate(d).split(' ').slice(0, 2).join(' ')}</b><small>{wkday(d)} · {d.slice(0, 4)}</small></div></td>
            <td><Link href={PATHS.pkg(id)} className="dep-t"><img src={img(p.img)} alt="" decoding="async" /><span><b>{p.title}</b><small>{p.route}</small></span></Link></td>
            <td className="num">{p.n}N/{p.n + 1}D</td><td className="num"><b>{inr(p.price)}</b><small className="muted" style={{ display: 'block' }}>per person</small></td>
            <td><span className="stat">Open</span></td>
            <td><EnquireButton className="btn btn-o btn-sm" subject={`${p.title} — departure ${fmtDate(d)}`} CONFIG={S.CONFIG}>Reserve seat</EnquireButton></td></tr>
        );
      })}</tbody></table></div>
  );
}
