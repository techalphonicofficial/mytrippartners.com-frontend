/* =====================================================================
   Destination / package detail helpers — pure data logic, safe on server and client.
   Verbatim ports of the original website's helpers:
     detail.js  stays, overnightFor, pace, meals, permitNote, relatedGuides (map), priceTable (rows)
     design.js  galOf, dayImg (image choice)
     app.js     faqD, pkgPage inclusions / exclusions / similar packages
   Used by the destination and package pages, and by the compare page (pace, permitNote).
   ===================================================================== */
import { dname, inr } from '@/lib/format';

/* "Srinagar 2N · Gulmarg 1N" → [['Srinagar', 2], ['Gulmarg', 1]] */
export function stays(p) {
  const out = [];
  p.route.split('·').forEach(s => { const m = /(.+?)\s+(\d+)N/.exec(s.trim()); if (m) out.push([m[1].replace(/\(.*?\)/, '').trim(), +m[2]]); });
  return out;
}

/* city of each night (null when the route's nights don't add up to the package's nights) */
export function overnightFor(p) { const arr = []; stays(p).forEach(([c, n]) => { for (let i = 0; i < n; i++) arr.push(c); }); return arr.length === p.n ? arr : null; }

/* [label, description] of the trip's pace */
export function pace(p) {
  if (p.themes.includes('trek') || p.themes.includes('adventure')) return ['Active', 'Long drives, walks or treks on some days'];
  if (p.themes.includes('spiritual')) return ['Moderate', 'Early starts and some walking at temples'];
  return ['Relaxed', 'Comfortable days with free time'];
}

const withDinner = p => p.themes.includes('spiritual') || p.themes.includes('group');

/* meals on day i (0-based) of a package with `last` nights */
export function meals(p, i, last) { const m = []; if (i > 0) m.push('Breakfast'); if (withDinner(p) && i < last) m.push('Dinner'); return m.length ? m.join(' + ') : 'On your own'; }
export const mealsLabel = p => (withDinner(p) ? 'Breakfast + Dinner' : 'Daily breakfast');
export const transportLabel = p => (p.themes.includes('group') ? 'Coach / tempo traveller' : 'Private cab');

/* ID / permit requirements for an India destination */
export function permitNote(id) {
  return ({ ladakh: 'Photo ID for all travellers. Inner Line / protected-area permits for Nubra and Pangong are arranged by us.', arunachal: 'Indian travellers need an Inner Line Permit (ILP); we apply for it with your ID.', 'sikkim-darjeeling': 'Photo ID needed. Permits for Tsomgo Lake and Nathula are arranged locally by us.', spiti: 'Photo ID needed. Some border areas need permits, which we arrange.', andaman: 'Photo ID needed for flights, ferries and Cellular Jail entry.', chardham: 'Photo ID and compulsory Uttarakhand yatra registration, done by us.' })[id]
    || 'Carry a valid government photo ID (Aadhaar, passport, driving licence or voter ID) for every traveller.';
}

/* destination → guide id shown as "Read before you go" */
export const RELATED_GUIDE = { kashmir: 'kashmir-best-time', ladakh: 'ladakh-acclimatisation', chardham: 'char-dham-guide', bali: 'honeymoon-compare', maldives: 'honeymoon-compare', andaman: 'honeymoon-compare', thailand: 'visa-free-countries', nepal: 'visa-free-countries', bhutan: 'visa-free-countries', mauritius: 'visa-free-countries', himachal: 'winter-packing', 'sikkim-darjeeling': 'winter-packing', spiti: 'ladakh-acclimatisation' };
export const relatedGuide = (S, destId) => S.G(RELATED_GUIDE[destId]) || null;

/* unique photos of a destination (cover first) */
export const galOf = d => [...new Set([d.img, ...d.gal])];

/* photo for itinerary day i: package cover first, then the destination's other photos */
export function dayImgName(p, d, i) { const g = [p.img, ...galOf(d).filter(x => x !== p.img)]; return g[i % g.length]; }

/* start / end city and quick facts of a package (quickInfo) */
export function quickFacts(p, d) {
  const st = stays(p), start = st.length ? st[0][0] : dname(d), end = st.length ? st[st.length - 1][0] : dname(d);
  return [
    ['cal', 'Duration', `${p.n} Nights / ${p.n + 1} Days`], ['pin', start === end ? 'Base' : 'Start → End', start === end ? start : `${start} → ${end}`], ['clock', 'Best time', d.best.split(';')[0]],
    ['bed', 'Meals', mealsLabel(p)], ['car', 'Transport', transportLabel(p)], ['star', 'Pace', pace(p)[0]],
  ];
}

