/* Travel guides index (original guidesIndex, extra.js) */
import Link from 'next/link';
import { getSite } from '@/lib/site';
import { viewMetadata } from '@/lib/seo';
import { VIEW_PATHS } from '@/lib/routes';
import GuideCard from '@/components/editorial/GuideCard';
import { Gal, bg } from '@/components/editorial/Hero';

export async function generateMetadata() { const S = await getSite(); return viewMetadata(S, VIEW_PATHS.guides, 'Travel Guides'); }

export default async function GuidesPage() {
  const S = await getSite();
  return (
    <>
      <section className="page-hero"><div className="ph-bg" style={bg('spiti')}></div><div className="wrap"><div><nav className="crumbs"><Link href="/">Home</Link><span>/</span><span>Travel Guides</span></nav><span className="eyebrow">Travel Guides</span><h1>Plan smarter with TripPartner guides</h1><p className="lead">Seasons, visas, packing lists and destination tips from our travel desk.</p></div><Gal imgs={['spiti', 'kashmir-lake', 'thailand']} /></div></section>
      <section className="sec"><div className="wrap grid g3">{S.GUIDES.map(g => <GuideCard key={g.id} g={g} />)}</div></section>
    </>
  );
}
