/* Server helpers for the booking pages. */
import 'server-only';
import { BACKEND, CONTENT_TAG } from '@/lib/site';
import { viewMetadata } from '@/lib/seo';
import { mergePay } from './calc';

/* payment details: CONFIG.pay + the dashboard's Site settings → Payment details (payUpi, bank* …).
   The settings record is served by /api/public/catalog (the original applied it in the browser: payproof.js apiApply). */
export async function getPayConfig(S) {
  let s = {};
  try {
    const r = await fetch(`${BACKEND}/api/public/catalog`, { next: { tags: [CONTENT_TAG], revalidate: 300 } });
    if (r.ok) s = (await r.json()).settings || {};
  } catch (e) { /* backend unreachable: CONFIG.pay only */ }
  return mergePay(S.CONFIG.pay, s);
}

/* personal pages: never indexed */
export const privateMetadata = (S, path, title) => ({ ...viewMetadata(S, path, title), robots: { index: false, follow: true } });

/* contact details client components need */
export const contactOf = C => ({ phone: C.phone, whatsapp: C.whatsapp, email: C.email, address: C.address });
