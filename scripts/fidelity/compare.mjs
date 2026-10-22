/* Compares the Next.js site with the legacy baseline, page by page (final DOM after scripts ran).
     node scripts/fidelity/compare.mjs /packages/kashmir-paradise/ '/guides/*'   → exact pages; a trailing * matches everything under that path
     node scripts/fidelity/compare.mjs --group catalogue                         → all pages of one area
     node scripts/fidelity/compare.mjs --all [--chrome]                          → everything (+ header/footer/drawer/bottom nav)
   Options: --max N (diffs shown per page, default 12)  --quiet (summary only)
   Exit code 1 when any page differs. Needs the Next.js site running (NEXT_URL, default http://127.0.0.1:3000). */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { canon, diff } from './normalize.mjs';
import { browserPool } from './browser.mjs';
import { fetchSite } from './legacy.mjs';
import { createStore } from '../../lib/store.js';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const BASE = path.join(HERE, 'baseline');
const NEXT = (process.env.NEXT_URL || 'http://127.0.0.1:3000').replace(/\/$/, '');
const args = process.argv.slice(2);
const opt = k => (args.includes(k) ? args[args.indexOf(k) + 1] : null);
const max = +(opt('--max') || 12), quiet = args.includes('--quiet'), chrome = args.includes('--chrome') || args.includes('--all');
const prefixes = args.filter((a, i) => !a.startsWith('--') && !['--max', '--group'].includes(args[i - 1]));

const all = JSON.parse(fs.readFileSync(path.join(BASE, '_manifest.json'), 'utf8'));
const group = opt('--group');
const pages = all.filter(p => (args.includes('--all')) || (group && p.group === group) || prefixes.some(x => (x.endsWith('*') ? p.path.startsWith(x.slice(0, -1)) : p.path === x)));
if (!pages.length) { console.log('No pages selected. Pass paths, --group <name> or --all. Groups: ' + [...new Set(all.map(p => p.group))].join(', ')); process.exit(2); }

const S = createStore(await fetchSite());
const fileFor = p => (p === '/' ? '_home' : p.replace(/^\/|\/$/g, '').replace(/\//g, '__')) + '.json';
const browser = browserPool();
const results = []; const queue = [...pages];
async function worker() {
  for (let p; (p = queue.shift());) {
    const f = path.join(BASE, fileFor(p.path));
    if (!fs.existsSync(f)) { results.push({ p, err: 'no baseline captured' }); continue; }
    const base = JSON.parse(fs.readFileSync(f, 'utf8'));
    try {
      const now = await browser.capture(NEXT + p.path);
      const parts = [['app', 'main#app']];
      if (chrome && p.path === '/') parts.push(['head', 'header'], ['foot', 'footer'], ['drawer', 'drawer'], ['bnav', 'bottom nav']);
      const d = [];
      for (const [k, name] of parts) {
        if (now[k] == null) { d.push({ path: name, msg: 'element missing in NEW page' }); continue; }
        diff(canon(base[k], S), canon(now[k], S), max).forEach(x => d.push({ path: name + x.path, msg: x.msg }));
      }
      results.push({ p, d, errors: now.errors });
    } catch (e) { results.push({ p, err: e.message }); }
  }
}
await Promise.all([1, 2, 3].map(worker));
await browser.close();

let bad = 0;
results.sort((a, b) => a.p.path.localeCompare(b.p.path));
for (const r of results) {
  const ok = !r.err && !r.d.length && !(r.errors || []).length;
  if (!ok) bad++;
  if (ok) { if (!quiet) console.log(`✔ ${r.p.path}`); continue; }
  console.log(`✖ ${r.p.path}${r.err ? '  — ' + r.err : ''}`);
  if (!quiet) {
    (r.errors || []).forEach(e => console.log(`    JS error: ${e}`));
    (r.d || []).slice(0, max).forEach(x => console.log(`    ${x.path}\n      ${x.msg}`));
    if (r.d && r.d.length >= max) console.log(`    … (showing first ${max})`);
  }
}
console.log(`\n${results.length - bad}/${results.length} pages identical${bad ? `, ${bad} differ` : ''}`);
process.exit(bad ? 1 : 0);
