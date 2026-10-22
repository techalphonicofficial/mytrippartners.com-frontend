/* All packages (legacy route "packages": listPage + listInit) */
import { getSite } from '@/lib/site';
import { viewMetadata } from '@/lib/seo';
import ListPage from '@/components/catalogue/lists/ListPage';

export async function generateMetadata() { const S = await getSite(); return viewMetadata(S, '/packages/', 'All Packages'); }

export default async function Page() {
  const S = await getSite();
  return <ListPage title="All holiday packages" lead={`${S.PKG.length} ready itineraries across India and abroad. Filter by theme, duration and budget.`} img="group-lake" crumbs="Packages" items={S.PKG} />;
}
