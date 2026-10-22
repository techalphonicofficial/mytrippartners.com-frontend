/* /travel-partner/book/ — book a trip together (original jointPage + jointInit). Presets: ?p=<package id> ?b=<traveller id>. */
import { getSite } from '@/lib/site';
import { viewMetadata } from '@/lib/seo';
import { VIEW_PATHS } from '@/lib/routes';
import { HelpBox } from '@/components/ui/boxes';
import { partnerData } from '@/lib/partner/core';
import { PartnerHero } from '@/components/partner/blocks';
import { PartnerData } from '@/components/partner/client';
import JointBooking from '@/components/partner/JointBooking';

export async function generateMetadata() { const S = await getSite(); return viewMetadata(S, VIEW_PATHS['partner-book'], 'Book a Trip Together'); }

const one = v => (Array.isArray(v) ? v[0] : v) || '';

export default async function Page({ searchParams }) {
  const sp = await searchParams, S = await getSite();
  const p = one(sp.p), b = one(sp.b);
  const preset = { p: S.P(p) ? p : '', b: S.B(b) || b === 'friend' ? b : '' };
  return (
    <PartnerData value={partnerData(S)}>
      <PartnerHero title="Book a trip together" lead="One trip, two travellers. Choose who pays, sit together, and pick shared or separate rooms — nothing is final until both of you agree." crumb="Book together" />
      <JointBooking key={preset.p + '|' + preset.b} preset={preset} aside={<HelpBox CONFIG={S.CONFIG} />} />
    </PartnerData>
  );
}
