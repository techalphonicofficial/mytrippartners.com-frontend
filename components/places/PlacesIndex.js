/* India A–Z index (original placesIndex + placesIndexInit, places.js). Server component. */
import Link from 'next/link';
import { I } from '@/components/icons';
import { img } from '@/lib/format';
import { PATHS } from '@/lib/routes';
import { HeroGallery, PlacesSearch } from './PlacesClient';

export default function PlacesIndex({ S, h1, extra }) {
  const { PLACES, STATES, CATS } = S;
  const search = PLACES.map(p => ({ id: p.id, s: p.s, n: p.n, t: p.t, best: p.best, img: S.placeImg(p), hay: (p.n + ' ' + S.ST(p.s).n + ' ' + p.a.join(' ') + ' ' + p.t.join(' ')).toLowerCase() }));
  const stNames = Object.fromEntries(STATES.map(s => [s.s, s.n]));
  return (
    <>
      <section className="page-hero cine"><div className="ph-bg" style={{ backgroundImage: `url(${img('taj')})` }}></div><div className="wrap"><div><nav className="crumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><span>India</span></nav><span className="eyebrow">Explore India A–Z</span><h1>{h1 || `${PLACES.length}+ Tourist Places in India`}</h1><p className="lead">Every state and union territory: what to see, when to go, how to reach, and trip ideas from TripPartner&apos;s travel desk.</p>
        <div className="facts"><div>States &amp; UTs<b className="num">{STATES.length}</b></div><div>Tourist places<b className="num">{PLACES.length}</b></div><div>Trip types<b className="num">{Object.keys(CATS).length}</b></div></div></div><HeroGallery imgs={[['taj', 'Taj Mahal'], ['kerala-boat', 'Kerala'], ['ladakh', 'Ladakh']]} /></div></section>
      {extra}
      <section className="sec"><div className="wrap" style={{ display: 'grid', gap: '30px' }}>
        <PlacesSearch places={search} states={stNames} />
        <div><div className="sec-head"><h2>Explore by trip type</h2></div><div className="cat-tiles">{Object.keys(CATS).map(k => { const l = PLACES.filter(p => p.t.includes(k)); return <Link key={k} className="mt-tile" href={PATHS.cat(CATS[k][0])}><img loading="lazy" src={img(l[0] ? S.placeImg(l[0]) : 'group-lake')} alt="" decoding="async" /><span className="mt-t"><b>{CATS[k][1].replace(' in India', '')}</b><small>{l.length} places</small></span></Link>; })}</div></div>
        <div><div className="sec-head"><h2>Explore by state</h2></div><div className="state-grid">{STATES.map(st => { const l = PLACES.filter(p => p.s === st.s); return <div key={st.s} className="stc"><Link className="stc-h" href={PATHS.state(st.s)}><img loading="lazy" src={img(st.img)} alt="" decoding="async" /><span><b>{st.n}</b><small>{l.length} place{l.length === 1 ? '' : 's'}</small></span></Link><div className="stc-l">{l.slice(0, 6).map(p => <Link key={p.id} href={PATHS.place(p)}>{p.n}</Link>)}</div></div>; })}</div></div>
      </div></section>
    </>
  );
}
