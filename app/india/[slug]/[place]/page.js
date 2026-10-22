/* /india/<state>/<place>/ — place guide (original #place-* view).
   The state segment is named [slug] because Next.js requires one name per dynamic level (see ../page.js). */
import { notFound } from 'next/navigation';
import { getSite } from '@/lib/site';
import { pageMetadata } from '@/lib/seo';
import PlacePage from '@/components/places/PlacePage';
import { pageSeo } from '@/components/places/PageSeo';

export const dynamicParams = true;
export async function generateStaticParams() { return []; }

export async function generateMetadata({ params }) { const { slug, place } = await params; const S = await getSite(); return pageMetadata(S, `/india/${slug}/${place}/`); }

export default async function Page({ params }) {
  const { slug, place } = await params; const S = await getSite();
  const p = S.PLC(place);
  if (!p || p.s !== slug || !S.ST(p.s)) notFound();
  const { h1, extra, ld } = pageSeo(S, `/india/${slug}/${place}/`);
  return <>{ld}<PlacePage S={S} p={p} h1={h1} extra={extra} /></>;
}
