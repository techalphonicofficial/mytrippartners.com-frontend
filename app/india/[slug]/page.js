/* /india/<slug>/ — a state guide when <slug> is a state, otherwise a trip-type category (original #state-* / #cat-* views) */
import { notFound } from 'next/navigation';
import { getSite } from '@/lib/site';
import { pageMetadata } from '@/lib/seo';
import StatePage from '@/components/places/StatePage';
import CatPage from '@/components/places/CatPage';
import { pageSeo } from '@/components/places/PageSeo';

export const dynamicParams = true;
export async function generateStaticParams() { return []; }

export async function generateMetadata({ params }) { const { slug } = await params; const S = await getSite(); return pageMetadata(S, `/india/${slug}/`); }

export default async function Page({ params }) {
  const { slug } = await params; const S = await getSite();
  const st = S.ST(slug), t = st ? null : S.catBySlug(slug);
  if (!st && !(t && S.PLACES.some(p => p.t.includes(t)))) notFound();
  const { h1, extra, ld } = pageSeo(S, `/india/${slug}/`);
  return <>{ld}{st ? <StatePage S={S} st={st} h1={h1} extra={extra} /> : <CatPage S={S} t={t} h1={h1} extra={extra} />}</>;
}
