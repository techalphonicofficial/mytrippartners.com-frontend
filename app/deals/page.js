/* Deals & offers (legacy route "deals": budget / long-weekend / bestseller packages, cheapest first) */
import { getSite } from '@/lib/site';
import { viewMetadata } from '@/lib/seo';
import ListPage from '@/components/catalogue/lists/ListPage';

export async function generateMetadata() { const S = await getSite(); return viewMetadata(S, '/deals/', 'Deals'); }

export default async function Page() {
  const S = await getSite();
  const items = S.PKG.filter(p => p.price < 20000 || /Long weekend|Budget|Bestseller/.test(p.tag || '')).sort((a, b) => a.price - b.price);
  return <ListPage title="Deals & offers" lead={<>Last-minute sale: use code <span className="code">LASTMINUTE</span> on departures within 15 days. Long-weekend getaways and budget picks below.</>}
    img="goa-beach" crumbs="Deals" items={items} eyebrow="Limited-period offers" />;
}
