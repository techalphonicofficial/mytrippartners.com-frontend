/* Home page "/" — port of the original home() (app.js + polish.js, fit.js and next.js wrappers) and homeInit().
   Interactive parts are small client islands in components/home/*; cross-area sections come from their owners. */
import Link from 'next/link';
import { getSite } from '@/lib/site';
import { pageMetadata, seoOverride, faqLd } from '@/lib/seo';
import { builtInPage } from '@/lib/pages';
import { VIEW_PATHS } from '@/lib/routes';
import { I } from '@/components/icons';
import { SecHead } from '@/components/ui/cards';
import { JsonLd, SeoExtra } from '@/components/seo/Seo';
import DepTable from '@/components/editorial/DepTable';
import VisaCard from '@/components/editorial/VisaCard';
import VideoSection from '@/components/media/VideoSection';
import FestiveSection, { FestiveBanner } from '@/components/media/FestiveSection';
import WeekendSection from '@/components/media/WeekendSection';
import HomePlaces from '@/components/places/HomePlaces';
import Hero from '@/components/home/Hero';
import BudgetFinder from '@/components/home/BudgetFinder';
import PromoSlider from '@/components/home/PromoSlider';
import { IaSection, VisaSection } from '@/components/home/HomeTabs';
import { RecentSection, SectionNav } from '@/components/home/HomeClient';
import {
  TrustStrip, ThemeRow, BannerIndia, BannerThai, BannerCode, OfferBanner, Trending, iaPanes, TripsForAll, PartnerBand, Spiritual,
  LongWeekendSection, Season, Recommended, Specialists, Reasons, Confidence, HowItWorks, Stories, Spotlight, Guides, CtaBand, Reviews,
} from '@/components/home/Sections';

export async function generateMetadata() { const S = await getSite(); return pageMetadata(S, '/'); }

export default async function Home() {
  const S = await getSite();
  const ov = seoOverride(S, '/');
  const page = builtInPage(S, '/');
  /* the budget explorer needs only these fields of every package */
  const bxPkgs = S.PKG.map(p => ({ id: p.id, img: p.img, title: p.title, n: p.n, tag: p.tag, route: p.route, price: p.price, themes: p.themes, dest: p.dest, type: (S.D(p.dest) || {}).type }));
  return (
    <>
      <Hero S={S} h1={ov.h1} />
      {ov.intro || ov.faqs.length ? <SeoExtra intro={ov.intro} faqs={ov.faqs} /> : null}
      <BudgetFinder pkgs={bxPkgs} CONFIG={S.CONFIG} />
      <RecentSection />
      <TrustStrip S={S} />
      <ThemeRow S={S} />
      <section className="sec-tight"><div className="wrap">
        <PromoSlider>{[
          <FestiveBanner key="fx" S={S} />,
          <BannerIndia key="in" />,
          <BannerThai key="th" S={S} />,
          <BannerCode key="code" />,
          <OfferBanner key="bh" href="/packages/bahrain-break/" bc="#0f5e6a" h="Discover Bahrain" p="Where heritage meets modern wonders" price={20999} tc="*T&Cs apply. Per person on twin sharing." im="bahrain" alt="Bahrain marina" />,
          <OfferBanner key="au" href="/packages/australia-reef/" bc="#0d5b93" h="Australia, reef to harbour" p="Great Barrier Reef, Sydney & Gold Coast — couple departures" price={249999} tc="*T&Cs apply. Visa assistance included." im="australia" alt="Great Barrier Reef" />,
          <OfferBanner key="rj" href="/destinations/rajasthan/" bc="#9b3d12" h="Rajasthan heritage circuit" p="Forts, palaces, desert camps & tiger safaris" price={6199} tc="*Jaisalmer desert safari, 2N/3D." im="rajasthan-fort" alt="Amer Fort, Jaipur" />,
        ]}</PromoSlider>
      </div></section>
      <Trending S={S} />
      <FestiveSection S={S} />
      <WeekendSection S={S} />
      <IaSection panes={iaPanes(S)} />
      <VideoSection S={S} />
      <TripsForAll />
      <PartnerBand S={S} />
      <Spiritual S={S} />
      <LongWeekendSection S={S} />
      <section className="sec-tight"><div className="wrap">
        <SecHead h="Upcoming Group Departures" p="Fixed dates, a tour manager and like-minded travellers" right={<Link className="btn btn-ghost" href={VIEW_PATHS.departures}>All departures {I.arrow}</Link>} />
        <DepTable S={S} limit={5} />
      </div></section>
      <Season S={S} />
      <Recommended S={S} />
      <Specialists S={S} />
      <VisaSection panes={['free', 'voa'].map(k => [k, (S.VISA[k] || []).map(v => <VisaCard key={v.id} S={S} v={v} k={k} />)])} />
      <HomePlaces S={S} />
      <Reasons />
      <Confidence />
      <HowItWorks />
      <Stories S={S} />
      <Spotlight S={S} />
      <Guides S={S} />
      <CtaBand S={S} />
      <Reviews S={S} />
      <SectionNav />
      <JsonLd data={[...(page ? page.jsonld() : []), faqLd(ov.faqs)]} />
    </>
  );
}
