/* /india/ — India travel guide A–Z (original #places view) */
import { getSite } from '@/lib/site';
import { pageMetadata } from '@/lib/seo';
import PlacesIndex from '@/components/places/PlacesIndex';
import { pageSeo } from '@/components/places/PageSeo';

const PATH = '/india/';

export async function generateMetadata() { const S = await getSite(); return pageMetadata(S, PATH); }

export default async function Page() {
  const S = await getSite();
  const { h1, extra, ld } = pageSeo(S, PATH);
  return <>{ld}<PlacesIndex S={S} h1={h1} extra={extra} /></>;
}
