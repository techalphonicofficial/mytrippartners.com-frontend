/* Called by the backend whenever website content, prices, SEO or settings change:
   POST /api/revalidate  (header x-revalidate-secret: REVALIDATE_SECRET) → cached pages refresh on their next request. */
import { revalidateTag } from 'next/cache';
import { CONTENT_TAG } from '@/lib/site';

export async function POST(request) {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret || request.headers.get('x-revalidate-secret') !== secret) return Response.json({ error: 'Not allowed.' }, { status: 401 });
  revalidateTag(CONTENT_TAG, { expire: 0 });
  return Response.json({ ok: true, revalidated: CONTENT_TAG, at: new Date().toISOString() });
}
