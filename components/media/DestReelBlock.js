/* "Watch in 9 seconds" reel box on destination and package pages (legacy destReelBlock).
   <DestReelBlock S={S} destId="kashmir" /> — renders nothing when the destination has no reel. */
import Link from 'next/link';
import { I } from '@/components/icons';
import { VIEW_PATHS } from '@/lib/routes';
import { reelData } from '@/lib/media/video';
import ReelCard from './ReelCard';

export default function DestReelBlock({ S, destId }) {
  const r = S.REELS.find(x => x.dest === destId), d = S.D(destId);
  if (!r || !d) return null;
  return (
    <div className="box dreel"><div className="dreel-v"><ReelCard r={reelData(S, r)} CONFIG={S.CONFIG} /></div><div><span className="eyebrow">Watch in 9 seconds</span><h3>{d.name} on TripPartner TV</h3><p className="muted" style={{ fontSize: '14px' }}>{r.t}. Tap to watch full-screen and swipe to see more reels.</p><Link className="link-arrow" href={VIEW_PATHS.videos}>All videos {I.arrow}</Link></div></div>
  );
}
