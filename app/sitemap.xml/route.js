/* /sitemap.xml — built-in pages + published pSEO pages (refreshed with the content) */
import { getSite } from '@/lib/site';
import { sitemapXml } from '@/lib/pseo';

export async function GET() {
  const S = await getSite();
  return new Response(sitemapXml(S), { headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600' } });
}
