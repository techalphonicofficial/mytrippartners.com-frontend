/* Weekend getaways from Delhi NCR (legacy weekendPage + weekendInit). */
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getSite } from '@/lib/site';
import { pageMetadata, seoOverride, faqLd } from '@/lib/seo';
import { builtInPage } from '@/lib/pages';
import { JsonLd, SeoExtra } from '@/components/seo/Seo';
import { EnquireButton } from '@/components/ui/LeadForm';
import { I } from '@/components/icons';
import { img, inr } from '@/lib/format';
import { PATHS } from '@/lib/routes';
import { weekendList, nextWeekends, ymd } from '@/lib/media/weekend';
import WeekendScale from '@/components/media/WeekendScale';
import { WeekendBrowser, NextWeekendRange, UpcomingWeekends } from '@/components/media/WeekendParts';

const PATH = '/weekend-getaways-from-delhi/';
const FAQ = [
  ['Do I need to take leave from office?', 'No. Overnight trips leave Friday night and return early Monday or Sunday night; day-departure trips leave Saturday morning and return Sunday night.'],
  ['Is transport included?', 'Yes. Every weekend package includes return transport from Delhi NCR — private cab, AC tempo traveller or Volvo, as mentioned on each trip.'],
  ['Can I travel solo?', 'Yes. Join a group departure, or find a verified partner with Travel Partner to share a room and split costs.'],
  ['What about long weekends?', 'Prices and availability change on long weekends and festivals. We publish long-weekend departures early — check the home page or ask on WhatsApp.'],
];

export async function generateMetadata() { const S = await getSite(); return pageMetadata(S, PATH); }

export default async function WeekendPage() {
  const S = await getSite();
  if (!S.WEEKEND.length) notFound();
  const C = S.CONFIG, list = weekendList(S), fri = ymd(nextWeekends(1)[0]);
  const ov = seoOverride(S, PATH), page = builtInPage(S, PATH);
  return (
    <>
      <section className="page-hero cine"><div className="ph-bg" style={{ backgroundImage: `url(${img('rafting')})` }}></div><div className="wrap"><div><nav className="crumbs"><Link href="/">Home</Link><span>/</span><span>Weekend getaways</span></nav>
        <span className="eyebrow">From Delhi · Noida · Gurugram · Ghaziabad</span><h1>{ov.h1 || 'Weekend Getaways from Delhi NCR'}</h1><p className="lead">{S.WEEKEND.length} trips you can do without taking leave — mountains, rivers, forts, temples and tiger reserves, 2.5 to 10 hours from home.</p>
        <div className="facts"><div>Trips<b className="num">{S.WEEKEND.length}</b></div><div>Closest<b>{list[0].title.split(' ')[0]} · {list[0].wk.km} km</b></div><div>From<b className="num">{inr(Math.min(...S.WEEKEND.map(p => p.price)))}</b></div><div>Next weekend<NextWeekendRange fri={fri} /></div></div></div>
        <div className="ph-gal"><img src={img('rafting')} alt="" decoding="async" /><img src={img('taj')} alt="" decoding="async" /><img src={img('shimla')} alt="" decoding="async" /></div></div></section>
      {ov.intro || ov.faqs.length ? <SeoExtra intro={ov.intro} faqs={ov.faqs} /> : null}
      <section className="sec"><div className="wrap" style={{ display: 'grid', gap: '24px' }}>
        <WeekendScale list={list} />
        <WeekendBrowser list={list} fri={fri} variant="page" CONFIG={C} />
        <div className="grid g3 wk-info">
          <div className="box"><h3>{I.pin} Pickup points</h3><ul className="checks">{(C.pickups || []).map(x => <li key={x}>{I.check}<span>{x}</span></li>)}</ul><p className="muted" style={{ fontSize: '12.5px', marginTop: '8px' }}>Private-cab trips pick you up from home within Delhi NCR.</p></div>
          <div className="box"><h3>{I.cal} Upcoming weekends</h3><UpcomingWeekends fri={fri} /><p className="muted" style={{ fontSize: '12.5px', marginTop: '8px' }}>Long weekends sell out early — book 2–3 weeks ahead.</p></div>
          <div className="box"><h3>{I.users} Going with friends or office?</h3><p className="muted" style={{ fontSize: '14px' }}>Groups of 8+ get a private tempo traveller, a trip captain and group pricing. Perfect for team outings.</p><EnquireButton className="btn btn-o" style={{ marginTop: '12px', width: '100%' }} subject="Weekend group trip from Delhi NCR" CONFIG={C}>Get group quote</EnquireButton><Link className="btn btn-ghost" style={{ marginTop: '8px', width: '100%' }} href={PATHS.service('corporate')}>Corporate offsites</Link></div>
        </div>
        <div className="box faq"><h2>Weekend trip FAQs</h2>{FAQ.map(([q, a], i) => <details key={i} open={i < 2}><summary>{q}</summary><p>{a}</p></details>)}</div>
      </div></section>
      <JsonLd data={[...(page ? page.jsonld() : []), faqLd(ov.faqs)]} />
    </>
  );
}
