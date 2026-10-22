/* Payment receipt (legacy #receipt-TP26XXXXX-PFxxxx) → /receipt/TP26XXXXX/PFxxxx/ */
import { notFound } from 'next/navigation';
import { getSite } from '@/lib/site';
import { PATHS } from '@/lib/routes';
import { pkgIndex } from '@/lib/booking/calc';
import { privateMetadata, getPayConfig, contactOf } from '@/lib/booking/server';
import PayShell from '@/components/booking/PayShell';
import Receipt from '@/components/booking/Receipt';

export const dynamicParams = true;
export async function generateStaticParams() { return []; }
const parse = (ref, pf = []) => (/^[A-Za-z0-9]+$/.test(ref) && pf.length <= 1 && (!pf[0] || /^PF[A-Za-z0-9]+$/.test(pf[0])) ? { R: ref.toUpperCase(), F: pf[0] || '' } : null);

export async function generateMetadata({ params }) {
  const { ref, pf } = await params; const x = parse(ref, pf); const S = await getSite();
  return x ? privateMetadata(S, PATHS.receipt(x.R, x.F), 'Payment receipt') : {};
}

export default async function Page({ params }) {
  const { ref, pf } = await params; const x = parse(ref, pf); if (!x) notFound();
  const S = await getSite(), pay = await getPayConfig(S);
  return <PayShell crumb="Receipt" tat={pay.tat}><Receipt bookingRef={x.R} pf={x.F} pkgs={pkgIndex(S)} CONFIG={contactOf(S.CONFIG)} sample={!!pay.sample} /></PayShell>;
}
