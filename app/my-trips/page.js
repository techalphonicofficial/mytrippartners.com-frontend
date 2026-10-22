/* My Trips (legacy #account): bookings, enquiries, wishlist and Travel Partner activity on this device. */
import { getSite } from '@/lib/site';
import { VIEW_PATHS } from '@/lib/routes';
import { pkgIndex } from '@/lib/booking/calc';
import { privateMetadata, contactOf } from '@/lib/booking/server';
import MyTrips from '@/components/booking/MyTrips';

export async function generateMetadata() { const S = await getSite(); return privateMetadata(S, VIEW_PATHS.account, 'My Trips'); }

export default async function Page() {
  const S = await getSite();
  return <MyTrips pkgs={pkgIndex(S)} CONFIG={contactOf(S.CONFIG)} />;
}
