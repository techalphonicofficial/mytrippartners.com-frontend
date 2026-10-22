/* TripPartner TV — videos page (legacy videosPage, wrapped by fit.js; behaviour from videoInit/videoClick). */
import { getSite } from '@/lib/site';
import { pageMetadata, seoOverride, faqLd } from '@/lib/seo';
import { builtInPage } from '@/lib/pages';
import { JsonLd, SeoExtra } from '@/components/seo/Seo';
import { SecHead } from '@/components/ui/cards';
import { I } from '@/components/icons';
import { reelsData } from '@/lib/media/video';
import VideoSection from '@/components/media/VideoSection';
import ReelCard from '@/components/media/ReelCard';
import UgcForm from '@/components/media/UgcForm';

const PATH = '/videos/';

export async function generateMetadata() { const S = await getSite(); return pageMetadata(S, PATH); }

export default async function VideosPage() {
  const S = await getSite();
  const ov = seoOverride(S, PATH), page = builtInPage(S, PATH);
  const extra = ov.intro || ov.faqs.length ? <SeoExtra intro={ov.intro} faqs={ov.faqs} /> : null;
  return (
    <>
      <VideoSection S={S} page h1={ov.h1 || 'TripPartner TV'} afterFirst={extra} />
      <section className="sec"><div className="wrap" style={{ display: 'grid', gap: '26px' }}>
        <SecHead h="All reels by destination" p="" />
        <div className="reels-grid">{reelsData(S).map(r => <ReelCard key={r.id} r={r} CONFIG={S.CONFIG} />)}</div>
        <div className="box ugc"><div><span className="eyebrow">Share your trip</span><h2>Travelled with TripPartner? Send us your video</h2><p className="muted">Share a short clip from your trip. Selected videos are featured here and on our social channels, with credit.</p><ul className="checks"><li>{I.check}<span>Vertical 9:16 or landscape 16:9, up to 60 seconds</span></li><li>{I.check}<span>You must own the video and have consent from people shown</span></li></ul></div>
          <UgcForm CONFIG={S.CONFIG} /></div>
      </div></section>
      <JsonLd data={[...(page ? page.jsonld() : []), faqLd(ov.faqs)]} />
    </>
  );
}
