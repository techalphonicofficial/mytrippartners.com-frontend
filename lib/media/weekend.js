/* Weekend getaways helpers (legacy weekend.js): filters, upcoming weekends, dates. */

export const WKV = { adventure: 'Adventure', mountains: 'Mountains', spiritual: 'Spiritual', heritage: 'Heritage', wildlife: 'Wildlife' };
export const WKT = [['all', 'Any distance', () => true], ['short', 'Under 4 hrs', p => p.wk.hrs < 4], ['mid', '4–6 hrs', p => p.wk.hrs >= 4 && p.wk.hrs <= 6], ['long', '6–8 hrs', p => p.wk.hrs > 6 && p.wk.hrs <= 8], ['night', 'Overnight travel', p => p.wk.hrs > 8]];

/* next k Fridays (today when it is Friday), local time */
export function nextWeekends(k = 3, now = new Date()) {
  const out = []; const d = new Date(now); d.setHours(0, 0, 0, 0); const day = d.getDay(); const add = (5 - day + 7) % 7 || 7;
  d.setDate(d.getDate() + (day === 5 ? 0 : add));
  for (let i = 0; i < k; i++) { const f = new Date(d); f.setDate(d.getDate() + i * 7); out.push(f); }
  return out;
}
export const fmtD = d => d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
export const plus = (d, days) => new Date(d.getTime() + days * 864e5);
/* "Y-M-D" of a local date and back (to pass the server's first Friday to the client) */
export const ymd = d => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
export const fromYmd = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };

/* weekend trips sorted by distance, as plain data */
export const weekendList = S => S.WEEKEND.slice().sort((a, b) => a.wk.km - b.wk.km)
  .map(p => ({ id: p.id, title: p.title, img: p.img, n: p.n, tag: p.tag || '', price: p.price, wk: p.wk, blocked: S.blocked.has(p.id) }));
