/* GET /api/seo-pages — every built-in page with title, description, share image, priority, type and its rendered H1.
   Used by the dashboard's SEO module (via the backend). H1s are read from the pages themselves, so they always match
   what is published; the list is cached per content version. */
import { getSite } from '@/lib/site';
import { builtInPages } from '@/lib/pages';

export const dynamic = 'force-dynamic';
let memo = { v: null, at: 0, list: null };
let running = null; /* { v, promise }: concurrent requests share one crawl */

const decode = s => s.replace(/&(amp|lt|gt|quot|#39|#x27|nbsp);/g, (m, e) => ({ amp: '&', lt: '<', gt: '>', quot: '"', '#39': "'", '#x27': "'", nbsp: ' ' }[e]));
const h1Of = html => { const main = html.slice(html.indexOf('<main')); const m = /<h1[^>]*>([\s\S]*?)<\/h1>/.exec(main); return m ? decode(m[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()) : ''; };

export async function GET() {
  const S = await getSite();
  if (memo.list && memo.v === S.version && Date.now() - memo.at < 10 * 60e3) return Response.json(memo.list);
  if (!running || running.v !== S.version) running = { v: S.version, promise: crawl(S).finally(() => { running = null; }) };
  return Response.json(await running.promise);
}

async function crawl(S) {
  const base = (process.env.SITE_INTERNAL_URL || `http://127.0.0.1:${process.env.PORT || 3000}`).replace(/\/$/, '');
  const pages = [...builtInPages(S).values()];
  const out = new Array(pages.length);
  let next = 0;
  const worker = async () => {
    for (let i; (i = next++) < pages.length;) {
      const p = pages[i]; let h1 = '';
      try { const r = await fetch(base + p.path, { headers: { 'x-seo-crawl': '1' } }); if (r.ok) h1 = h1Of(await r.text()); } catch (e) { /* page unavailable: report without H1 */ }
      out[i] = { path: p.path, route: p.route, title: p.title, desc: p.desc, img: p.img, prio: p.prio, type: p.type, h1 };
    }
  };
  await Promise.all(Array.from({ length: 6 }, worker));
  memo = { v: S.version, at: Date.now(), list: out };
  return out;
}
