/* Christmas & New Year helpers (legacy festive.js): countdown, dates, early-bird price, filter tabs. */

export const FX_NYE = new Date('2026-12-31T23:59:59+05:30');
export const FX_LAB = { xmas: 'Christmas', nye: 'New Year', both: 'Xmas + New Year' };
export const fxDate = s => new Date(s + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
export function fxLeft(now = Date.now()) { const ms = Math.max(0, FX_NYE - now); return { d: Math.floor(ms / 864e5), h: Math.floor(ms / 36e5) % 24, m: Math.floor(ms / 6e4) % 60, s: Math.floor(ms / 1e3) % 60 }; }
export const fxEB = p => Math.round(p.price * (1 - p.fx.eb / 100) / 100) * 100;

const FX_TABS = [['all', 'All festive trips', () => true], ['xmas', 'Christmas', p => p.fx.occ !== 'nye'], ['nye', 'New Year', p => p.fx.occ !== 'xmas'], ['india', 'In India', (p, d) => d.type === 'india'], ['intl', 'Abroad', (p, d) => d.type === 'intl'], ['snow', 'Snow', p => ['himachal', 'kashmir'].includes(p.dest)], ['beach', 'Beach', p => p.themes.includes('beach')]];
export const FX_TAB_LIST = FX_TABS.map(([k, l]) => [k, l]);

/* festive trips sorted by departure, as plain data (tabs = the filter tabs each trip belongs to) */
export const festiveList = S => S.FESTIVE.slice().sort((a, b) => a.fx.dep.localeCompare(b.fx.dep)).map(p => {
  const d = S.D(p.dest) || { name: p.dest, type: '' };
  return { id: p.id, title: p.title, img: p.img, n: p.n, price: p.price, fx: p.fx, eb: fxEB(p), where: d.name, type: d.type, blocked: S.blocked.has(p.id), tabs: FX_TABS.filter(t => t[2](p, d)).map(t => t[0]) };
});
