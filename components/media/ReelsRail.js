'use client';
/* "Reels" heading with the category chips (RCAT filters) + the reels rail (legacy videoSection / videoInit). */
import { useRef, useState } from 'react';
import { RailNav } from '@/components/ui/buttons';
import { RCAT_LIST } from '@/lib/media/video';
import ReelCard from './ReelCard';

export default function ReelsRail({ reels, CONFIG }) {
  const [cat, setCat] = useState('all');
  const rail = useRef(null);
  const pick = k => { setCat(k); if (rail.current) rail.current.scrollTo({ left: 0 }); };
  return (
    <>
      <div className="tv-reels-h"><h3>Reels</h3><div className="rchips" role="tablist" aria-label="Filter reels">{RCAT_LIST.map(([k, l]) => <button key={k} type="button" role="tab" aria-selected={cat === k ? 'true' : 'false'} data-rcat={k} onClick={() => pick(k)}>{l}</button>)}</div><RailNav id="r-reels" /></div>
      <div className="rail reels-rail" id="r-reels" ref={rail}>{reels.map(r => <ReelCard key={r.id} r={r} CONFIG={CONFIG} hidden={cat !== 'all' && !r.cats.includes(cat)} />)}</div>
    </>
  );
}
