/* Package search (original app.js searchItems), used by the planner for "Packages that match".
   S = site store (server getSite() or client useSite()). */
export function searchItems(S, s) {
  const q = (s.q || '').toLowerCase();
  let a = S.PKG.filter(p => {
    const d = S.D(p.dest) || {};
    return !q || [p.title, p.route, d.name, d.region, d.tag, ...p.themes.map(t => (S.T(t) || {}).name)].join(' ').toLowerCase().includes(q)
      || q.split(/\s+/).every(w => (p.title + ' ' + d.name + ' ' + p.route).toLowerCase().includes(w));
  });
  if (s.theme) a = a.filter(p => p.themes.includes(s.theme));
  if (s.type) a = a.filter(p => (S.D(p.dest) || {}).type === s.type);
  return a;
}
