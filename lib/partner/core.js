/* =====================================================================
   Travel Partner: pure logic shared by server and client components (original partner.js + partner2.js).
   No browser access here; device state lives in lib/partner/state.js.
   ===================================================================== */
import { dname, MON } from '@/lib/format';

export const STYLES = ['Adventure', 'Backpacking', 'Beaches', 'Culture', 'Food', 'Nature', 'Snow', 'Spiritual', 'International', 'Road trips', 'Wildlife', 'Photography', 'Wellness', 'Slow travel'];
export const BUDS = ['Under ₹15k', '₹15k–25k', '₹25k–50k', '₹50k–1L', '₹1L+'];
export const AGES = ['18–60', '18–25', '25–30', '30–40', '40–60'];
export const PACES = ['Relaxed', 'Balanced', 'Packed'];
export const DIETS = ['Veg', 'Non-veg', 'Jain'];
export const ID_TYPES = [['aadhaar', 'Aadhaar (masked)'], ['pan', 'PAN card'], ['passport', 'Passport'], ['dl', 'Driving licence'], ['voter', 'Voter ID']];
export const SORTS = [['match', 'Best match'], ['new', 'Newest'], ['ver', 'Most verified'], ['young', 'Age: youngest'], ['old', 'Age: oldest']];
export const PAY_LABEL = { me: 'You pay for both', partner: 'Partner pays for both', split: 'Split 50/50', individual: 'Individual bookings' };
export const HOTELS = [['std', 'Standard (3★)'], ['dlx', 'Deluxe (4★)'], ['prm', 'Premium (5★)']];

export const hueOf = id => [...String(id)].reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
export const initials = name => String(name || '').split(' ').map(x => x[0]).join('');
export const firstName = name => String(name || '').split(' ')[0];

/* "1 Jan 2026"-style month parsing used by the original sorts */
const monthTime = m => { const [mo, yr] = String(m).split(' '); const i = MON.indexOf(mo); return i < 0 || !yr ? NaN : new Date(+yr, i, 1).getTime(); };

/* ---------- partner search filters (STATE.pf) ---------- */
export const PF_DEFAULT = { q: '', dest: '', month: '', g: 'Anyone', age: '18–60', styles: [], bud: '', lang: '', from: '', ver: false, selfie: false, nonsmoke: false, veg: false, pace: '', women: false, sort: 'match', mode: 'smart' };
/* pfReset(extra): fresh filters, keeping the current search mode */
export const pfReset = (cur, extra) => ({ ...PF_DEFAULT, styles: [], mode: (cur && cur.mode) || 'smart', ...(extra || {}) });

/* URL presets (old data-pf-* hooks) → filters.  q = { g, women, d, m, mode } */
export function applyPreset(cur, q) {
  if (!q) return cur;
  let f = cur;
  if (q.women) f = pfReset(f, { g: 'Female', women: true, mode: 'women' });
  else if (q.g || q.d || q.m) f = pfReset(f, { ...(q.d ? { dest: q.d } : {}), ...(q.m ? { month: q.m } : {}), ...(q.g ? { g: q.g } : {}) });
  if (q.mode) f = { ...f, mode: q.mode };
  return f;
}
export const presetKey = q => (q ? [q.g, q.women, q.d, q.m, q.mode].map(x => x || '').join('|') : '');

/* ---------- compatibility ---------- */
export function matchScore(b, p) {
  if (!p) return null; let s = 0, w = 0; const add = (ok, pts) => { w += pts; if (ok === true) s += pts; else if (typeof ok === 'number') s += pts * ok; };
  add(!p.dest ? 0.6 : b.trips.some(t => t[0] === p.dest), 30);
  add(!p.month || p.month === 'Flexible' ? 0.6 : b.trips.some(t => t[1] === p.month) ? true : 0.3, 15);
  const bs = (b.style + ' ' + b.int.join(' ')).toLowerCase(); const st = p.styles || []; add(st.length ? Math.min(1, st.filter(x => bs.includes(x.toLowerCase())).length / Math.min(2, st.length)) : 0.5, 20);
  add(!p.bud ? 0.6 : (() => { const d = Math.abs(BUDS.indexOf(p.bud) - BUDS.indexOf(b.bud)); return d === 0 ? 1 : d === 1 ? 0.6 : 0.1; })(), 10);
  add(!p.age ? 0.6 : Math.max(0, 1 - Math.abs(p.age - b.age) / 15), 8);
  add(!p.pace ? 0.6 : p.pace === b.pace ? 1 : 0.4, 7);
  add(!p.diet ? 0.6 : (p.diet === b.diet || (p.diet === 'Non-veg')) ? 1 : 0.4, 5);
  add(p.lang && p.lang.length ? (b.lang.some(l => p.lang.includes(l)) ? 1 : 0) : 0.7, 5);
  return Math.round(s / w * 100);
}

/* my preferences: the quiz answers (tp_pq), else my profile (tp_partner.me) */
export function myPrefs(pq, ps) {
  if (pq) return pq;
  const me = ps && ps.me;
  return me ? { dest: me.dest || '', month: me.month || '', styles: me.styles || [], bud: me.bud || '', diet: me.diet || '', smoke: me.smoke || false, pace: me.pace || '', age: me.age || 0, lang: me.lang || [] } : null;
}

