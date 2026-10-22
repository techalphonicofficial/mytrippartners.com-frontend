/* =====================================================================
   Browser → backend API (same origin: /api/public is proxied to the Express backend).
   send() is fire-and-forget with an outbox: if the network or server fails, the request is kept on the
   device (key tp_outbox, same as the original site) and retried on the next visit by flush().
   ===================================================================== */
import { ls } from './storage';

const BASE = '/api/public';

export async function post(path, body) {
  const r = await fetch(BASE + path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), keepalive: true });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw Object.assign(new Error(d.error || d.msg || 'Request failed'), { status: r.status, data: d });
  return d;
}

export async function get(path) {
  const r = await fetch(BASE + path, { headers: { Accept: 'application/json' } });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw Object.assign(new Error(d.error || 'Request failed'), { status: r.status, data: d });
  return d;
}

const retryable = e => !e.status || e.status >= 500 || e.status === 429;

export function send(path, body) {
  post(path, body).catch(e => {
    if (!retryable(e)) return;
    const ob = ls('tp_outbox') || []; ob.push({ path, body, at: Date.now() }); ls('tp_outbox', ob.slice(-30));
  });
}

export async function flush() {
  const ob = ls('tp_outbox') || []; if (!ob.length) return;
  const keep = [];
  for (const it of ob) { try { await post(it.path, it.body); } catch (e) { if (retryable(e)) keep.push(it); } }
  ls('tp_outbox', keep);
}

/* full website data in the browser (for search, compare, wishlist …) — fetched once per page load */
let sitePromise = null;
export const loadSite = () => (sitePromise ||= fetch(BASE + '/site').then(r => { if (!r.ok) throw new Error('site data'); return r.json(); }));
