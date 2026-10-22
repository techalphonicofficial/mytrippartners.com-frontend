/* =====================================================================
   Built-in SEO pages: title, description, share image, sitemap priority, type and structured data.
   Same values the previous static build produced (prerender.js). Used by:
     - each page's generateMetadata()  → pageMetadata(S, path)
     - each page's JSON-LD             → <JsonLd data={builtInPage(S, path).jsonld()} />
     - sitemap.xml and the SEO dashboard's page list
   ===================================================================== */
import { inr } from './format';
import { placeMeta, placeJsonLd } from './places';

const TYPE = { '': 'Home', destinations: 'Destination', packages: 'Package', guides: 'Guide', themes: 'Theme', videos: 'Videos', 'weekend-getaways-from-delhi': 'Collection', 'christmas-new-year-packages': 'Collection' };
const pageType = p => { const seg = p.split('/')[1] || ''; if (seg === 'india') return p.split('/').length > 4 ? 'Place guide' : p === '/india/' ? 'India index' : 'State / category'; return TYPE[seg] || 'Page'; };

let memo = { v: null, map: null };
/* Map(path → page) for the given site store (memoised per content version) */
export function builtInPages(S) {
  if (memo.v === S.version && memo.map) return memo.map;
  const D = 'https://' + S.CONFIG.domain, Y = new Date().getFullYear(), map = new Map();
  const crumbs = list => ({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: list.map(([n, u], i) => ({ '@type': 'ListItem', position: i + 1, name: n, item: D + u })) });
  const add = (path, route, title, desc, jsonld, img, prio) => map.set(path, { path, route, title, desc, img: img || 'group-lake', prio: prio || 0.6, type: pageType(path), jsonld });
  const site = { '@context': 'https://schema.org', '@type': 'WebSite', name: 'TripPartner', url: D + '/', potentialAction: { '@type': 'SearchAction', target: D + '/search/?q={search_term_string}', 'query-input': 'required name=search_term_string' } };

  add('/', 'home', 'TripPartner — Holiday Packages, Pilgrimage Yatras, Group Tours & Travel Partner', `Plan holidays across India and abroad with TripPartner: ${S.PLACES.length}+ India travel guides, ${S.PKG.length} tour packages, Char Dham yatras, group tours and verified travel partners.`, () => [site], 'group-lake', 1.0);
  add('/india/', 'places', `${S.PLACES.length}+ Tourist Places in India (${Y}): State-wise Travel Guide | TripPartner`, `Explore ${S.PLACES.length}+ tourist places in India across ${S.STATES.length} states and UTs — best time, how to reach, itineraries, food and tour packages.`,
    () => [crumbs([['Home', '/'], ['India', '/india/']]), { '@context': 'https://schema.org', '@type': 'ItemList', itemListElement: S.STATES.map((s, i) => ({ '@type': 'ListItem', position: i + 1, url: `${D}/india/${s.s}/`, name: s.n })) }], 'taj', 0.9);
  for (const st of S.STATES) {
    const l = S.PLACES.filter(p => p.s === st.s);
    add(`/india/${st.s}/`, `state-${st.s}`, `${st.n} Tourism ${Y}: ${l.length} Best Places to Visit, Best Time & Packages | TripPartner`, `${st.n} travel guide: ${l.slice(0, 4).map(p => p.n).join(', ')} and more. Best time to visit, how to reach, itineraries and ${st.n} tour packages.`,
      () => [crumbs([['Home', '/'], ['India', '/india/'], [st.n, `/india/${st.s}/`]]), { '@context': 'https://schema.org', '@type': 'ItemList', itemListElement: l.map((p, i) => ({ '@type': 'ListItem', position: i + 1, url: `${D}/india/${st.s}/${p.id}/`, name: p.n })) }], st.img, 0.8);
  }
  for (const p of S.PLACES) { const m = placeMeta(S, p); add(m.path, `place-${p.id}`, m.title, m.desc, () => placeJsonLd(S, p), m.img, 0.8); }
  for (const k of Object.keys(S.CATS)) {
    const [slug, h, d] = S.CATS[k], l = S.PLACES.filter(p => p.t.includes(k)); if (!l.length) continue;
    add(`/india/${slug}/`, `cat-${slug}`, `${l.length} Best ${h} (${Y}) — Places, Best Time & Packages | TripPartner`, `${d} Compare ${l.length} places with best time, how to reach and trip ideas.`, () => [crumbs([['Home', '/'], ['India', '/india/'], [h, `/india/${slug}/`]])], S.placeImg(l[0]), 0.7);
  }
  for (const d of S.DEST) add(`/destinations/${d.id}/`, `d-${d.id}`, `${d.name} Tour Packages ${Y} from ${inr(d.price)} | TripPartner`, `${d.name} holiday packages: ${d.hl.slice(0, 3).join(', ')}. Best time ${d.best}. Customisable itineraries with hotels and transfers.`, () => [crumbs([['Home', '/'], [d.name, `/destinations/${d.id}/`]])], d.img, 0.8);
  for (const p of S.PKG) {
    const d = S.D(p.dest) || { id: p.dest, name: p.dest };
    add(`/packages/${p.id}/`, `p-${p.id}`, `${p.title} — ${p.n}N/${p.n + 1}D from ${inr(p.price)} | TripPartner`, `${p.title}: ${p.route}. Day-wise itinerary, hotels, inclusions and prices. Book online or get a custom quote.`,
      () => [crumbs([['Home', '/'], [d.name, `/destinations/${d.id}/`], [p.title, `/packages/${p.id}/`]]), { '@context': 'https://schema.org', '@type': 'TouristTrip', name: p.title, description: p.route, touristType: p.themes, itinerary: { '@type': 'ItemList', itemListElement: p.plan.map((x, i) => ({ '@type': 'ListItem', position: i + 1, name: `Day ${i + 1}: ${x.split('|')[0]}` })) }, offers: { '@type': 'Offer', price: p.price, priceCurrency: 'INR', availability: 'https://schema.org/InStock' } }], p.img, 0.7);
  }
  for (const g of S.GUIDES) add(`/guides/${g.id}/`, `g-${g.id}`, `${g.title} | TripPartner`, g.intro, () => [{ '@context': 'https://schema.org', '@type': 'Article', headline: g.title, description: g.intro, author: { '@type': 'Organization', name: 'TripPartner' }, publisher: { '@type': 'Organization', name: 'TripPartner' } }], g.img, 0.6);
  for (const t of S.THEMES) { const n = S.PKG.filter(p => p.themes.includes(t.id)).length; add(`/themes/${t.id}/`, `t-${t.id}`, `${t.name} Holiday Packages ${Y} | TripPartner`, `${t.desc} ${n} packages across India and abroad.`, () => [], t.img, 0.6); }
  add('/videos/', 'videos', 'TripPartner TV — Travel Videos & Reels | TripPartner', 'Watch TripPartner travel reels and films: Kashmir, Kerala, Goa, Ladakh, Bali, Char Dham, Rajasthan and Andaman.', () => [{ '@context': 'https://schema.org', '@type': 'VideoObject', name: 'TripPartner showreel', description: 'Destinations across India and abroad', thumbnailUrl: D + '/video/showreel.jpg', contentUrl: D + '/video/showreel.mp4', uploadDate: new Date().toISOString().slice(0, 10) }], 'group-lake', 0.6);
  if (S.WEEKEND.length) add('/weekend-getaways-from-delhi/', 'weekend', `Weekend Getaways from Delhi NCR (${Y}): ${S.WEEKEND.length} Trips from ${inr(Math.min(...S.WEEKEND.map(p => p.price)))} | TripPartner`, 'Weekend trips from Delhi, Noida and Gurugram: Rishikesh, Mussoorie, Nainital, Jaipur, Agra, Shimla, Jim Corbett and more. Leave Friday, back Sunday.', () => [{ '@context': 'https://schema.org', '@type': 'ItemList', itemListElement: S.WEEKEND.map((p, i) => ({ '@type': 'ListItem', position: i + 1, url: `${D}/packages/${p.id}/`, name: p.title })) }], 'rafting', 0.9);
  if (S.FESTIVE.length) add('/christmas-new-year-packages/', 'christmas-new-year', `Christmas & New Year Packages 2026–27: ${S.FESTIVE.length} Festive Trips | TripPartner`, 'Christmas and New Year 2026–27 holiday packages: Goa NYE party, white Christmas in Manali, Gulmarg snow, Udaipur, Jaisalmer desert camp, Dubai fireworks, Thailand, Bali, Singapore and Europe Christmas markets.', () => [{ '@context': 'https://schema.org', '@type': 'ItemList', itemListElement: S.FESTIVE.map((p, i) => ({ '@type': 'ListItem', position: i + 1, url: `${D}/packages/${p.id}/`, name: p.title })) }], 'kashmir-snow', 0.9);
  memo = { v: S.version, map };
  return map;
}
export const builtInPage = (S, path) => builtInPages(S).get(path) || null;
