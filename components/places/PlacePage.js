/* Place guide, e.g. /india/himachal-pradesh/manali/ (original placePage, places.js). Server component. */
import Link from 'next/link';
import { I, withProps } from '@/components/icons';
import { img } from '@/lib/format';
import { PATHS, VIEW_PATHS } from '@/lib/routes';
import { TLAB, nearbyPlaces, placePkgs, itinerary, nearestHubs, aboutCopy, tipsFor, faqsFor } from '@/lib/places';
import { PkgCard } from '@/components/ui/cards';
import { PlaceCard, MonthCal, EnquiryBox, HelpBox } from '@/components/ui/boxes';
import { HeroGallery, JumpTabs } from './PlacesClient';

const TABS = [['p-about', 'About'], ['p-top', 'Places to visit'], ['p-plan', 'Itinerary'], ['p-when', 'Best time'], ['p-reach', 'How to reach'], ['p-food', 'Food & shopping'], ['p-tips', 'Tips'], ['p-faq', 'FAQs']];
const CHEV = withProps(I.chev, { className: 'chev' });

export default function PlacePage({ S, p, h1, extra }) {
  const st = S.ST(p.s), near = nearbyPlaces(S, p, 6), more = S.PLACES.filter(x => x.s === p.s && x.id !== p.id).slice(0, 8);
  const pk = placePkgs(S, p), days = itinerary(p), hubs = nearestHubs(p);
  const gal = [...new Set([S.placeImg(p), ...(p.dest && S.D(p.dest) ? S.D(p.dest).gal : []), st.img])].slice(0, 3);
  const href = PATHS.place(p);
  const hasFood = p.food && p.food.length, hasBuy = p.buy && p.buy.length;
  return (
    <>
      <section className="page-hero cine"><div className="ph-bg" style={{ backgroundImage: `url(${img(S.placeImg(p))})` }}></div><div className="wrap">
        <div><nav className="crumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><Link href={VIEW_PATHS.places}>India</Link><span>/</span><Link href={PATHS.state(p.s)}>{st.n}</Link><span>/</span><span>{p.n}</span></nav>
          <span className="eyebrow">{p.t.map(t => TLAB[t] || t).join(' · ')}</span><h1>{h1 || `${p.n} Tourism`}</h1><p className="lead">{p.d}</p>
          <div className="facts"><div>State<b>{st.n}</b></div><div>Best time<b>{p.best.split(';')[0]}</b></div><div>Ideal stay<b>{p.days} days</b></div>{p.alt ? <div>Altitude<b className="num">{p.alt.toLocaleString('en-IN')} m</b></div> : null}</div></div>
        <HeroGallery className={'ph-gal ' + (gal.length < 3 ? 'one' : '')} imgs={gal.map(g => [g, p.n])} more />
      </div></section>
      {extra}
      <div className="qinfo"><div className="wrap">{[[I.plane, 'Nearest airport', p.air], [I.car, 'Nearest railhead', p.rail], [I.pin, 'Nearest city', `${hubs[0].n} (~${hubs[0].k} km)`], [I.clock, 'Best time', p.best], [I.cal, 'Ideal stay', p.days + ' days'], [I.star, 'Known for', p.t.slice(0, 2).map(t => TLAB[t]).join(', ')]].map(([i, l, v]) => <div key={l}>{i}<span><small>{l}</small><b>{v}</b></span></div>)}</div></div>
      <section className="sec"><div className="wrap layout"><div style={{ display: 'grid', gap: '22px', minWidth: '0' }}>
        <JumpTabs tabs={TABS} href={href} />
        <article className="box prose" id="p-about"><h2>About {p.n}</h2>{aboutCopy(S, p).map((x, i) => <p key={i}>{x}</p>)}</article>
        <div className="box" id="p-top"><h2>Top {p.a.length} places to visit in {p.n}</h2><ol className="tplist">{p.a.map((a, i) => <li key={i}><span className="tpn">{i + 1}</span><div><b>{a}</b><small>{p.n}, {st.n}</small></div></li>)}</ol></div>
        <div className="box itl" id="p-plan"><h2>{days.length}-day {p.n} itinerary</h2>{days.map((d, i) => <details key={i} className="day" open={i < 2}><summary><span className="dn">Day {i + 1}</span>{i === 0 ? 'Arrive & explore' : i === days.length - 1 && days.length > 1 ? 'Final sights & departure' : 'Sightseeing'}{CHEV}</summary><div className="dd"><div className="dd-t">{`${i === 0 ? `Arrive via ${p.air.split('(')[0].trim()} or ${p.rail.split('/')[0].trim()} and check in. ` : ''}Visit ${d.join(', ')}.${p.food && p.food[i] ? ` Try ${p.food[i]} for a meal.` : ''}`}</div></div></details>)}<p className="muted" style={{ fontSize: '13px', marginTop: '10px' }}>A suggested plan. Your TripPartner expert adjusts it to your dates, pace and hotel.</p></div>
        <div id="p-when"><MonthCal d={{ best: p.best, name: p.n, short: p.n, id: p.id }} /></div>
        <div className="box" id="p-reach"><h2>How to reach {p.n}</h2><div className="grid g3 reach">
          <div>{I.plane}<b>By air</b><p>{p.air}. Pre-book an airport taxi with your package.</p></div>
          <div>{I.car}<b>By train</b><p>{p.rail}. Book IRCTC tickets early in peak season.</p></div>
          <div>{I.pin}<b>By road</b><p>Connected by highways to {hubs.map(h => `${h.n} (~${h.k} km)`).join(', ')}. Distances are straight-line estimates; road distance is longer.</p></div></div></div>
        {hasFood || hasBuy ? <div className="box" id="p-food"><h2>What to eat &amp; buy in {p.n}</h2><div className="grid g2">{hasFood ? <div><h3>Local food</h3><div className="pchips">{p.food.map((f, i) => <span key={i} className="chipx">{f}</span>)}</div></div> : null}{hasBuy ? <div><h3>Shopping</h3><div className="pchips">{p.buy.map((f, i) => <span key={i} className="chipx alt">{f}</span>)}</div></div> : null}</div></div> : <div id="p-food"></div>}
        <div className="box" id="p-tips"><h2>Travel tips for {p.n}</h2><ul className="checks">{tipsFor(p).map((t, i) => <li key={i}>{I.check}<span>{t}</span></li>)}</ul></div>
        {pk.length ? <div><h2 style={{ fontSize: '26px', marginBottom: '16px' }}>{p.n} &amp; {st.n} tour packages</h2><div className="grid g3">{pk.map(x => <PkgCard key={x.id} p={x} />)}</div></div> : null}
        <div className="box"><h2>Places near {p.n}</h2><div className="plc-grid">{near.map(o => <PlaceCard key={o.x.id} p={o.x} S={S} extra={` · ~${o.k} km`} />)}</div></div>
        <div className="box faq" id="p-faq"><h2>{p.n} travel FAQs</h2>{faqsFor(S, p).map(([q, a], i) => <details key={i} open={i < 2}><summary>{q}</summary><p>{a}</p></details>)}</div>
        {more.length ? <div><h2 style={{ fontSize: '24px', marginBottom: '14px' }}>More places in {st.n}</h2><div className="plc-grid">{more.map(x => <PlaceCard key={x.id} p={x} S={S} />)}</div><p style={{ marginTop: '14px' }}><Link className="link-arrow" href={PATHS.state(p.s)}>All {st.n} tourist places {I.arrow}</Link></p></div> : null}
      </div><aside className="side"><EnquiryBox subject={`${p.n} trip`} CONFIG={S.CONFIG} /><div className="box pbox"><h3>{I.users} Travelling solo?</h3><p className="muted" style={{ fontSize: '14px' }}>Find a verified travel partner for {p.n}.</p><Link className="btn btn-b" style={{ width: '100%', marginTop: '10px' }} href={VIEW_PATHS.partner}>Find a travel partner</Link></div><HelpBox CONFIG={S.CONFIG} /></aside></div></section>
    </>
  );
}
