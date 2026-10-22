/* "Travelling solo?" side box on destination and package pages (original partnerPkgBox(p)).
   Server component: <PartnerPkgBox S={S} p={{ dest: 'goa', id: 'goa-fun' }} /> — p.id may be '' (destination page without packages). */
import Link from 'next/link';
import { I } from '@/components/icons';
import { dname } from '@/lib/format';
import { VIEW_PATHS } from '@/lib/routes';

export default function PartnerPkgBox({ S, p }) {
  const n = S.BUDDIES.filter(b => b.trips.some(t => t[0] === p.dest)).length;
  const d = S.D(p.dest), dn = d ? dname(d) : p.dest;
  return (
    <div className="box pbox"><h3>{I.users} Travelling solo?</h3><p className="muted" style={{ fontSize: '14px' }}>{n ? `${n} traveller${n > 1 ? 's' : ''} ${S.CONFIG.demo ? '(sample) ' : ''}plan${n > 1 ? '' : 's'} to visit ${dn}.` : `Find a verified partner for ${dn}.`} Book together, sit together, and choose shared or separate rooms.</p>
      <div style={{ display: 'grid', gap: '8px', marginTop: '12px' }}><Link className="btn btn-b" href={`${VIEW_PATHS.partner}?d=${encodeURIComponent(p.dest)}`}>Find a travel partner</Link><Link className="btn btn-ghost" href={VIEW_PATHS['partner-book'] + (p.id ? `?p=${encodeURIComponent(p.id)}` : '')}>Book with a partner</Link></div></div>
  );
}
