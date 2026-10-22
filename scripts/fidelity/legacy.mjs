/* Loads the LEGACY website bundle (website/assets/app.js, the pre-Next.js code) in a sandbox with the
   live content from the backend, so its page functions can be called to produce reference HTML.
   Used only by the fidelity tools in this folder. */
import vm from 'node:vm';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const LEGACY_BUNDLE = process.env.LEGACY_BUNDLE || path.resolve(HERE, '../../../legacy/website/assets/app.js');
export const BACKEND = (process.env.BACKEND_URL || 'http://127.0.0.1:8080').replace(/\/$/, '');

export async function fetchSite() {
  const r = await fetch(`${BACKEND}/api/public/site`);
  if (!r.ok) throw new Error(`GET /api/public/site → ${r.status}`);
  return r.json();
}

const BS = String.fromCharCode(92);
const LS = new RegExp('[' + String.fromCharCode(0x2028, 0x2029) + ']', 'g');
const js = v => JSON.stringify(v).replace(/</g, BS + 'u003c').replace(LS, c => BS + 'u' + c.charCodeAt(0).toString(16));

/* names: globals to expose (functions or data) — returns { X, run(code) } */
export async function loadLegacy(names, site) {
  site = site || await fetchSite();
  const M = site.model;
  const content = Object.keys(M).map(k => `const ${k}=${js(M[k])};`).join('\n');
  const app = fs.readFileSync(LEGACY_BUNDLE, 'utf8').replace(/;\s*boot\(\);\s*$/, '');
  const noop = () => {};
  const el = () => ({ style: {}, dataset: {}, setAttribute: noop, getAttribute: () => null, appendChild: noop, addEventListener: noop, removeEventListener: noop, querySelectorAll: () => [], querySelector: () => null, classList: { add: noop, remove: noop, toggle: noop, contains: () => false } });
  const store = new Map();
  const ctx = {
    console: { log: noop, info: noop, warn: noop, error: noop, debug: noop }, Math, Date, JSON, Intl, Number, String, Array, Object, Set, Map, Promise, RegExp, Error, setTimeout, clearTimeout, setInterval, clearInterval,
    isFinite, parseInt, parseFloat, encodeURIComponent, decodeURIComponent, URL, URLSearchParams,
    document: { querySelector: () => null, querySelectorAll: () => [], addEventListener: noop, createElement: el, createRange: el, documentElement: el(), head: el(), body: el(), title: '' },
    localStorage: { getItem: k => (store.has(k) ? store.get(k) : null), setItem: (k, v) => store.set(k, String(v)), removeItem: k => store.delete(k) },
    sessionStorage: { getItem: () => null, setItem: noop, removeItem: noop },
    matchMedia: () => ({ matches: false, addEventListener: noop }), navigator: {}, location: { hash: '', pathname: '/', href: 'https://www.trippartner.com/' },
    addEventListener: noop, getSelection: () => ({ removeAllRanges: noop, addRange: noop }), requestAnimationFrame: noop, scrollTo: noop, fetch: () => Promise.reject(new Error('offline')),
  };
  ctx.window = ctx; ctx.self = ctx; ctx.TP_STATIC = true;
  vm.createContext(ctx);
  vm.runInContext(content + '\n;\n' + app + `\n;globalThis.__X={${names.join(',')}};`, ctx, { filename: 'legacy-bundle.js' });
  return { X: ctx.__X, run: code => vm.runInContext(code, ctx), site, storage: store };
}
