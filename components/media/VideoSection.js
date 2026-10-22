/* TripPartner TV section (legacy videoSection + videoInit; used on the home page and the videos page).
   <VideoSection S={S} />            home: <h2>, split into a "player" and a "reels" section (fit.js)
   <VideoSection S={S} page h1="…"/> videos page: section.tv-page with <h1>
   split={false} keeps the player and the reels in one section (the unwrapped original).
   afterFirst: rendered right after the first section (dashboard SEO intro/FAQs on the videos page). */
import Link from 'next/link';
import { I } from '@/components/icons';
import { VIEW_PATHS } from '@/lib/routes';
import { reelsData, showreelData } from '@/lib/media/video';
import Showreel from './Showreel';
import ReelsRail from './ReelsRail';

export default function VideoSection({ S, page = false, h1, split = true, afterFirst = null }) {
  const C = S.CONFIG;
  const head = (
    <div className="tv-head"><div><span className="eyebrow" style={{ color: 'var(--sun)' }}>TripPartner TV</span>{page ? <h1>{h1 || 'TripPartner TV'}</h1> : <h2>Watch first, then wander</h2>}<p>Short films and reels from the places our travellers love. Tap a reel to watch full-screen, then plan the same trip.</p></div>
      <div className="tv-links"><Link className="btn btn-ghost tv-ghost" href={VIEW_PATHS.videos}>{I.play} All videos</Link>{C.youtube ? <a className="btn btn-o" href={C.youtube} target="_blank" rel="noopener">{I.yt} YouTube</a> : null}</div></div>
  );
  const player = <Showreel reel={showreelData(S)} />;
  const reels = <ReelsRail reels={reelsData(S)} CONFIG={C} />;
  const cls = page ? 'tv tv-page' : 'tv';
  if (!split) return <><section className={cls} id="tv"><div className="wrap">{head}{player}{reels}</div></section>{afterFirst}</>;
  return (
    <>
      <section className={cls} id="tv"><div className="wrap">{head}{player}</div></section>
      {afterFirst}
      <section className="tv tv-2" id="tv-reels" aria-label="TripPartner TV reels"><div className="wrap">{reels}</div></section>
    </>
  );
}
