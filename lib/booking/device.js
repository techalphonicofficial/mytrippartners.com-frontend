/* Device copy of bookings (tp_db) + live status from the backend (client only).
   Ported from payproof.js (payLocal, paySave, payFetch, payTripsEnhance refresh) and next.js (tripsSync). */
import { DB } from '@/lib/client/storage';
import { get } from '@/lib/client/api';
import { fromServer } from './calc';

export const payLocal = ref => (DB.get().bookings || []).find(b => b.ref === ref);

export function paySave(ref, patch) {
  const d = DB.get(); let out = null;
  const bookings = d.bookings.map(b => (b.ref === ref ? (out = { ...b, ...patch }) : b));
  if (out) DB.set({ ...d, bookings });
  return out;
}

/* GET /booking/:ref?phone= → merge into the device copy (or add it, when the package exists on this site) */
export async function payFetch(ref, phone, hasPkg) {
  let d;
  try { d = await get(`/booking/${encodeURIComponent(ref)}?phone=${encodeURIComponent(phone)}`); } catch (e) { throw new Error(e.message && e.message !== 'Request failed' ? e.message : 'Booking not found.'); }
  const b = fromServer(d, phone); const loc = payLocal(ref);
  if (loc) paySave(ref, { status: b.status, paid: b.paid, proofs: b.proofs, payments: b.payments, cancelled: b.cancelled, total: b.total || loc.total, adv: b.adv || loc.adv });
  else if (hasPkg(b.pkg)) { const db = DB.get(); DB.set({ ...db, bookings: [{ ...b, at: new Date().toISOString(), viaLink: true }, ...db.bookings] }); }
  return loc ? { ...loc, ...payLocal(ref) } : b;
}

/* My Trips: stage + paid amount of the latest 10 bookings (next.js tripsSync), throttled to once per 15 s */
let syncBusy = false;
export function tripsSync() {
  const db = DB.get(); if (syncBusy || !db.bookings.length) return;
  syncBusy = true;
  Promise.all(db.bookings.slice(0, 10).map(b => get(`/booking/${encodeURIComponent(b.ref)}?phone=${encodeURIComponent(b.phone || '')}`).catch(() => null)))
    .then(res => {
      let ch = false; const cur = DB.get();
      const bookings = cur.bookings.map(b => { const r = res.find(x => x && x.ref === b.ref); if (r && (b.status !== r.status || b.paid !== r.paid)) { ch = true; return { ...b, status: r.status, paid: r.paid }; } return b; });
      if (ch) DB.set({ ...cur, bookings });
    })
    .finally(() => { setTimeout(() => { syncBusy = false; }, 15000); });
}

/* My Trips: refresh proof statuses of bookings with proofs under verification (payTripsEnhance), once per 20 s */
let proofBusy = false;
export function proofsSync(hasPkg) {
  if (proofBusy) return;
  const todo = DB.get().bookings.filter(b => (b.proofs || []).some(p => p.status === 'Pending')).slice(0, 5); if (!todo.length) return;
  proofBusy = true;
  Promise.all(todo.map(b => payFetch(b.ref, b.phone, hasPkg).catch(() => null)))
    .finally(() => { setTimeout(() => { proofBusy = false; }, 20000); });
}
