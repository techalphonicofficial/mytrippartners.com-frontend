/* Catch-all for URLs without their own route:
   - info pages from the dashboard (FAQ, privacy, terms, cancellation … → /faq/ etc.)
   - programmatic SEO landing pages generated from the dashboard's Live templates (e.g. /family-packages-in-kashmir/)
   Anything else → 404. */
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getSite } from '@/lib/site';
import { viewMetadata, faqLd } from '@/lib/seo';
import { pseoPage } from '@/lib/pseo';
import { dname } from '@/lib/format';
import { PATHS } from '@/lib/routes';
import { JsonLd, SeoExtra } from '@/components/seo/Seo';
import InfoPage, { infoTitle } from '@/components/editorial/InfoPage';
import ListPage from '@/components/catalogue/lists/ListPage';

export const dynamicParams = true;
export async function generateStaticParams() { return []; }

const pathOf = slug => '/' + slug.map(decodeURIComponent).join('/') + '/';
const infoId = (S, slug) => (slug.length === 1 && S.STATIC[slug[0]] ? slug[0] : null);

export async function generateMetadata({ params }) {
  const { slug } = await params; const S = await getSite(), path = pathOf(slug);
  const id = infoId(S, slug);
  if (id) return viewMetadata(S, path, infoTitle(S, id));
  const p = pseoPage(S, path); if (!p) return {};
  const D = 'https://' + S.CONFIG.domain;
  return {
    title: { absolute: p.title }, description: p.meta,
    alternates: { canonical: p.canonical || D + path },
    openGraph: { title: p.title, description: p.meta, url: D + path, images: [`${D}/img/${p.img || 'group-lake'}.jpg`] },
    twitter: { card: 'summary_large_image' },
    robots: p.noindex ? { index: false, follow: true } : { index: true, follow: true, 'max-image-preview': 'large' },
  };
}

export default async function CatchAll({ params }) {
  const { slug } = await params; const S = await getSite(), path = pathOf(slug);
  const id = infoId(S, slug);
  if (id) return <InfoPage S={S} id={id} />;
  const p = pseoPage(S, path); if (!p) notFound();

  const D = 'https://' + S.CONFIG.domain, d = S.D(p.dest) || {}, dn = d.short || d.name || p.vars.dest;
  const items = p.items.map(S.P).filter(Boolean);
  const crumbsLd = { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [['Home', '/'], [dn, PATHS.dest(p.dest)], [p.h1, p.path]].map(([n, u], i) => ({ '@type': 'ListItem', position: i + 1, name: n, item: D + u })) };
  const listLd = { '@context': 'https://schema.org', '@type': 'ItemList', name: p.h1, itemListElement: p.items.slice(0, 20).map((pid, i) => ({ '@type': 'ListItem', position: i + 1, url: `${D}/packages/${pid}/` })) };
  return (
    <>
      <JsonLd data={[crumbsLd, listLd, faqLd(p.faqs)]} />
      <ListPage title={p.h1} lead={p.lead || ''} img={p.img || 'group-lake'} items={items}
        eyebrow={(p.vars.dest_type === 'International' ? 'International' : 'India') + ' holidays'}
        crumbs={<><Link href={PATHS.dest(p.dest)}>{d.id ? dname(d) : dn}</Link><span>/</span>{p.h1}</>} />
      <SeoExtra intro={p.intro} faqs={p.faqs} vars={p.vars} links={p.links} />
    </>
  );
}
