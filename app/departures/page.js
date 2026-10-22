/* Group departures (original departuresPage, extra.js) */
import Link from 'next/link';
import { getSite } from '@/lib/site';
import { viewMetadata } from '@/lib/seo';
import { VIEW_PATHS } from '@/lib/routes';
import DepTable from '@/components/editorial/DepTable';
import { Gal, bg } from '@/components/editorial/Hero';

export async function generateMetadata() { const S = await getSite(); return viewMetadata(S, VIEW_PATHS.departures, 'Group Departures'); }

export default async function DeparturesPage() {
  const S = await getSite();
  return (
    <>
      <section className="page-hero"><div className="ph-bg" style={bg('th-group')}></div><div className="wrap"><div><nav className="crumbs"><Link href="/">Home</Link><span>/</span><span>Group Departures</span></nav><span className="eyebrow">Fixed departures</span><h1>Upcoming group departures</h1><p className="lead">Join a small group with a tour manager, pre-booked hotels and transport. Solo travellers are welcome; we pair you on twin sharing or quote a single room.</p></div><Gal imgs={['th-group', 'group-lake', 'europe']} /></div></section>
      <section className="sec"><div className="wrap"><DepTable S={S} /><p className="muted" style={{ fontSize: '13px', marginTop: '12px' }}>Dates and prices are per person on twin sharing and may change with season and availability.</p></div></section>
    </>
  );
}