/* price table: per-person prices by group size and hotel category */
export const PRICE_CATS = [['Standard', 1], ['Deluxe', 1.25], ['Premium', 1.6]];
export const PRICE_PAX = [['2 travellers', 1], ['4 travellers', 0.95], ['6 travellers', 0.92]];
export const round100 = v => inr(Math.round(v / 100) * 100);

/* what to pack for a destination */
export function packingTip(destId) {
  if (/kashmir|himachal|ladakh|spiti|sikkim|arunachal|chardham|uttarakhand|bhutan|nepal|europe|japan/.test(destId)) return 'Warm layers, thermal wear, comfortable walking shoes, sunglasses and sunscreen.';
  if (/goa|andaman|maldives|bali|thailand|mauritius|kerala|vietnam/.test(destId)) return 'Light cotton clothes, swimwear, sunscreen, hat, flip-flops and a light rain jacket.';
  return 'Comfortable clothes, walking shoes, a light jacket for evenings and modest wear for temples.';
}

/* package inclusions / exclusions */
export function inclusions(p, intl) {
  return ['Hotel stay on twin/double sharing as per itinerary', 'Daily breakfast' + (withDinner(p) ? ' and dinner' : ''), 'All transfers and sightseeing by private vehicle' + (p.themes.includes('group') ? ' / coach' : ''), 'Driver allowance, tolls, parking and fuel', 'Sightseeing as mentioned in the itinerary', intl ? 'Visa assistance and documentation support' : 'Welcome drink on arrival (at select hotels)', intl ? 'Airport transfers and English-speaking local guide on tours' : 'Assistance at every step from your trip expert', '24×7 on-trip support'];
}
export function exclusions(intl) {
  return [intl ? 'International airfare (quoted separately)' : 'Air/rail fare unless mentioned', 'Lunch and meals not mentioned in inclusions', 'Entry tickets, camera fees and optional activities', 'Personal expenses: laundry, tips, phone calls', intl ? 'GST 5% and TCS as applicable on overseas packages' : 'GST 5% as applicable', 'Anything not listed under inclusions'];
}

/* "You may also like": same destination or a shared theme */
export const similarPkgs = (S, p, n = 3) => S.PKG.filter(x => x.id !== p.id && (x.dest === p.dest || x.themes.some(t => p.themes.includes(t)))).slice(0, n);

/* destination FAQs (faqD) */
export const faqD = d => [
  [`What is the best time to visit ${dname(d)}?`, `${d.best}. Our experts will suggest the right month based on what you want to see and do.`],
  [`How many days are enough for ${dname(d)}?`, `Most travellers spend ${d.dur}. We can shorten or extend any itinerary.`],
  ['Which is the nearest airport?', `${d.air}. We arrange pickup and drop from the airport or railway station.`],
  [`Can I customise a ${dname(d)} package?`, `Yes. Hotels, number of nights, vehicle type and activities can all be changed. Share your preferences and we'll send a revised quote.`],
  d.type === 'intl' ? [`Do I need a visa for ${dname(d)}?`, 'Visa rules for Indian passport holders change from time to time. Our visa desk confirms the current rules and helps with documents when you book.'] : [`Is ${dname(d)} safe for families and senior citizens?`, 'Yes. We plan comfortable drives, choose hotels with lifts where possible and can add rest days for senior travellers.'],
];

/* price estimator (extra.js estimatorInit): state { ad, ch, hc } → totals */
export const EST_MULT = { std: 1, dlx: 1.25, prm: 1.6 };
export const EST_LABEL = { std: 'Standard', dlx: 'Deluxe', prm: 'Premium' };
export function estimate(base, s) {
  const pp = base * EST_MULT[s.hc]; const single = s.ad % 2 === 1 ? pp * 0.4 : 0;
  const tot = Math.round((pp * s.ad + pp * 0.7 * s.ch + single) / 100) * 100;
  return { tot, avg: Math.round(tot / (s.ad + s.ch) / 100) * 100, single: !!single, summary: `${s.ad} adult(s), ${s.ch} child(ren), ${EST_LABEL[s.hc]} hotels, est. ${inr(tot)}` };
}
