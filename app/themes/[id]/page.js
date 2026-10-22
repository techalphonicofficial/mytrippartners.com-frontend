/* Theme page (legacy route "t-<id>": listPage of the theme's packages + listInit). Built-in SEO page. */
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getSite } from '@/lib/site';
import { pageMetadata, seoOverride, faqLd } from '@/lib/seo';
import { builtInPage } from '@/lib/pages';
import { VIEW_PATHS } from '@/lib/routes';
import { JsonLd, SeoExtra } from '@/components/seo/Seo';
import ListPage from '@/components/catalogue/lists/ListPage';

export const dynamicParams = true;
export async function generateStaticParams() { return []; }
export async function generateMetadata({ params }) { const { id } = await params; const S = await getSite(); return pageMetadata(S, `/themes/${id}/`); }

export default async function Page({ params }) {
  const { id } = await params;
  const S = await getSite(); const t = S.T(id); if (!t) notFound();
  const path = `/themes/${id}/`, ov = seoOverride(S, path), bp = builtInPage(S, path);
  const extra = ov.intro || ov.faqs.length ? <SeoExtra intro={ov.intro} faqs={ov.faqs} /> : null;
  return (
    <>
      <JsonLd data={[...(bp ? bp.jsonld() : []), faqLd(ov.faqs)]} />
      <ListPage title={ov.h1 || `${t.name} Holidays`} lead={t.desc} img={t.img} crumbs={<><Link href={VIEW_PATHS.themes}>Themes</Link><span>/</span>{t.name}</>}
        items={S.PKG.filter(p => p.themes.includes(id))} eyebrow="Holiday theme" afterHero={extra} />
    </>
  );
}
