/* India place guides — data logic (distances, generated copy, itinerary, tips, FAQs, metadata, JSON-LD).
   Verbatim port of the original places.js helpers; every function takes the site store S. */
import { PATHS } from './routes';

export function km(a, b) { const R = 6371, r = x => x * Math.PI / 180; const dLa = r(b.lat - a.lat), dLo = r(b.lng - a.lng); const h = Math.sin(dLa / 2) ** 2 + Math.cos(r(a.lat)) * Math.cos(r(b.lat)) * Math.sin(dLo / 2) ** 2; return Math.round(2 * R * Math.asin(Math.sqrt(h))); }
export const HUBS = [['Delhi', 28.61, 77.21], ['Mumbai', 19.08, 72.88], ['Bengaluru', 12.97, 77.59], ['Kolkata', 22.57, 88.36], ['Chennai', 13.08, 80.27], ['Hyderabad', 17.39, 78.49], ['Ahmedabad', 23.02, 72.57], ['Chandigarh', 30.73, 76.78], ['Jaipur', 26.91, 75.79], ['Lucknow', 26.85, 80.95], ['Guwahati', 26.14, 91.74], ['Kochi', 9.93, 76.26], ['Patna', 25.59, 85.14], ['Bhubaneswar', 20.30, 85.82], ['Indore', 22.72, 75.86], ['Srinagar', 34.08, 74.80], ['Dehradun', 30.32, 78.03], ['Siliguri', 26.73, 88.40], ['Pune', 18.52, 73.86], ['Coimbatore', 11.02, 76.96], ['Madurai', 9.93, 78.12], ['Visakhapatnam', 17.69, 83.22], ['Bhopal', 23.26, 77.41], ['Raipur', 21.25, 81.63], ['Ranchi', 23.34, 85.31], ['Udaipur', 24.58, 73.71], ['Jodhpur', 26.24, 73.02], ['Varanasi', 25.32, 83.01], ['Mangaluru', 12.91, 74.86], ['Thiruvananthapuram', 8.52, 76.94], ['Leh', 34.16, 77.58], ['Jammu', 32.73, 74.86]].map(([n, lat, lng]) => ({ n, lat, lng }));
export const nearestHubs = p => HUBS.filter(h => h.n.toLowerCase() !== p.n.toLowerCase()).map(h => ({ ...h, k: km(p, h) })).filter(h => h.k > 15).sort((a, b) => a.k - b.k).slice(0, 3);
export const nearbyPlaces = (S, p, n = 6) => S.PLACES.filter(x => x.id !== p.id).map(x => ({ x, k: km(p, x) })).sort((a, b) => a.k - b.k).slice(0, n);
export const TLAB = { hill: 'Hill station', beach: 'Beach', pilgrimage: 'Pilgrimage', heritage: 'Heritage', wildlife: 'Wildlife', adventure: 'Adventure', snow: 'Snow', nature: 'Nature', city: 'City', romantic: 'Honeymoon', backwaters: 'Backwaters', desert: 'Desert', spiritual: 'Spiritual', nightlife: 'Nightlife', wine: 'Wine country' };
export const maxDays = p => { const m = String(p.days).match(/\d+/g) || ['2']; return Math.min(5, Math.max(...m.map(Number))); };

export function placePkgs(S, p) {
  let a = p.dest ? S.pkgsOf(p.dest) : [];
  if (!a.length) { const ds = [...new Set(S.PLACES.filter(x => x.s === p.s && x.dest).map(x => x.dest))]; a = ds.flatMap(S.pkgsOf); }
  if (!a.length) { a = S.PKG.filter(x => x.themes.some(t => p.t.includes(t === 'spiritual' ? 'pilgrimage' : t) || (t === 'beach' && p.t.includes('beach')) || (t === 'adventure' && p.t.includes('adventure')))).filter(x => (S.D(x.dest) || {}).type === 'india'); }
  return a.slice(0, 3);
}

