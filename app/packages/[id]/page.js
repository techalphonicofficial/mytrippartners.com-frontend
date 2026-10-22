/* Package page: /packages/<id>/ (original route "#p-<id>"). */
import { notFound } from 'next/navigation';
import { getSite } from '@/lib/site';
import { pageMetadata, seoOverride, faqLd } from '@/lib/seo';
import { builtInPage } from '@/lib/pages';
import { JsonLd } from '@/components/seo/Seo';
import PkgPage from '@/components/catalogue/detail/PkgPage';

export const dynamicParams = true;
export async function generateStaticParams() { return []; }

export async function generateMetadata({ params }) {
  const { id } = await params; const S = await getSite();
  return pageMetadata(S, `/packages/${id}/`);
}

export default async function Page({ params }) {
  const { id } = await params; const S = await getSite();
  const p = S.P(id); if (!p || !S.D(p.dest)) notFound();
  const path = `/packages/${id}/`, ov = seoOverride(S, path), page = builtInPage(S, path);
  return (
    <>
      <PkgPage S={S} p={p} ov={ov} />
      <JsonLd data={[...(page ? page.jsonld() : []), faqLd(ov.faqs)]} />
    </>
  );
}
