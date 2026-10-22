/* Pay for a booking (legacy #pay): find a booking by reference + mobile number. */
import { getSite } from '@/lib/site';
import { VIEW_PATHS } from '@/lib/routes';
import { pkgIndex } from '@/lib/booking/calc';
import { privateMetadata, getPayConfig, contactOf } from '@/lib/booking/server';
import PayShell from '@/components/booking/PayShell';
import PayView from '@/components/booking/PayView';

export async function generateMetadata() { const S = await getSite(); return privateMetadata(S, VIEW_PATHS.pay, 'Pay for your booking'); }

export default async function Page() {
  const S = await getSite(), pay = await getPayConfig(S);
  return <PayShell crumb="Pay" tat={pay.tat}><PayView bookingRef="" pkgs={pkgIndex(S)} pay={pay} CONFIG={contactOf(S.CONFIG)} /></PayShell>;
}
