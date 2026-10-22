/* Destination page: /destinations/<id>/ (original route "#d-<id>"). */
import { notFound } from 'next/navigation';
import { getSite } from '@/lib/site';
import { pageMetadata, seoOverride, faqLd } from '@/lib/seo';
import { builtInPage } from '@/lib/pages';
import { JsonLd } from '@/components/seo/Seo';
import DestPage from '@/components/catalogue/detail/DestPage';

export const dynamicParams = true;
export async function generateStaticParams() { return []; }

export async function generateMetadata({ params }) {
  const { id } = await params; const S = await getSite();
  return pageMetadata(S, `/destinations/${id}/`);
}

export default async function Page({ params }) {
  const { id } = await params; const S = await getSite();
  const d = S.D(id); if (!d) notFound();
  const path = `/destinations/${id}/`, ov = seoOverride(S, path), page = builtInPage(S, path);
  return (
    <>
      <DestPage S={S} d={d} ov={ov} />
      <JsonLd data={[...(page ? page.jsonld() : []), faqLd(ov.faqs)]} />
    </>
  );
}
