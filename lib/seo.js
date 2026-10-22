/* =====================================================================
   SEO for pages: metadata (title, description, canonical, Open Graph, robots) with the dashboard's
   per-URL overrides (SEO & pSEO → Pages) applied on the server.
     export async function generateMetadata({ params }) { const S = await getSite(); return pageMetadata(S, '/packages/x/'); }
     const ov = seoOverride(S, path)   → { h1, intro, faqs } to use in the page body (see <SeoExtra/>)
   For in-app views without a built-in SEO entry use viewMetadata(S, path, title, description).
   ===================================================================== */
import { builtInPage } from './pages';

export const overrideFor = (S, path) => (S.seo.overrides || []).find(o => o.path === path) || null;

function meta(S, path, { title, desc, img, absoluteTitle, noindex, canonical }) {
  const D = 'https://' + S.CONFIG.domain;
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description: desc,
    alternates: { canonical: canonical || D + path },
    openGraph: { title: absoluteTitle ? title : `${title} | TripPartner`, description: desc, url: D + path, images: [`${D}/img/${img || 'group-lake'}.jpg`] },
    twitter: { card: 'summary_large_image' },
    robots: noindex ? { index: false, follow: true } : { index: true, follow: true, 'max-image-preview': 'large' },
  };
}

/* metadata for a built-in SEO page (title already ends with "| TripPartner") */
export function pageMetadata(S, path) {
  const p = builtInPage(S, path); if (!p) return {};
  const o = overrideFor(S, path) || {};
  return meta(S, path, { title: o.title || p.title, desc: o.meta || p.desc, img: p.img, absoluteTitle: true, noindex: !!o.noindex, canonical: o.canonical });
}

/* metadata for an in-app view (title gets "| TripPartner" appended, like the original document titles) */
export function viewMetadata(S, path, title, desc) {
  const o = overrideFor(S, path) || {};
  return meta(S, path, { title: o.title || title, desc: o.meta || desc || 'TripPartner — holiday packages, pilgrimage yatras, group tours and international trips. Explore · Plan · Travel · Together.', absoluteTitle: !!o.title, noindex: !!o.noindex, canonical: o.canonical });
}

/* body overrides for a page: { h1, intro, faqs } (empty strings / [] when not overridden) */
export function seoOverride(S, path) {
  const o = overrideFor(S, path);
  return { h1: (o && o.h1) || '', intro: (o && o.intro) || '', faqs: ((o && o.faqs) || []).filter(f => f.q && f.a) };
}

export const faqLd = faqs => ((faqs || []).length ? { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqs.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) } : null);
