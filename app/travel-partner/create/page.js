/* /travel-partner/create/ — create a Travel Partner profile with photo + ID verification
   (original partnerCreatePage + partnerCreateInit). ?verify=1 jumps to the photo / ID steps. */
import { getSite } from '@/lib/site';
import { viewMetadata } from '@/lib/seo';
import { VIEW_PATHS } from '@/lib/routes';
import { HelpBox } from '@/components/ui/boxes';
import { partnerData } from '@/lib/partner/core';
import { PartnerHero } from '@/components/partner/blocks';
import { PartnerData } from '@/components/partner/client';
import CreateForm from '@/components/partner/CreateForm';

export async function generateMetadata() { const S = await getSite(); return viewMetadata(S, VIEW_PATHS['partner-create'], 'Create Travel Partner Profile'); }

export default async function Page({ searchParams }) {
  const sp = await searchParams, S = await getSite();
  return (
    <PartnerData value={partnerData(S)}>
      <PartnerHero title="Create your travel partner profile" lead="Add a photo, your trips and travel style, and verify your ID. Your phone, email, full name and documents are never shown publicly." crumb="Create profile" />
      <CreateForm verify={sp.verify === '1'} aside={<HelpBox CONFIG={S.CONFIG} />} />
    </PartnerData>
  );
}
