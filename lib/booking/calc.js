/* =====================================================================
   Booking + payment logic shared by the booking pages (pure functions, safe on server and client).
   Ported from the original system.js (bkCalc, STAGES), improve.js (couponCheck) and payproof.js
   (payCalc, inrWords, payMask, upiLink, CONFIG.pay defaults + dashboard settings).
   ===================================================================== */

/* ---------- Book Now ---------- */
export const STAGES = ['Requested', 'Hotels confirmed', 'Advance paid', 'Vouchers sent', 'Trip completed'];
export const HOTELS = [['std', 'Standard', '3★ or similar'], ['dlx', 'Deluxe', '4★ or similar'], ['prm', 'Premium', '5★ / boutique']];
export const HOTEL_LABEL = { std: 'Standard', dlx: 'Deluxe', prm: 'Premium' };
export const CITIES = ['New Delhi', 'Mumbai', 'Bengaluru', 'Kolkata', 'Chennai', 'Hyderabad', 'Ahmedabad', 'Pune', 'Lucknow', 'Jaipur', 'Patna', 'Chandigarh', 'I will reach on my own'];
export const PAY_METHODS = [['upi', 'UPI', 'GPay, PhonePe, Paytm'], ['card', 'Card', 'Debit / credit, EMI'], ['nb', 'Net banking', 'All major banks']];
export const LIMITS = { ad: [1, 20], ch: [0, 10], inf: [0, 5] };

export const addonList = intl => [
  ['flight', 'Flight / train booking', intl ? 'Best fares from your city, quoted separately' : 'Quoted separately'],
  ['insurance', 'Travel insurance', 'Medical, baggage & cancellation cover'],
  ...(intl ? [['visa', 'Visa assistance', 'Checklist, forms and appointment help']] : []),
  ['pickup', 'Home / office pickup', 'Cab to airport or station'],
  ['celebration', 'Celebration setup', 'Cake, flowers or room décor'],
  ['guide', 'Private guide', 'Full-day local guide in each city'],
];

export const newBooking = pkg => ({ pkg, step: 0, date: '', from: 'New Delhi', hotel: 'std', ad: 2, ch: 0, inf: 0, name: '', phone: '', email: '', names: '', addons: [], notes: '', pay: 'upi', coupon: '', cpct: 0 });

/* earliest departure: 7 days from now (ISO date, UTC like the original) */
export const minDeparture = () => new Date(Date.now() + 7 * 864e5).toISOString().slice(0, 10);

/* price for a booking state s of package p (p.price per person) */
export function bkCalc(p, intl, s) {
  const m = { std: 1, dlx: 1.25, prm: 1.6 }[s.hotel]; const pp = Math.round(p.price * m / 100) * 100;
  const adults = pp * s.ad, kids = Math.round(pp * 0.7 / 100) * 100 * s.ch, single = s.ad % 2 === 1 ? Math.round(pp * 0.4 / 100) * 100 : 0;
  const gross = adults + kids + single; const disc = s.cpct ? Math.round(gross * s.cpct / 100) : 0; const sub = gross - disc; const gst = Math.round(sub * 0.05); const total = sub + gst; const adv = Math.round(total * 0.25 / 100) * 100;
  return { p, intl, pp, adults, kids, single, disc, sub, gst, total, adv };
}

/* validation of the current step → error text or '' */
export function bkValidate(s) {
  if (s.step === 0) { if (!s.date) return 'Please choose a departure date.'; if (s.date < minDeparture()) return 'Departure must be at least 7 days from today. For sooner trips, call us.'; }
  if (s.step === 1) { if (!s.name) return "Please enter the lead traveller's name."; if (!/^[6-9]\d{9}$/.test((s.phone || '').replace(/\D/g, '').slice(-10))) return 'Please enter a valid 10-digit mobile number.'; if (s.email && !/^\S+@\S+\.\S+$/.test(s.email)) return 'Please check the email address.'; }
  return '';
}

/* coupon codes: CONFIG.coupons, with the backend's answers (POST /coupon) taking precedence (api.js wrapper) */
export function couponCheck(coupons, server, code, date) {
  const K = String(code || '').trim().toUpperCase();
  const sv = server[K]; if (sv && !sv.ok) return { ok: false, msg: sv.msg };
  const c = (sv && sv.ok) ? { pct: sv.pct, desc: sv.desc || sv.pct + '% off' } : coupons[K];
  if (!c) return { ok: false, msg: 'This code is not valid.' };
  if (c.maxDays) { const days = Math.round((new Date(date + 'T00:00:00') - new Date()) / 864e5); if (!(days <= c.maxDays)) return { ok: false, msg: `Valid only for departures within ${c.maxDays} days.` }; }
  return { ok: true, pct: c.pct, desc: c.desc };
}

