/* =====================================================================
   URL scheme of the website.
   The original site used "#route" links for in-app views (e.g. #book-goa-fun, #partner-create).
   Every view now has a real URL; hashToPath() maps an old "#route" to it (used for links in
   content such as guide call-to-actions, and to redirect old shared links like /#p-goa-fun).
   ===================================================================== */

export const PATHS = {
  home: () => '/',
  dest: id => `/destinations/${id}/`,
  pkg: id => `/packages/${id}/`,
  theme: id => `/themes/${id}/`,
  guide: id => `/guides/${id}/`,
  service: id => `/services/${id}/`,
  state: s => `/india/${s}/`,
  place: (p) => `/india/${p.s}/${p.id}/`,
  cat: slug => `/india/${slug}/`,
  book: id => `/book/${id}/`,
  buddy: id => `/travel-partner/profile/${id}/`,
  pay: ref => (ref ? `/pay/${ref}/` : '/pay/'),
  receipt: (ref, pf) => `/receipt/${ref}/${pf ? pf + '/' : ''}`,
  info: id => `/${id}/`,
};

/* fixed views: legacy hash → path */
export const VIEW_PATHS = {
  home: '/', places: '/india/', videos: '/videos/', weekend: '/weekend-getaways-from-delhi/', 'christmas-new-year': '/christmas-new-year-packages/',
  india: '/holidays/india/', international: '/holidays/international/', themes: '/themes/', packages: '/packages/', deals: '/deals/', search: '/search/',
  compare: '/compare/', account: '/my-trips/', partner: '/travel-partner/', 'partner-create': '/travel-partner/create/', 'partner-book': '/travel-partner/book/',
  'partner-requests': '/travel-partner/requests/', 'partner-safety': '/travel-partner/safety/', guides: '/guides/', departures: '/departures/', visa: '/visa/',
  services: '/services/', about: '/about/', contact: '/contact/', wishlist: '/wishlist/', pay: '/pay/', admin: '/admin/',
};

/* "#p-goa-fun" / "p-goa-fun" → "/packages/goa-fun/".  S = site store (for lookups); unknown routes → null */
export function hashToPath(h, S) {
  if (!h) return null;
  const r = String(h).replace(/^#/, '');
  if (VIEW_PATHS[r]) return VIEW_PATHS[r];
  if (S && S.STATIC && S.STATIC[r]) return PATHS.info(r);
  let m = /^(pay|receipt)(?:-([A-Za-z0-9]+))?(?:-(PF[A-Za-z0-9]+))?$/.exec(r);
  if (m) return m[1] === 'pay' ? PATHS.pay(m[2] ? m[2].toUpperCase() : '') : PATHS.receipt((m[2] || '').toUpperCase(), m[3]);
  const [k, ...rest] = r.split('-'); const id = rest.join('-');
  if (!id) return null;
  switch (k) {
    case 'd': return PATHS.dest(id);
    case 'p': return PATHS.pkg(id);
    case 't': return PATHS.theme(id);
    case 'g': return PATHS.guide(id);
    case 's': return PATHS.service(id);
    case 'state': return PATHS.state(id);
    case 'cat': return PATHS.cat(id);
    case 'book': return PATHS.book(id);
    case 'buddy': return PATHS.buddy(id);
    case 'place': { const p = S && S.PLC(id); return p ? PATHS.place(p) : null; }
    default: return null;
  }
}

/* href for a legacy route string; falls back to "/" so links never break */
export const routeHref = (h, S) => hashToPath(h, S) || '/';
