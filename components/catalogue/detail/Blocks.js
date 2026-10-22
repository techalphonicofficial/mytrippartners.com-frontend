/* Server building blocks of the destination and package pages (same markup as the original):
   detail.js  quickInfo → <QuickInfo>, routeViz → <RouteViz>, staysBox → <StaysBox>, priceTable → <PriceTable>,
              goodToKnow → <GoodToKnow>, dayMeta → <DayMeta>, reachBox → <ReachBox>, relatedGuides → <RelatedGuides>
   design.js  ttdCards → <TtdCards>, dayImg → <DayImg>
   app.js     pkgPage itinerary → <DayList>, highlight lists → <Checks>, hero → <DetailHero> */
import Link from 'next/link';
import { I, withProps } from '@/components/icons';
import { img } from '@/lib/format';
import { PATHS, VIEW_PATHS } from '@/lib/routes';
import { stays, overnightFor, pace, meals, permitNote, relatedGuide, galOf, dayImgName, quickFacts, PRICE_CATS, PRICE_PAX, round100, packingTip } from '@/lib/catalogue/detail';
import { Gallery } from './DetailClient';

const CHEV = withProps(I.chev, { className: 'chev' });

/* <ul class="checks …"><li>✓<span>text</span></li></ul> */
export function Checks({ items, className = 'checks', icon = I.check }) {
  return <ul className={className}>{items.map((h, i) => <li key={i}>{icon}<span>{h}</span></li>)}</ul>;
}

/* cinematic page hero: background, crumbs, intro (children) and the photo gallery */
export function DetailHero({ bg, crumbs, children, gal, alt }) {
  return (
    <section className="page-hero cine"><div className="ph-bg" style={{ backgroundImage: `url(${img(bg)})` }}></div><div className="wrap">
      <div><nav className="crumbs"><Link href="/">Home</Link><span>/</span>{crumbs}</nav>{children}</div>
      <Gallery images={gal.slice(0, 3).map(img)} total={gal.length} alt={alt} />
    </div></section>
  );
}

/* India / International crumb of a destination */
export function DestCrumb({ d }) {
  const india = d.type === 'india';
  return <Link href={india ? VIEW_PATHS.india : VIEW_PATHS.international}>{india ? 'India Holidays' : 'International'}</Link>;
}

/* ---------- destination ---------- */
export function TtdCards({ d }) {
  const g = galOf(d);
  return <div className="ttd" aria-hidden="true">{d.hl.map((h, i) => <div className="ttd-c" key={i}><span className="ttd-img"><img loading="lazy" decoding="async" src={img(g[i % g.length])} alt="" /><i>{String(i + 1).padStart(2, '0')}</i></span><p>{h}</p></div>)}</div>;
}

export function ReachBox({ d }) {
  const intl = d.type === 'intl';
  return (
    <div className="box"><h2>Getting there</h2><div className="grid g3 reach">
      <div>{I.plane}<b>By air</b><p>{`Nearest airport: ${d.air}. ${intl ? 'Direct and one-stop flights from major Indian metros.' : 'Well connected from Delhi, Mumbai, Bengaluru and other metros.'}`}</p></div>
      <div>{I.car}<b>Transfers</b><p>Private pickup and drop from airport, railway station or hotel are included in every package.</p></div>
      <div>{I.passport}<b>{intl ? 'Visa & documents' : 'Documents & permits'}</b><p>{intl ? 'Passport valid 6+ months. Our visa desk shares the current entry rules and checklist.' : permitNote(d.id)}</p></div></div></div>
  );
}

export function RelatedGuides({ S, destId }) {
  const g = relatedGuide(S, destId); if (!g) return null;
  return <div className="box"><h3>Read before you go</h3><Link className="mini-g" href={PATHS.guide(g.id)}><img decoding="async" src={img(g.img)} alt="" /><span>{g.title}<br /><small className="muted">{g.min} min read</small></span></Link></div>;
}

/* ---------- package ---------- */
export function QuickInfo({ p, d }) {
  return <div className="qinfo"><div className="wrap">{quickFacts(p, d).map(([ic, l, v]) => <div key={l}>{I[ic]}<span><small>{l}</small><b>{v}</b></span></div>)}</div></div>;
}

