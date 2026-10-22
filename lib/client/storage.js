/* =====================================================================
   Per-device stores (localStorage), shared by all client components.
   Same keys as the original website, so visitors keep their wishlist, compare list, recent views,
   trips and outbox after the switch to Next.js.
   React components subscribe with the hooks in lib/client/hooks.js (useSyncExternalStore).
   ===================================================================== */

const canUse = () => typeof window !== 'undefined';
export const ls = (k, v) => {
  if (!canUse()) return null;
  try { if (v === undefined) return JSON.parse(localStorage.getItem(k) || 'null'); localStorage.setItem(k, JSON.stringify(v)); } catch (e) { return null; }
  return v;
};

/* observable value persisted under one key */
export function createStore(key, empty) {
  let mem;
  const subs = new Set();
  const store = {
    key, empty,
    get() { if (mem === undefined) { const v = ls(key); mem = v == null ? empty : v; } return mem; },
    set(v) { mem = v; ls(key, v); subs.forEach(f => f()); },
    update(fn) { store.set(fn(store.get())); },
    subscribe(f) { subs.add(f); return () => subs.delete(f); },
    serverSnapshot: () => empty,
  };
  if (canUse()) window.addEventListener('storage', e => { if (e.key === key) { mem = undefined; subs.forEach(f => f()); } });
  return store;
}

const EMPTY_LIST = [];
export const wishlist = createStore('tp_wishlist', EMPTY_LIST);
export const compare = createStore('tp_cmp', EMPTY_LIST);
export const recent = createStore('tp_recent', EMPTY_LIST);
export const deviceDB = createStore('tp_db', { leads: [], bookings: [] });

/* wishlist (WL) */
export const WL = {
  list: () => wishlist.get(),
  has: id => wishlist.get().includes(id),
  toggle(id) { const a = wishlist.get().slice(); const i = a.indexOf(id); if (i > -1) a.splice(i, 1); else a.push(id); wishlist.set(a); return i === -1; },
};

/* compare (CMP): max 3 packages; toggle() returns false when the limit is reached */
export const CMP = {
  MAX: 3,
  list: () => compare.get(),
  toggle(id) { let a = compare.get(); if (a.includes(id)) a = a.filter(x => x !== id); else { if (a.length >= CMP.MAX) return false; a = [...a, id]; } compare.set(a); return true; },
  clear: () => compare.set([]),
};

/* recently viewed packages (RV), newest first, max 8 */
export const RV = {
  list: () => recent.get(),
  add: id => recent.set([id, ...recent.get().filter(x => x !== id)].slice(0, 8)),
};

/* device copy of enquiries and bookings ("My Trips" works offline) */
export const DB = {
  get: () => deviceDB.get(),
  set: v => deviceDB.set(v),
  addLead(l) { const d = DB.get(); deviceDB.set({ ...d, leads: [{ id: 'EQ' + Date.now().toString(36).toUpperCase().slice(-6), at: new Date().toISOString(), status: 'New', ...l }, ...d.leads] }); },
  addBooking(b) { const d = DB.get(); deviceDB.set({ ...d, bookings: [b, ...d.bookings] }); },
};

export const refNo = () => 'TP' + new Date().getFullYear().toString().slice(2) + Math.random().toString(36).slice(2, 7).toUpperCase();
