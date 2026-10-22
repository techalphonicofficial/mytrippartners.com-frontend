/* Redirects managed in the dashboard (SEO & pSEO → Redirects), applied before any page renders.
   The active list is read from the backend and cached for 30 s; each served redirect is counted. */
import { NextResponse } from 'next/server';

const BACKEND = (process.env.BACKEND_URL || 'http://127.0.0.1:8080').replace(/\/$/, '');
let cache = { at: 0, map: null };

async function redirects() {
  if (cache.map && Date.now() - cache.at < 30e3) return cache.map;
  try {
    const r = await fetch(`${BACKEND}/api/public/redirects`, { cache: 'no-store' });
    if (r.ok) cache = { at: Date.now(), map: new Map((await r.json()).map(x => [String(x.from).replace(/\/+$/, '') || '/', x])) };
  } catch (e) { /* backend unreachable: serve pages without redirects */ }
  return cache.map || new Map();
}

export async function proxy(request, event) {
  const path = request.nextUrl.pathname.replace(/\/+$/, '') || '/';
  const r = (await redirects()).get(path);
  if (!r) {
    /* canonical page URLs end with "/" (API calls are excluded by the matcher, so they are never redirected) */
    if (!request.nextUrl.pathname.endsWith('/')) { const u = new URL(request.url); u.pathname += '/'; return NextResponse.redirect(u, 308); }
    return NextResponse.next();
  }
  const hit = fetch(`${BACKEND}/api/public/redirects/hit`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ from: r.from }) }).catch(() => {});
  if (event && event.waitUntil) event.waitUntil(hit);
  return NextResponse.redirect(/^https?:\/\//.test(r.to) ? r.to : new URL(r.to, request.url), r.code === 302 ? 302 : 301);
}

export const config = {
  /* pages only: not Next internals, the API, the dashboard or files with an extension */
  matcher: ['/((?!_next/|api/|admin|.*\\.[a-zA-Z0-9]{2,5}$).*)'],
};
