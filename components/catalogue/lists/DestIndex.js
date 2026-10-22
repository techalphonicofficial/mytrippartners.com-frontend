/* India / International destination index (legacy destIndex(type) + destFilterInit). Server component. */
import Link from 'next/link';
import { img } from '@/lib/format';
import { TallDest } from '@/components/ui/cards';
import PhGal from './PhGal';
import DestFilter from './DestFilter';

export default function DestIndex({ S, type }) {
  const list = S.DEST.filter(d => !type || d.type === type);
  const regions = [...new Set(list.map(d => d.region))];
  const isIn = type === 'india';
  const hero = isIn ? 'taj' : 'europe';
  return (
    <>
      <section className="page-hero"><div className="ph-bg" style={{ backgroundImage: `url(${img(hero)})` }}></div><div className="wrap"><div><nav className="crumbs"><Link href="/">Home</Link><span>/</span><span>{isIn ? 'India Holidays' : 'International Holidays'}</span></nav><h1>{isIn ? 'India Holiday Packages' : 'International Holiday Packages'}</h1><p className="lead">{isIn ? 'Mountains, beaches, backwaters, deserts and temple towns — choose a region to start.' : 'Visa-easy Asian islands, Gulf city breaks, Europe and beyond, with visa help included.'}</p></div>
        <PhGal srcs={[img(hero), img(isIn ? 'kerala-boat' : 'bali'), img(isIn ? 'ladakh' : 'dubai')]} /></div></section>
      <section className="sec"><DestFilter count={list.length}>{regions.map(r => <div key={r} id={`reg-${r.replace(/\s/g, '')}`}><div className="sec-head"><h2>{r}{isIn ? ' India' : ''}</h2></div><div className="grid g4">{list.filter(d => d.region === r).map(d => <TallDest key={d.id} d={d} />)}</div></div>)}</DestFilter></section>
    </>
  );
}