/* ---- generated copy ---- */
export function aboutCopy(S, p) {
  const st = S.ST(p.s), types = p.t.map(t => TLAB[t] || t).join(', ').toLowerCase();
  const hubs = nearestHubs(p); const alt = p.alt ? ` Sitting at about ${p.alt.toLocaleString('en-IN')} m above sea level, it stays ${p.alt > 2000 ? 'cold at night for most of the year' : p.alt > 1000 ? 'pleasantly cool in summer' : 'mild compared with the plains'}.` : '';
  return [p.d,
    `${p.n} is in ${st.n} and is best known as a ${types} destination. The best time to visit is ${p.best}, and most travellers spend ${p.days} day${String(p.days) === '1' ? '' : 's'} here.${alt}`,
    `The nearest airport is ${p.air}, and the nearest railhead is ${p.rail}. The closest major city is ${hubs[0].n}, about ${hubs[0].k.toLocaleString('en-IN')} km away as the crow flies.`];
}
export function itinerary(p) {
  const n = maxDays(p), a = p.a.slice(); const per = Math.ceil(a.length / n); const days = [];
  for (let i = 0; i < n; i++) { const chunk = a.slice(i * per, (i + 1) * per); if (!chunk.length) break; days.push(chunk); }
  return days;
}
export function tipsFor(p) {
  const t = new Set(p.t), out = [];
  if (p.alt > 2500) out.push('High altitude: rest on the first day, drink plenty of water and avoid alcohol until you acclimatise.');
  if (t.has('hill') || t.has('snow')) out.push('Carry warm layers even in summer; evenings in the hills get cold quickly.');
  if (t.has('snow')) out.push('Snow boots and jackets can usually be rented locally; keep a buffer day for road closures after snowfall.');
  if (t.has('beach')) out.push('Use reef-safe sunscreen, follow lifeguard flags and avoid swimming in rough seas during the monsoon.');
  if (t.has('pilgrimage')) out.push('Dress modestly for temples, check darshan timings and book special darshan or aarti slots in advance where available.');
  if (t.has('wildlife')) out.push('Safari permits sell out early; book online as soon as slots open and carry neutral-coloured clothing.');
  if (t.has('heritage')) out.push('Start early to beat crowds and heat; many monuments sell online tickets, and some close one day a week.');
  if (t.has('adventure')) out.push('Choose licensed operators for rafting, paragliding or treks, and check insurance and safety gear.');
  if (t.has('desert')) out.push('Days are hot and nights cold in the desert — pack sunglasses, a scarf and a warm layer.');
  if (t.has('city')) out.push('Use app cabs or the metro where available; keep some cash for markets and street food.');
  if (/permit/i.test(p.d + p.a.join(' '))) out.push('Some areas need permits; TripPartner arranges them with your ID when you book.');
  out.push('Carry a government photo ID for every traveller for hotel check-in and entry tickets.');
  return [...new Set(out)].slice(0, 6);
}
export function faqsFor(S, p) {
  const hubs = nearestHubs(p), near = nearbyPlaces(S, p, 3).map(o => o.x.n);
  return [
    [`What is the best time to visit ${p.n}?`, `The best time to visit ${p.n} is ${p.best}. ${p.t.includes('hill') ? 'Summer is popular for escaping the heat, while winter can bring snow at higher points.' : p.t.includes('beach') ? 'The dry season brings calm seas and clear skies; the monsoon is quieter and greener.' : 'Weather is most comfortable for sightseeing in these months.'}`],
    [`How many days are enough for ${p.n}?`, `${p.days} day${String(p.days) === '1' ? ' is' : 's are'} enough to see the main sights of ${p.n}: ${p.a.slice(0, 3).join(', ')}. Add a day to combine it with nearby places like ${near.slice(0, 2).join(' and ')}.`],
    [`How to reach ${p.n}?`, `By air: ${p.air}. By train: ${p.rail}. By road: ${p.n} is connected by road to ${hubs.map(h => h.n).join(', ')}; taxis and buses run from the nearest airport and station.`],
    [`What are the top places to visit in ${p.n}?`, `Top places include ${p.a.slice(0, 6).join(', ')}.`],
    ...(p.food && p.food.length ? [[`What is the famous food of ${p.n}?`, `Try ${p.food.join(', ')}.${p.buy && p.buy.length ? ` Popular things to buy are ${p.buy.join(', ')}.` : ''}`]] : []),
    [`Is there a ${p.n} tour package?`, `Yes. TripPartner plans ${p.n} trips with hotels, transfers and sightseeing, and can combine it with ${near[0]}. Share your dates for a free custom quote.`],
  ];
}
export function placeJsonLd(S, p) {
  const canon = path => `https://${S.CONFIG.domain}${path}`;
  const st = S.ST(p.s); const url = canon(`/india/${p.s}/${p.id}/`);
  return [
    { '@context': 'https://schema.org', '@type': 'TouristDestination', name: p.n, description: p.d, url, geo: { '@type': 'GeoCoordinates', latitude: p.lat, longitude: p.lng }, containedInPlace: { '@type': 'State', name: st.n }, touristType: p.t.map(t => TLAB[t]), includesAttraction: p.a.map(a => ({ '@type': 'TouristAttraction', name: a })) },
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [['Home', canon('/')], ['India', canon('/india/')], [st.n, canon(`/india/${p.s}/`)], [p.n, url]].map(([n, u], i) => ({ '@type': 'ListItem', position: i + 1, name: n, item: u })) },
    { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqsFor(S, p).map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) },
  ];
}
export const placeMeta = (S, p) => ({ title: `${p.n} Tourism ${new Date().getFullYear()}: Places to Visit, Best Time, How to Reach & Packages | TripPartner`, desc: `Plan your ${p.n} trip: ${p.a.slice(0, 3).join(', ')} and more. Best time (${p.best}), ${p.days}-day itinerary, how to reach, local food, tips and ${p.n} tour packages.`, path: PATHS.place(p), img: S.placeImg(p) });
