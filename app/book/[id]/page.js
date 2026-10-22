/* Book Now (legacy #book-<id>): booking steps for one package. Packages the dashboard marked as not
   bookable redirect to the package page (as the original api.js router did). */
import { notFound, redirect } from 'next/navigation';
import { getSite } from '@/lib/site';
import { PATHS } from '@/lib/routes';
import { HelpBox } from '@/components/ui/boxes';
import { privateMetadata, getPayConfig } from '@/lib/booking/server';
import BookFlow from '@/components/booking/BookFlow';

export const dynamicParams = true;
export async function generateStaticParams() { return []; }

export async function generateMetadata({ params }) {
  const { id } = await params; const S = await getSite(); const p = S.P(id);
  return privateMetadata(S, PATHS.book(id), 'Book ' + ((p || {}).title || ''));
}

export default async function Page({ params }) {
  const { id } = await params; const S = await getSite(); const p = S.P(id);
  if (!p) notFound();
  if (S.blocked.has(id)) redirect(PATHS.pkg(id));
  const d = S.D(p.dest) || {}, C = S.CONFIG, pay = await getPayConfig(S);
  return (
    <BookFlow p={{ id: p.id, title: p.title, img: p.img, n: p.n, route: p.route, price: p.price }} intl={d.type === 'intl'}
      CONFIG={{ phone: C.phone, whatsapp: C.whatsapp, coupons: C.coupons || {}, payTat: pay.tat }} help={<HelpBox CONFIG={C} />} />
  );
}
