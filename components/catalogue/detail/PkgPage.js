/* Package page (original app.js pkgPage + polish.js print button + detail.js / design.js / extra.js helpers).
   Server component; interactive parts are the client islands in DetailClient.js and the shared buttons.
   Not bookable (dashboard): the "Book Now" links become "Enquire" buttons (original api.js apiAfterRender). */
import Link from 'next/link';
import { I } from '@/components/icons';
import { inr, img, waLink } from '@/lib/format';
import { PATHS } from '@/lib/routes';
import { PkgCard } from '@/components/ui/cards';
import { HelpBox } from '@/components/ui/boxes';
import { WishlistBigButton, ShareButton } from '@/components/ui/buttons';
import { EnquireButton } from '@/components/ui/LeadForm';
import { SeoExtra } from '@/components/seo/Seo';
import DestReelBlock from '@/components/media/DestReelBlock';
import PartnerPkgBox from '@/components/partner/PartnerPkgBox';
import { galOf, faqD, inclusions, exclusions, similarPkgs } from '@/lib/catalogue/detail';
import { DetailHero, QuickInfo, RouteViz, DayList, StaysBox, PriceTable, GoodToKnow, Checks } from './Blocks';
import { JumpTabs, Estimator, PrintButton, CmpWideButton, RecordView } from './DetailClient';

const TABS = [['ov', 'Overview'], ['it', 'Itinerary'], ['hot', 'Hotels'], ['prc', 'Prices'], ['inc', 'Inclusions'], ['gtk', 'Good to know'], ['pol', 'Policies'], ['pfaq', 'FAQs']];

/* "Book Now" link, or an "Enquire" button when the package is not bookable */
function BookLink({ S, p, children }) {
  if (S.blocked.has(p.id)) return <EnquireButton className="btn btn-o" subject={`${p.title} — availability`} CONFIG={S.CONFIG}>Enquire</EnquireButton>;
  return <Link className="btn btn-o" href={PATHS.book(p.id)}>{children}</Link>;
}

export default function PkgPage({ S, p, ov }) {
  const d = S.D(p.dest), intl = d.type === 'intl', C = S.CONFIG;
  const sim = similarPkgs(S, p), gal = [...new Set([p.img, ...d.gal])];
  return (
    <>
      <RecordView id={p.id} />
      <DetailHero bg={p.img} gal={gal} alt={p.title} crumbs={<><Link href={PATHS.dest(d.id)}>{d.name}</Link><span>/</span><span>{p.title}</span></>}>
        {p.tag ? <span className="eyebrow">{p.tag}</span> : null}<h1>{ov.h1 || p.title}</h1><p className="lead">{p.route}</p>
        <div className="meta-chips"><span>{p.n} Nights / {p.n + 1} Days</span>{p.themes.map(t => <span key={t}>{S.T(t).name}</span>)}<span>{intl ? 'International' : 'India'}</span></div>
      </DetailHero>
      {ov.intro || ov.faqs.length ? <div><SeoExtra intro={ov.intro} faqs={ov.faqs} /></div> : null}
      <QuickInfo p={p} d={d} />
      <section className="sec"><div className="wrap layout">
        <div style={{ minWidth: '0' }}>
          <JumpTabs href={PATHS.pkg(p.id)} tabs={TABS} />
          <div style={{ display: 'grid', gap: '22px' }}>
            <div className="box prose" id="ov"><h2>Overview</h2><p>{d.about}</p><p>{`This ${p.n}-night package covers ${p.route}. Hotels, vehicle type and activities can be changed to suit your budget and pace.`}</p><RouteViz p={p} /><h3 style={{ marginTop: '18px' }}>Highlights</h3><Checks items={d.hl.slice(0, 6)} className="checks two" /></div>
            <DestReelBlock S={S} destId={p.dest} />
            <DayList p={p} d={d} />
            <StaysBox p={p} />
            <PriceTable p={p} d={d} />
            <div className="box" id="inc"><div className="grid g2"><div><h3>Inclusions</h3><Checks items={inclusions(p, intl)} /></div><div><h3>Exclusions</h3><Checks items={exclusions(intl)} className="checks x" icon={I.xmark} /></div></div></div>
            <GoodToKnow p={p} d={d} />
            <div className="box" id="pol"><h2>Payment &amp; cancellation</h2><div style={{ overflowX: 'auto' }}><table className="pol"><thead><tr><th>When</th><th>Payment / charge</th></tr></thead><tbody><tr><td>At booking</td><td>25% advance to confirm</td></tr><tr><td>21 days before departure</td><td>Balance payment due</td></tr><tr><td>Cancel 30+ days before</td><td>25% of package cost</td></tr><tr><td>Cancel 15–29 days before</td><td>50% of package cost</td></tr><tr><td>Cancel 7–14 days before</td><td>75% of package cost</td></tr><tr><td>Cancel within 7 days / no-show</td><td>100% of package cost</td></tr></tbody></table></div><p className="muted" style={{ fontSize: '13px', marginTop: '10px' }}>Standard terms. Peak-season, flight and hotel-specific conditions are shared with your quote. See <Link href={PATHS.info('cancellation')} style={{ color: 'var(--blue)' }}>full policy</Link>.</p></div>
            <div className="box faq" id="pfaq"><h2>FAQs</h2>{faqD(d).slice(0, 4).map(([q, a], i) => <details key={i}><summary>{q}</summary><p>{a}</p></details>)}<details><summary>Is the price per person?</summary><p>Yes, the starting price is per person on twin sharing in standard hotels. Final price depends on travel dates, hotel category and group size.</p></details></div>
            {sim.length ? <div><h2 style={{ fontSize: '26px', marginBottom: '16px' }}>You may also like</h2><div className="grid g3">{sim.map(x => <PkgCard key={x.id} p={x} />)}</div></div> : null}
          </div>
        </div>
        <aside className="side">
          <div className="box price-card"><div className="pc-img"><img decoding="async" src={img(p.img)} alt="" />{p.tag ? <span>{p.tag}</span> : null}</div><span className="from">Starting from</span><div className="price">{inr(p.price)}</div><span className="pp">per person on twin sharing</span>
            <BookLink S={S} p={p}>Book Now</BookLink>
            <EnquireButton className="btn btn-ghost" subject={p.title} CONFIG={C}>Get a custom quote</EnquireButton>
            <a className="btn btn-wa" href={waLink(C, `Hi TripPartner, I'm interested in "${p.title}" (${p.n}N/${p.n + 1}D, from ${inr(p.price)}). Please share details.`)} target="_blank" rel="noopener">{I.wa} Ask on WhatsApp</a>
            <WishlistBigButton id={p.id} />
            <ShareButton />
            <PrintButton />
            <CmpWideButton id={p.id} />
            <div className="save">Use code <b>LASTMINUTE</b> on departures within 15 days</div></div>
          <Estimator price={p.price} />
          <PartnerPkgBox S={S} p={p} />
          <HelpBox CONFIG={C} />
        </aside>
      </div></section>
      <div className="mbar"><div><small>From</small><b className="num">{inr(p.price)}</b><small>per person</small></div><div className="mbar-a"><EnquireButton className="btn btn-ghost btn-sm" subject={p.title} CONFIG={C}>Quote</EnquireButton><BookLink S={S} p={p}>Book Now</BookLink></div></div>
    </>
  );
}