/* ---------- payment ---------- */
const PAY_DEFAULTS = {
  sample: true, upi: 'sample-not-real@upi', payee: 'TripPartner',
  bank: { name: 'Sample Bank Ltd', acName: 'TripPartner (sample)', acNo: '000000000000', ifsc: 'SMPL0000000', branch: 'Sector 62, Noida', type: 'Current account' },
  tat: '2–4 working hours',
};
/* CONFIG.pay defaults ← CONFIG.pay ← dashboard settings (payUpi, payPayee, payTat, bank*) */
export function mergePay(pay, s = {}) {
  const P0 = { ...PAY_DEFAULTS, ...(pay || {}) }; P0.bank = { ...PAY_DEFAULTS.bank, ...((pay && pay.bank) || {}) };
  if (s.payUpi) { P0.upi = s.payUpi; P0.sample = false; }
  if (s.payPayee) P0.payee = s.payPayee;
  if (s.payTat) P0.tat = s.payTat;
  const bk = { name: s.bankName, acName: s.bankAcName, acNo: s.bankAcNo, ifsc: s.bankIfsc, branch: s.bankBranch, type: s.bankType };
  Object.keys(bk).forEach(k => { if (bk[k]) P0.bank[k] = bk[k]; });
  return P0;
}

export const todayLocal = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
export const payDigits = v => String(v || '').replace(/\D/g, '').slice(-10);
export const payMask = v => { v = String(v || ''); return v.length > 4 && !v.includes('•') ? '•'.repeat(Math.min(8, v.length - 4)) + v.slice(-4) : v; };
export const payNormUtr = v => String(v || '').toUpperCase().replace(/[\s-]/g, '');

export function payCalc(b) {
  const proofs = b.proofs || [];
  const paid = b.payments ? b.payments.reduce((a, p) => a + (+p.amount || 0), 0) : (+b.paid || 0);
  const pending = proofs.filter(p => p.status === 'Pending').reduce((a, p) => a + (+p.amount || 0), 0);
  const total = +b.total || 0, adv = +b.adv || Math.round(total * .25);
  const due = Math.max(0, total - paid - pending), advDue = Math.max(0, Math.min(due, adv - paid - pending));
  return { total, adv, paid, pending, due, advDue };
}

export function inrWords(n) {
  n = Math.round(+n || 0); if (!n) return 'Zero';
  const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const t = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const two = x => x < 20 ? a[x] : t[Math.floor(x / 10)] + (x % 10 ? ' ' + a[x % 10] : '');
  const three = x => (x >= 100 ? a[Math.floor(x / 100)] + ' Hundred' + (x % 100 ? ' ' : '') : '') + (x % 100 ? two(x % 100) : '');
  const parts = []; const cr = Math.floor(n / 1e7); n %= 1e7; const l = Math.floor(n / 1e5); n %= 1e5; const th = Math.floor(n / 1e3); n %= 1e3;
  if (cr) parts.push(three(cr) + ' Crore'); if (l) parts.push(two(l) + ' Lakh'); if (th) parts.push(two(th) + ' Thousand'); if (n) parts.push(three(n));
  return parts.join(' ');
}

export const upiLink = (pay, amt, ref) => `upi://pay?pa=${encodeURIComponent(pay.upi)}&pn=${encodeURIComponent(pay.payee)}&am=${Math.round(amt)}.00&cu=INR&tn=${encodeURIComponent('TripPartner ' + ref)}`;

/* server booking (GET /booking/:ref) → the shape kept on the device */
export const fromServer = (r, phone) => ({ ref: r.ref, pkg: r.pkg, pkgTitle: r.pkgTitle, date: r.date, from: r.from, hotel: r.hotel, ad: r.ad, ch: r.ch, inf: r.inf, name: r.name, phone, total: r.total, adv: r.adv, status: r.status, paid: r.paid, cancelled: r.cancelled, proofs: r.proofs || [], payments: r.payments || [], srv: true });

/* compact package list for client components (only what booking pages display) */
export const pkgIndex = S => Object.fromEntries(S.PKG.map(p => [p.id, { id: p.id, title: p.title, img: p.img, n: p.n, price: p.price, route: p.route, tag: p.tag || '' }]));