export function RouteViz({ p }) {
  const st = stays(p); if (st.length < 2) return null;
  return <div className="routev">{st.map(([c, n], i) => [<div className="rv-stop" key={'s' + i}><span className="dot">{i + 1}</span><b>{c}</b><small>{`${n} night${n > 1 ? 's' : ''}`}</small></div>, i < st.length - 1 ? <span className="rv-line" key={'l' + i}></span> : null])}</div>;
}

export function DayMeta({ p, i }) {
  const ov = overnightFor(p), last = p.n;
  return <div className="dmeta">{i < last && ov ? <span>{I.bed} Overnight: {ov[i]}</span> : i === last ? <span>{I.plane} Departure day</span> : null}<span>{I.star} Meals: {meals(p, i, last)}</span></div>;
}

export function DayImg({ p, d, i }) { return <img className="day-img" loading="lazy" decoding="async" src={img(dayImgName(p, d, i))} alt="" />; }

export function DayList({ p, d }) {
  return (
    <div className="box itl" id="it"><h2>Day-wise itinerary</h2>{p.plan.map((s, i) => {
      const [t, x] = s.split('|');
      return <details className="day" open={i < 2} key={i}><summary><span className="dn">Day {i + 1}</span>{t}{CHEV}</summary><div className="dd"><div className="dd-t">{x || ''}<DayMeta p={p} i={i} /></div><DayImg p={p} d={d} i={i} /></div></details>;
    })}</div>
  );
}

export function StaysBox({ p }) {
  const st = stays(p); if (!st.length) return null;
  return (
    <div className="box" id="hot"><h2>Where you&apos;ll stay</h2><div style={{ overflowX: 'auto' }}><table className="pol stays"><thead><tr><th>City</th><th>Nights</th><th>Standard</th><th>Deluxe</th><th>Premium</th></tr></thead><tbody>{st.map(([c, n], i) => <tr key={i}><td><b>{c}</b></td><td className="num">{n}</td><td>3★ hotel or similar</td><td>4★ hotel or similar</td><td>5★ / boutique or similar</td></tr>)}</tbody></table></div>
      <p className="muted" style={{ fontSize: '13px', marginTop: '10px' }}>Hotel names are confirmed in your quote. Houseboats, camps and homestays are used where the itinerary mentions them.</p></div>
  );
}

export function PriceTable({ p, d }) {
  return (
    <div className="box" id="prc"><h2>Price per person</h2><div style={{ overflowX: 'auto' }}><table className="pol ptab"><thead><tr><th>Group size</th>{PRICE_CATS.map(c => <th key={c[0]}>{c[0]}</th>)}</tr></thead><tbody>
      {PRICE_PAX.map(([l, f]) => <tr key={l}><td><b>{l}</b></td>{PRICE_CATS.map(([k, m]) => <td className="num" key={k}>{round100(p.price * m * f)}</td>)}</tr>)}
      <tr><td><b>Single-room supplement</b></td>{PRICE_CATS.map(([k, m]) => <td className="num" key={k}>{'+ ' + round100(p.price * m * 0.4)}</td>)}</tr>
      <tr><td><b>Child with extra bed (5–11)</b></td>{PRICE_CATS.map(([k, m]) => <td className="num" key={k}>{round100(p.price * m * 0.7)}</td>)}</tr></tbody></table></div>
      <p className="muted" style={{ fontSize: '13px', marginTop: '10px' }}>{`Indicative prices on twin sharing, excluding flights and ${d.type === 'intl' ? 'GST/TCS' : 'GST'}. Peak dates (Diwali, Christmas–New Year, long weekends) may cost more.`}</p></div>
  );
}

export function GoodToKnow({ p, d }) {
  const intl = d.type === 'intl';
  return (
    <div className="box" id="gtk"><h2>Good to know</h2><div className="grid g2 gtk">
      <div><b>{I.passport} Documents</b><p>{intl ? 'Passport valid for 6+ months, visa (if required), return tickets and travel insurance.' : permitNote(d.id)}</p></div>
      <div><b>{I.bag} What to pack</b><p>{packingTip(p.dest)} <Link href={PATHS.guide('winter-packing')} style={{ color: 'var(--blue)' }}>Packing checklist</Link></p></div>
      <div><b>{I.clock} Pace</b><p>{`${pace(p)[1]}. Tell us about senior travellers or young children and we'll adjust the plan.`}</p></div>
      <div><b>{I.wallet} Money</b><p>{intl ? 'Carry a forex card and some local currency; UPI works only in select countries.' : 'UPI and cards work almost everywhere; keep some cash for hill areas and small shops.'}</p></div>
    </div></div>
  );
}
