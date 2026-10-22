/* Route manifest: every page of the website as { path (Next.js URL), legacy (URL on the old site), group }.
   group = the area/agent that owns the page (see CONVENTIONS.md). Built from the live site data. */
import { fetchSite } from './legacy.mjs';

export async function manifest(site) {
  site = site || await fetchSite();
  const M = site.model, out = [];
  const add = (path, legacy, group) => out.push({ path, legacy, group });

  /* SEO pages: same URL on both sites (the old site served them pre-rendered) */
  add('/', '/', 'home');
  add('/india/', '/india/', 'places');
  M.STATES.forEach(s => add(`/india/${s.s}/`, `/india/${s.s}/`, 'places'));
  M.PLACES.forEach(p => add(`/india/${p.s}/${p.id}/`, `/india/${p.s}/${p.id}/`, 'places'));
  Object.entries(M.CATS).forEach(([k, c]) => { if (M.PLACES.some(p => p.t.includes(k))) add(`/india/${c[0]}/`, `/india/${c[0]}/`, 'places'); });
  M.DEST.forEach(d => add(`/destinations/${d.id}/`, `/destinations/${d.id}/`, 'catalogue'));
  M.PKG.forEach(p => add(`/packages/${p.id}/`, `/packages/${p.id}/`, 'catalogue'));
  M.THEMES.forEach(t => add(`/themes/${t.id}/`, `/themes/${t.id}/`, 'catalogue'));
  M.GUIDES.forEach(g => add(`/guides/${g.id}/`, `/guides/${g.id}/`, 'editorial'));
  add('/videos/', '/videos/', 'media');
  add('/weekend-getaways-from-delhi/', '/weekend-getaways-from-delhi/', 'media');
  add('/christmas-new-year-packages/', '/christmas-new-year-packages/', 'media');

  /* in-app views: the old site showed them at /#<route> */
  const v = (path, hash, group) => add(path, `/#${hash}`, group);
  v('/holidays/india/', 'india', 'catalogue'); v('/holidays/international/', 'international', 'catalogue');
  v('/themes/', 'themes', 'catalogue'); v('/packages/', 'packages', 'catalogue'); v('/deals/', 'deals', 'catalogue');
  v('/search/', 'search', 'catalogue'); v('/compare/', 'compare', 'catalogue'); v('/wishlist/', 'wishlist', 'catalogue');
  M.SERVICES.forEach(s => v(`/services/${s.id}/`, `s-${s.id}`, 'editorial'));
  v('/services/', 'services', 'editorial'); v('/guides/', 'guides', 'editorial'); v('/visa/', 'visa', 'editorial');
  v('/departures/', 'departures', 'editorial'); v('/about/', 'about', 'editorial'); v('/contact/', 'contact', 'editorial');
  Object.keys(M.STATIC).forEach(k => v(`/${k}/`, k, 'editorial'));
  ['kashmir-paradise', 'goa-fun', 'chardham-yatra', 'fx-goa-nye', 'wk-rishikesh'].filter(id => M.PKG.some(p => p.id === id)).forEach(id => v(`/book/${id}/`, `book-${id}`, 'booking'));
  v('/my-trips/', 'account', 'booking'); v('/pay/', 'pay', 'booking');
  v('/travel-partner/', 'partner', 'partner'); v('/travel-partner/create/', 'partner-create', 'partner'); v('/travel-partner/book/', 'partner-book', 'partner');
  v('/travel-partner/requests/', 'partner-requests', 'partner'); v('/travel-partner/safety/', 'partner-safety', 'partner');
  M.BUDDIES.forEach(b => v(`/travel-partner/profile/${b.id}/`, `buddy-${b.id}`, 'partner'));
  return out;
}
