/* Home page block "Explore N+ places across India" (original homePlacesSection, places.js).
   Server component: <HomePlaces S={S} /> */
import Link from 'next/link';
import { I } from '@/components/icons';
import { SecHead } from '@/components/ui/cards';
import { PlaceCard } from '@/components/ui/boxes';
import { PATHS, VIEW_PATHS } from '@/lib/routes';

const PICK = ['srinagar', 'manali', 'rishikesh', 'varanasi', 'jaipur', 'udaipur', 'north-goa', 'munnar', 'alleppey', 'darjeeling', 'gangtok', 'hampi'];

export default function HomePlaces({ S }) {
  const pick = PICK.map(S.PLC).filter(Boolean);
  return (
    <section className="sec-tight"><div className="wrap">
      <SecHead h={`Explore ${S.PLACES.length}+ places across India`} p="City guides with best time, how to reach, itineraries and local food" right={<Link className="btn btn-ghost" href={VIEW_PATHS.places}>Explore India A–Z {I.arrow}</Link>} />
      <div className="plc-grid">{pick.map(p => <PlaceCard key={p.id} p={p} S={S} />)}</div>
      <div className="pchips" style={{ marginTop: '18px' }}>{S.STATES.map(s => <Link key={s.s} className="chipx" href={PATHS.state(s.s)}>{s.n}</Link>)}</div>
    </div></section>
  );
}
