/* =====================================================================
   Site data store (server + client): wraps the content model from the backend
   (GET /api/public/site → model) with the lookups the website uses everywhere.
   Mirrors the original website's globals and helpers: DEST, PKG, D(), P(), T(), G(), ST(), PLC() …
   ===================================================================== */

export function createStore(site) {
  const M = site.model;
  /* destination "from" price = cheapest package of that destination (as the original site did at load) */
  const DEST = M.DEST.map(d => {
    const prices = M.PKG.filter(p => p.dest === d.id).map(p => p.price);
    return prices.length ? { ...d, price: Math.min(...prices) } : d;
  });
  const index = (arr, key = 'id') => new Map(arr.map(x => [x[key], x]));
  const iD = index(DEST), iP = index(M.PKG), iT = index(M.THEMES), iG = index(M.GUIDES), iST = index(M.STATES, 's'), iPLC = index(M.PLACES), iB = index(M.BUDDIES), iR = index(M.REELS);
  const S = {
    version: site.version,
    CONFIG: M.CONFIG, DEST, PKG: M.PKG, THEMES: M.THEMES, WEEKEND: M.WEEKEND, FESTIVE: M.FESTIVE, VISA: M.VISA, VISA_X: M.VISA_X,
    SERVICES: M.SERVICES, SVC_DETAIL: M.SVC_DETAIL, STATIC: M.STATIC, DEPARTURES: M.DEPARTURES, GUIDES: M.GUIDES, STATES: M.STATES,
    PLACES: M.PLACES, CATS: M.CATS, BUDDIES: M.BUDDIES, PFAQ: M.PFAQ, PFAQ2: M.PFAQ2, REELS: M.REELS, SHOWREEL: M.SHOWREEL,
    LONG_WEEKENDS: M.LONG_WEEKENDS, HS_HINTS: M.HS_HINTS,
    blocked: new Set(site.blocked || []),
    reviews: site.reviews || [],
    seo: site.seo || { settings: {}, overrides: [], templates: [] },
    D: id => iD.get(id), P: id => iP.get(id), T: id => iT.get(id), G: id => iG.get(id), ST: s => iST.get(s), PLC: id => iPLC.get(id), B: id => iB.get(id), RL: id => iR.get(id),
    pkgsOf: id => M.PKG.filter(p => p.dest === id),
    catBySlug: slug => Object.keys(M.CATS).find(k => M.CATS[k][0] === slug),
    placeImg: p => p.img || (iST.get(p.s) || {}).img || 'group-lake',
    regionList: region => DEST.filter(d => d.type === 'india' && d.region === region),
  };
  return S;
}
