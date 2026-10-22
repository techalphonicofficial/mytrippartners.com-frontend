/* =====================================================================
   Travel Partner device state (browser only), same localStorage keys and shapes as the original:
     tp_partner  PS  { me, req: [], book: [], fav: [] }   my profile, requests, proposals, shortlist
     tp_pq       PQ  quiz answers (compatibility preferences)
     tp_sent         { me, ids } — what was already sent to the backend (de-duplication, as api.js did)
   PV holds identity documents in memory only (never stored).
   PF / JB are the in-memory search filters and joint-booking choices (STATE.pf / STATE.jb), kept while
   the visitor moves between pages, reset on reload.
   ===================================================================== */
import { createStore, ls } from '@/lib/client/storage';
import { send } from '@/lib/client/api';
import { PF_DEFAULT } from './core';

const EMPTY_PS = { me: null, req: [], book: [] };
export const psStore = createStore('tp_partner', EMPTY_PS);
export const pqStore = createStore('tp_pq', null);

/* PS.set also sends new profile / requests / proposals to the dashboard (original api.js wrapper) */
export const PS = {
  get: () => { const v = psStore.get() || EMPTY_PS; return { ...v, me: v.me || null, req: v.req || [], book: v.book || [] }; },
  set(st) {
    psStore.set(st);
    const sent = ls('tp_sent') || { me: '', ids: [] };
    if (st.me && st.me.phone && !st.me.apiId) { const { photo, ...pub } = st.me; const sig = JSON.stringify(pub); if (sig !== sent.me) { sent.me = sig; send('/partners', pub); } }
    (st.req || []).forEach(r => { if (r.id && !sent.ids.includes('r' + r.id)) { sent.ids.push('r' + r.id); send('/partner-requests', { ...r, phone: st.me && st.me.phone }); } });
    (st.book || []).forEach(r => { if (r.id && !sent.ids.includes('b' + r.id)) { sent.ids.push('b' + r.id); send('/proposals', r); } });
    sent.ids = sent.ids.slice(-200); ls('tp_sent', sent);
  },
};
export const PQ = { get: () => pqStore.get(), set: v => pqStore.set(v) };

/* shortlist ("fav") inside tp_partner */
export const shortlist = {
  get: () => PS.get().fav || [],
  has: id => shortlist.get().includes(id),
  toggle(id) { const st = PS.get(); const fav = [...(st.fav || [])]; const i = fav.indexOf(id); if (i < 0) fav.unshift(id); else fav.splice(i, 1); PS.set({ ...st, fav }); return i < 0; },
};

/* identity documents: memory only */
export const PV = { idFront: '', idBack: '', selfie: '' };

/* small in-memory observable */
function memStore(init) {
  let cur = init; const subs = new Set();
  return { get: () => cur, set(v) { cur = v; subs.forEach(f => f(v)); }, subscribe(f) { subs.add(f); return () => subs.delete(f); }, touched: false };
}
/* search filters (STATE.pf); `touched` = set during this visit (so later visits keep them) */
export const PF = memStore({ ...PF_DEFAULT, styles: [] });
/* joint booking choices (STATE.jb) */
export const JB = memStore({ pkg: '', b: '', room: 'separate', pay: 'split', seat: true, hotel: 'std', c1: false, c2: false, month: '' });

/* the original's fileToJpeg: square-cropped (profile photo) or scaled (documents) JPEG data URI */
export function fileToJpeg(file, max, square) {
  return new Promise((res, rej) => {
    if (!file || !/^image\//.test(file.type)) return rej(new Error('Please choose a photo (JPG or PNG).'));
    if (file.size > 12e6) return rej(new Error('That file is too large (max 12 MB).'));
    const url = URL.createObjectURL(file), img = new Image();
    img.onload = () => {
      let w = img.naturalWidth, h = img.naturalHeight, sx = 0, sy = 0, sw = w, sh = h;
      if (square) { const m = Math.min(w, h); sx = (w - m) / 2; sy = (h - m) / 2; sw = sh = m; w = h = Math.min(max, m); } else { const r = Math.min(1, max / Math.max(w, h)); w = Math.round(w * r); h = Math.round(h * r); }
      const c = document.createElement('canvas'); c.width = w; c.height = h; c.getContext('2d').drawImage(img, sx, sy, sw, sh, 0, 0, w, h); URL.revokeObjectURL(url); res(c.toDataURL('image/jpeg', 0.82));
    };
    img.onerror = () => { URL.revokeObjectURL(url); rej(new Error('Could not read that image.')); };
    img.src = url;
  });
}
