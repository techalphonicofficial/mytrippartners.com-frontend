/* State / union-territory guide (original statePage + stateInit, places.js). Server component. */
import Link from 'next/link';
import { I } from '@/components/icons';
import { img, waLink } from '@/lib/format';
import { PATHS, VIEW_PATHS } from '@/lib/routes';
import { TLAB } from '@/lib/places';
import { PkgCard } from '@/components/ui/cards';
import { PlaceCard } from '@/components/ui/boxes';
import { EnquireButton } from '@/components/ui/LeadForm';
import { HeroGallery, StateFilter } from './PlacesClient';

export default function StatePage({ S, st, h1, extra }) {
  const s = st.s, list = S.PLACES.filter(p => p.s === s);
  const types = [...new Set(list.flatMap(p => p.t))].filter(t => S.CATS[t]);
  const pk = [...new Set(list.map(p => p.dest).filter(Boolean))].flatMap(S.pkgsOf).slice(0, 6);
  const gal = [st.img, ...list.map(S.placeImg)].filter((v, i, a) => a.indexOf(v) === i).slice(0, 3);
  return (
    <>
      <section className="page-hero cine"><div className="ph-bg" style={{ backgroundImage: `url(${img(st.img)})` }}></div><div className="wrap"><div><nav className="crumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><Link href={VIEW_PATHS.places}>India</Link><span>/</span><span>{st.n}</span></nav>
        <span className="eyebrow">{st.ut ? 'Union Territory' : 'State'} · Capital: {st.cap}</span><h1>{h1 || `${st.n} Tourism: ${list.length} Places to Visit`}</h1><p className="lead">{st.d}</p>
        <div className="facts"><div>Tourist places<b className="num">{list.length}</b></div><div>Packages<b className="num">{pk.length || 'Custom'}</b></div><div>Known for<b>{types.slice(0, 3).map(t => TLAB[t]).join(', ')}</b></div></div></div>
        <HeroGallery imgs={gal.map(g => [g, st.n])} /></div></section>
      {extra}
      <section className="sec"><div className="wrap" style={{ display: 'grid', gap: '26px' }}>
        <div className="box prose"><h2>About {st.n} tourism</h2><p>{st.d} The most visited places are {list.slice(0, 4).map(p => p.n).join(', ')}.</p><p>{list.length > 1 ? `Popular trip types here include ${types.map(t => TLAB[t].toLowerCase()).join(', ')}. Combine ${list[0].n} with ${list[1].n} for a classic ${st.n} holiday.` : ''}</p></div>
        <StateFilter title={`Tourist places in ${st.n}`} tabs={types.map(t => [t, TLAB[t]])} cards={list.map(p => ({ id: p.id, types: p.t, el: <PlaceCard p={p} S={S} extra={` · ${p.days} days`} /> }))} />
        <div className="box"><h2>Plan by month</h2><div style={{ overflowX: 'auto' }}><table className="pol"><thead><tr><th>Place</th><th>Best time</th><th>Ideal stay</th><th>Nearest airport</th></tr></thead><tbody>{list.map(p => <tr key={p.id}><td><Link href={PATHS.place(p)} style={{ color: 'var(--blue)', fontWeight: '700' }}>{p.n}</Link></td><td>{p.best}</td><td>{p.days} days</td><td>{p.air}</td></tr>)}</tbody></table></div></div>
        {pk.length ? <div><h2 style={{ fontSize: '26px', marginBottom: '16px' }}>{st.n} tour packages</h2><div className="grid g3">{pk.map(p => <PkgCard key={p.id} p={p} />)}</div></div> : null}
        <div className="cta-band"><div><h3>Plan your {st.n} trip</h3><p>Tell us your dates and budget; a TripPartner expert sends a custom itinerary.</p></div><div className="btns"><EnquireButton className="btn btn-o" subject={`${st.n} trip`} CONFIG={S.CONFIG}>Get a free quote</EnquireButton><a className="btn btn-wa" href={waLink(S.CONFIG, `Hi TripPartner, I want to plan a ${st.n} trip.`)} target="_blank" rel="noopener">{I.wa} WhatsApp</a></div></div>
      </div></section>
    </>
  );
}
