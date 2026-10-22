/* /robots.txt — from the dashboard's SEO settings ({domain} filled in) */
import { getSite } from '@/lib/site';
import { robotsTxt } from '@/lib/pseo';

export async function GET() {
  const S = await getSite();
  return new Response(robotsTxt(S), { headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=3600' } });
}
