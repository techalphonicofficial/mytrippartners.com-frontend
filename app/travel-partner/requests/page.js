/* /travel-partner/requests/ — my partner requests, proposals and shortlist (original requestsPage). ?tab=fav → shortlist. */
import { getSite } from '@/lib/site';
import { viewMetadata } from '@/lib/seo';
import { VIEW_PATHS } from '@/lib/routes';
import { partnerData } from '@/lib/partner/core';
import { PartnerHero } from '@/components/partner/blocks';
import { PartnerData } from '@/components/partner/client';
import Requests from '@/components/partner/Requests';

export async function generateMetadata() { const S = await getSite(); return viewMetadata(S, VIEW_PATHS['partner-requests'], 'My Partner Requests'); }

export default async function Page({ searchParams }) {
  const sp = await searchParams, S = await getSite();
  return (
    <PartnerData value={partnerData(S)}>
      <PartnerHero title="My requests & bookings" lead="Track partner requests and joint booking proposals." crumb="My requests" />
      <Requests tab={sp.tab === 'fav' ? 'fav' : ''} />
    </PartnerData>
  );
}
