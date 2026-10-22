/* Server-side access to the website data (content, prices, reviews, SEO) from the backend.
   The full data (~3 MB) is over the Next.js data-cache limit (2 MB), so it is kept in memory per content
   version. Only the tiny version document goes through the data cache under the "content" tag; the backend
   calls /api/revalidate on every change, which expires the tag, so the next request sees the new version and
   reloads the data. */
import 'server-only';
import http from 'node:http';
import https from 'node:https';
import { cache } from 'react';
import { createStore } from './store';

export const BACKEND = (process.env.BACKEND_URL || 'http://127.0.0.1:8080').replace(/\/$/, '');
export const CONTENT_TAG = 'content';

let memo = null; /* { version, store: Promise<store> } */

async function fetchVersion() {
  try {
    const r = await fetch(`${BACKEND}/api/public/site/version`, { cache: 'force-cache', next: { tags: [CONTENT_TAG], revalidate: 3600 } });
    if (r.ok) return String((await r.json()).version);
  } catch (e) { /* backend unreachable: keep serving the data in memory */ }
  return memo ? memo.version : '';
}

/* plain Node request: a fetch() with cache: 'no-store' would make every page dynamic, and the data cache
   rejects it as too large; freshness comes from the tagged version document above */
function fetchSite() {
  const url = new URL(`${BACKEND}/api/public/site`);
  const lib = url.protocol === 'https:' ? https : http;
  return new Promise((resolve, reject) => {
    const req = lib.get(url, { headers: { Accept: 'application/json' }, timeout: 60e3 }, res => {
      if (res.statusCode !== 200) { res.resume(); return reject(new Error(`Website data unavailable (backend responded ${res.statusCode})`)); }
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => { try { resolve(JSON.parse(Buffer.concat(chunks).toString('utf8'))); } catch (e) { reject(e); } });
      res.on('error', reject);
    });
    req.on('timeout', () => req.destroy(new Error('Website data request timed out')));
    req.on('error', reject);
  });
}

async function loadStore() {
  const version = await fetchVersion();
  if (memo && memo.version === version) return memo.store;
  const store = fetchSite().then(createStore);
  memo = { version, store }; /* concurrent requests share one download */
  store.catch(() => { if (memo && memo.store === store) memo = null; });
  return store;
}

/* one store per content version (React cache also dedupes calls from layout, page and metadata) */
export const getSite = cache(loadStore);
