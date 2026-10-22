/* /travel-partner/safety/ — Travel Partner safety guidelines (original safetyPage). */
import Link from 'next/link';
import { getSite } from '@/lib/site';
import { viewMetadata } from '@/lib/seo';
import { PATHS, VIEW_PATHS } from '@/lib/routes';
import { HelpBox } from '@/components/ui/boxes';
import { PartnerHero, SafetyBlock } from '@/components/partner/blocks';

export async function generateMetadata() { const S = await getSite(); return viewMetadata(S, VIEW_PATHS['partner-safety'], 'Travel Partner Safety'); }

export default async function Page() {
  const S = await getSite(), C = S.CONFIG;
  return (
    <>
      <PartnerHero title="Travel Partner safety guidelines" lead="Rules every member agrees to, and tips to travel safely with someone new." crumb="Safety centre" />
      <SafetyBlock />
      <section className="sec-tight"><div className="wrap layout"><div className="box prose article">
        <h2>Community rules</h2><p>Travel Partner is for finding travel companions, not dating. Be honest in your profile, respectful in chat, and clear about budget and plans. Harassment, fake profiles, requests for money or explicit content lead to permanent removal and, where required, reporting to authorities.</p>
        <h2>Before you book</h2><p>Chat on TripPartner first and do a video call. Agree on budget, daily plan, smoking and drinking habits, and room choice in the chat so both of you have a record.</p>
        <h2>Rooms and consent</h2><p>Separate rooms are always available. A shared room is booked only when both travellers agree in writing on the proposal, and either traveller can change to separate rooms before the final payment. Both travellers carry a valid government photo ID for hotel check-in.</p>
        <h2>Money</h2><p>Pay only through TripPartner. Never transfer money to another member&apos;s personal account. Refunds follow our <Link href={PATHS.info('cancellation')} style={{ color: 'var(--blue)' }}>cancellation policy</Link>.</p>
        <h2>During the trip</h2><p>Share your itinerary and driver details with family. Keep our 24×7 helpline handy: {C.phone}. If you ever feel unsafe, call the national emergency number 112 and then our team.</p>
        <h2>Report or block</h2><p>Use Report on any profile or chat, or write to {C.support}. Reports are reviewed within 24 hours and the reported member is paused during review.</p>
      </div><aside className="side"><HelpBox CONFIG={C} /></aside></div></section>
    </>
  );
}