/* filtered + sorted travellers, each with _m (match %) — returns new objects, never mutates the data */
export function buddyMatches(buddies, f, pr, dn) {
  const [a1, a2] = (f.age || '18–60').split('–').map(Number), q = (f.q || '').trim().toLowerCase();
  const r = buddies.filter(b => (f.g === 'Anyone' || b.g === f.g) && b.age >= a1 && b.age <= a2
    && (!f.dest || b.trips.some(t => t[0] === f.dest)) && (!f.month || b.trips.some(t => t[1].startsWith(f.month)))
    && (!f.styles.length || f.styles.some(s => (b.style + ' ' + b.int.join(' ')).toLowerCase().includes(s.toLowerCase())))
    && (!f.bud || b.bud === f.bud) && (!f.lang || b.lang.includes(f.lang)) && (!f.from || (b.from || b.city) === f.from)
    && (!f.ver || b.ver.includes('ID')) && (!f.selfie || b.selfie) && (!f.nonsmoke || !b.smoke) && (!f.veg || ['Veg', 'Jain'].includes(b.diet)) && (!f.pace || b.pace === f.pace)
    && (!f.women || (b.g === 'Female' && b.womenOnly))
    && (!q || [b.name, b.city, b.style, b.about, ...b.int, ...b.lang, ...b.trips.map(t => dn(t[0]) + ' ' + t[1])].join(' ').toLowerCase().includes(q)))
    .map(b => ({ ...b, _m: matchScore(b, pr) }));
  const joined = b => monthTime(b.joined || 'Jan 2026');
  const srt = { match: (x, y) => (y._m ?? 0) - (x._m ?? 0), new: (x, y) => joined(y) - joined(x), young: (x, y) => x.age - y.age, old: (x, y) => y.age - x.age, ver: (x, y) => (y.ver.length + (y.selfie ? 1 : 0)) - (x.ver.length + (x.selfie ? 1 : 0)) }[f.sort];
  if (srt) r.sort(srt);
  return r;
}

/* active-filter chips: [key, label] */
export function filterChips(f, dn) {
  const chips = []; if (f.q) chips.push(['q', `“${f.q}”`]); if (f.dest) chips.push(['dest', dn(f.dest)]); if (f.month) chips.push(['month', f.month]); if (f.g !== 'Anyone') chips.push(['g', f.g === 'Female' ? 'Women' : 'Men']); if (f.age !== '18–60') chips.push(['age', 'Age ' + f.age]);
  f.styles.forEach(s => chips.push(['style:' + s, s])); [['bud', f.bud], ['lang', f.lang], ['from', f.from && 'From ' + f.from], ['pace', f.pace]].forEach(([k, v]) => { if (v) chips.push([k, v]); });
  [['ver', 'ID verified'], ['selfie', 'Selfie verified'], ['nonsmoke', 'Non-smoker'], ['veg', 'Veg / Jain'], ['women', 'Women-only circle']].forEach(([k, l]) => { if (f[k]) chips.push([k, l]); });
  return chips;
}

/* ---------- joint booking price (jointCalc) ---------- */
export function jointCalc(j, p) {
  const m = { std: 1, dlx: 1.25, prm: 1.6 }[j.hotel] || 1;
  const pp = Math.round(p.price * m / 100) * 100; const sup = j.room === 'separate' ? Math.round(pp * 0.4 / 100) * 100 : 0;
  const each = pp + sup, total = each * 2;
  const share = { me: [total, 0], partner: [0, total], split: [total / 2, total / 2], individual: [each, each] }[j.pay] || [total / 2, total / 2];
  return { p, pp, sup, each, total, you: share[0], them: share[1], adv: Math.round(total * 0.25) };
}

/* ---------- data for the client components (plain JSON, from the server store S) ---------- */
export function partnerData(S) {
  const dests = {};
  S.DEST.forEach(d => { dests[d.id] = { id: d.id, n: dname(d), name: d.name, img: d.img }; });
  return {
    demo: !!S.CONFIG.demo,
    buddies: S.BUDDIES,
    dests,
    destOrder: S.DEST.map(d => d.id),
    pkgs: S.PKG.map(p => ({ id: p.id, title: p.title, n: p.n, dest: p.dest, price: p.price, img: p.img, route: p.route })),
  };
}
/* unique destinations / months of the travellers (sorted like the original) */
export const buddyDestIds = buddies => [...new Set(buddies.flatMap(b => b.trips.map(t => t[0])))];
export const buddyMonths = buddies => [...new Set(buddies.flatMap(b => b.trips.map(t => t[1])))].sort((a, b) => monthTime(a) - monthTime(b));

/* joint booking link with presets (old data-pbook-p / data-pbook-b): bookHref({ p: pkgId, b: buddyId }) */
export const bookHref = q => { const u = new URLSearchParams(Object.entries(q || {}).filter(([, v]) => v)); return '/travel-partner/book/' + (u.toString() ? '?' + u : ''); };
