/* Built-in SEO page wiring shared by the places routes: dashboard override (h1, intro, FAQs) and JSON-LD. */
import { builtInPage } from '@/lib/pages';
import { seoOverride, faqLd } from '@/lib/seo';
import { JsonLd, SeoExtra } from '@/components/seo/Seo';
import { AsyncImages } from './PlacesClient';

/* → { h1, extra: <SeoExtra/> | null (render after the first <section>), ld: <JsonLd/> + the decoding="async" pass } */
export function pageSeo(S, path) {
  const ov = seoOverride(S, path), page = builtInPage(S, path);
  const extra = ov.intro || ov.faqs.length ? <SeoExtra intro={ov.intro} faqs={ov.faqs} /> : null;
  const ld = <><JsonLd data={[...(page ? page.jsonld() : []), faqLd(ov.faqs)]} /><AsyncImages /></>;
  return { h1: ov.h1, extra, ld };
}
