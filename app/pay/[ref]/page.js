/* Pay + upload payment proof for one booking (legacy #pay-TP26XXXXX). The booking is read from this device;
   without a device copy the page asks for the reference and mobile number (checked with the backend). */
import { notFound } from 'next/navigation';
import { getSite } from '@/lib/site';
import { PATHS } from '@/lib/routes';
import { pkgIndex } from '@/lib/booking/calc';
import { privateMetadata, getPayConfig, contactOf } from '@/lib/booking/server';
import PayShell from '@/components/booking/PayShell';
import PayView from '@/components/booking/PayView';

export const dynamicParams = true;
export async function generateStaticParams() { return []; }
const norm = ref => (/^[A-Za-z0-9]+$/.test(ref) ? ref.toUpperCase() : null);

export async function generateMetadata({ params }) {
  const { ref } = await params; const R = norm(ref); const S = await getSite();
  return R ? privateMetadata(S, PATHS.pay(R), 'Pay for booking ' + R) : {};
}

export default async function Page({ params }) {
  const { ref } = await params; const R = norm(ref); if (!R) notFound();
  const S = await getSite(), pay = await getPayConfig(S);
  return <PayShell crumb="Pay" tat={pay.tat}><PayView bookingRef={R} pkgs={pkgIndex(S)} pay={pay} CONFIG={contactOf(S.CONFIG)} /></PayShell>;
}
