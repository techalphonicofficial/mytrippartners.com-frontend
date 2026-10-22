/* Destination page (original app.js destPage + design.js/detail.js helpers). Server component. */
import { inr, dname } from '@/lib/format';
import { PkgCard, TallDest } from '@/components/ui/cards';
import { MonthCal, EnquiryBox, HelpBox } from '@/components/ui/boxes';
import { SeoExtra } from '@/components/seo/Seo';
import DestReelBlock from '@/components/media/DestReelBlock';
import PartnerPkgBox from '@/components/partner/PartnerPkgBox';
import { galOf, faqD } from '@/lib/catalogue/detail';
import { DetailHero, DestCrumb, TtdCards, ReachBox, RelatedGuides, Checks } from './Blocks';

export default function DestPage({ S, d, ov }) {
  const ps = S.pkgsOf(d.id), sameRegion = S.DEST.filter(x => x.region === d.region && x.id !== d.id).slice(0, 6);
  const gal = galOf(d), n = dname(d);
  return (
    <>
      <DetailHero bg={d.img} gal={gal} alt={d.name} crumbs={<><DestCrumb d={d} /><span>/</span><span>{d.name}</span></>}>
        <span className="eyebrow">{d.tag}</span><h1>{ov.h1 || `${d.name} Tour Packages`}</h1><p className="lead">{d.about}</p>
        <div className="facts"><div>Starting from<b className="num">{inr(d.price)}</b></div><div>Best time<b>{d.best}</b></div><div>Ideal duration<b>{d.dur}</b></div><div>Nearest airport<b>{d.air}</b></div></div>
      </DetailHero>
      {ov.intro || ov.faqs.length ? <div><SeoExtra intro={ov.intro} faqs={ov.faqs} /></div> : null}
      <section className="sec"><div className="wrap layout">
        <div style={{ display: 'grid', gap: '22px', minWidth: '0' }}>
          <div className="box"><h2>{ps.length ? `${ps.length} ${n} package${ps.length > 1 ? 's' : ''}` : `Plan your ${n} holiday`}</h2>{ps.length ? <div className="grid g2">{ps.map(p => <PkgCard key={p.id} p={p} />)}</div> : <p className="muted">{`Tell us your dates and budget and we'll build a custom ${n} itinerary for you.`}</p>}</div>
          <MonthCal d={d} />
          <div className="box"><h2>Top things to do in {n}</h2><TtdCards d={d} /><Checks items={d.hl} className="checks two sr" /></div>
          <DestReelBlock S={S} destId={d.id} />
          <ReachBox d={d} />
          <div className="box faq"><h2>{n} travel FAQs</h2>{faqD(d).map(([q, a], i) => <details open={i === 0} key={i}><summary>{q}</summary><p>{a}</p></details>)}</div>
          {sameRegion.length ? <div><h2 style={{ fontSize: '26px', marginBottom: '16px' }}>{`More in ${d.region}${d.type === 'india' ? ' India' : ''}`}</h2><div className="rail" style={{ '--cw': '190px' }}>{sameRegion.map(x => <TallDest key={x.id} d={x} sm />)}</div></div> : null}
        </div>
        <aside className="side"><EnquiryBox subject={`${d.name} holiday`} CONFIG={S.CONFIG} /><PartnerPkgBox S={S} p={{ dest: d.id, id: (ps[0] || {}).id || '' }} /><RelatedGuides S={S} destId={d.id} /><HelpBox CONFIG={S.CONFIG} /></aside>
      </div></section>
    </>
  );
}

