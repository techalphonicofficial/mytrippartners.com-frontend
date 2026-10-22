/* Captures the final DOM of every page of the LEGACY website (served by the old backend renderer) into
   scripts/fidelity/baseline/. Run once, while the legacy site is still available:
     LEGACY_URL=http://127.0.0.1:8080 node scripts/fidelity/capture-baseline.mjs [--only <prefix>] [--missing] */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { manifest } from './routes.mjs';
import { fetchSite } from './legacy.mjs';
import { browserPool } from './browser.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(HERE, 'baseline');
const LEGACY = (process.env.LEGACY_URL || 'http://127.0.0.1:8080').replace(/\/$/, '');
export const fileFor = p => (p === '/' ? '_home' : p.replace(/^\/|\/$/g, '').replace(/\//g, '__')) + '.json';

const only = process.argv.includes('--only') ? process.argv[process.argv.indexOf('--only') + 1] : null;
const site = await fetchSite();
const allPages = await manifest(site);
const missing = process.argv.includes('--missing');
const pages = allPages.filter(p => (!only || p.path.startsWith(only)) && (!missing || !fs.existsSync(path.join(OUT, fileFor(p.path)))));
fs.mkdirSync(OUT, { recursive: true });
const browser = browserPool();
let done = 0; const t0 = Date.now(), failures = [];
const queue = [...pages];
async function worker() {
  for (let p; (p = queue.shift());) {
    try {
      const r = await browser.capture(LEGACY + p.legacy);
      fs.writeFileSync(path.join(OUT, fileFor(p.path)), JSON.stringify({ ...p, capturedAt: new Date().toISOString(), ...r }));
    } catch (e) { failures.push(`${p.path}: ${e.message}`); }
    if (++done % 25 === 0) console.log(`${done}/${pages.length} (${Math.round((Date.now() - t0) / 1000)}s)`);
  }
}
await Promise.all([1, 2, 3, 4].map(worker));
await browser.close();
fs.writeFileSync(path.join(OUT, '_manifest.json'), JSON.stringify(allPages, null, 1));
console.log(`captured ${done - failures.length}/${pages.length} legacy pages in ${Math.round((Date.now() - t0) / 1000)}s → ${OUT}`);
if (failures.length) console.log('failed:\n  ' + failures.join('\n  '));
