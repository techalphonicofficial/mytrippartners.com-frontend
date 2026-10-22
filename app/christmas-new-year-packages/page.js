/* Christmas & New Year packages 2026–27 (legacy festivePage + festiveInit). */
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getSite } from '@/lib/site';
import { pageMetadata, seoOverride, faqLd } from '@/lib/seo';
import { builtInPage } from '@/lib/pages';
import { JsonLd, SeoExtra } from '@/components/seo/Seo';
import { EnquireButton } from '@/components/ui/LeadForm';
import { img, inr } from '@/lib/format';
import { PATHS, VIEW_PATHS } from '@/lib/routes';
import { festiveList, fxDate, fxLeft } from '@/lib/media/festive';
import { Countdown, FestiveBrowser } from '@/components/media/FestiveParts';

const PATH = '/christmas-new-year-packages/';
const FAQ = [
  ['When should I book Christmas and New Year trips?', 'As early as possible — ideally by October. Flights, snow-destination hotels and New Year gala dinners sell out by early December.'],
  ['Is the New Year\'s Eve party or gala dinner included?', 'Each package lists its festive highlight. Where a gala dinner or party pass is mentioned, it is included; premium seating or drinks may cost extra.'],
  ['Will there be snow in Manali and Gulmarg?', 'Late December usually brings snow to Gulmarg and the higher areas around Manali (Solang, Sissu), but snowfall depends on the weather. Roads can close after heavy snow, so keep a buffer day.'],
  ['What are the cancellation terms for festive dates?', 'Festive departures have stricter terms because hotels and airlines charge peak cancellation fees. The exact terms are shared with your quote before you pay.'],
  ['Can I change hotels or add nights?', 'Yes. Every festive package can be customised — upgrade hotels, add nights or add flights from your city.'],
];
const day = d => new Date(d + 'T00:00:00');

export async function generateMetadata() { const S = await getSite(); return pageMetadata(S, PATH); }

export default async function FestivePage() {
  const S = await getSite();
  if (!S.FESTIVE.length) notFound();
  const C = S.CONFIG, list = festiveList(S), byDate = [...new Set(list.map(p => p.fx.dep))];
  const ov = seoOverride(S, PATH), page = builtInPage(S, PATH);
  return (
    <>
      <section className="page-hero cine fx-hero"><div className="ph-bg" style={{ backgroundImage: `url(${img('kashmir-snow')})` }}></div><div className="fx-snow" aria-hidden="true"></div><div className="wrap"><div><nav className="crumbs"><Link href="/">Home</Link><span>/</span><span>Christmas &amp; New Year</span></nav>
        <span className="eyebrow" style={{ color: '#ffd33d' }}>Festive departures · Dec 2026 – Jan 2027</span><h1>{ov.h1 || 'Christmas & New Year Packages 2026–27'}</h1><p className="lead">White Christmas in the mountains, midnight mass in Goa and Kochi, desert-camp countdowns, and New Year fireworks in Dubai, Phuket and Singapore.</p>
        <div className="fx-cdw" style={{ marginTop: '18px' }}><small>Countdown to New Year 2027</small><Countdown initial={fxLeft()} /></div></div>
        <div className="ph-gal"><img src={img('kashmir-snow')} alt="" decoding="async" /><img src={img('goa-beach')} alt="" decoding="async" /><img src={img('dubai')} alt="" decoding="async" /></div></div></section>
      {ov.intro || ov.faqs.length ? <SeoExtra intro={ov.intro} faqs={ov.faqs} /> : null}
      <section className="sec"><div className="wrap" style={{ display: 'grid', gap: '26px' }}>
        <FestiveBrowser list={list} variant="page" CONFIG={C} />
        <div className="box"><h2>Festive departure calendar</h2><div className="fx-cal">{byDate.map(d => <div key={d} className="fx-day"><span className="fx-dd"><b>{day(d).getDate()}</b><small>{day(d).toLocaleDateString('en-IN', { month: 'short', weekday: 'short' })}</small></span><div>{list.filter(p => p.fx.dep === d).map(p => <Link key={p.id} href={PATHS.pkg(p.id)}><b>{p.title}</b><small>{p.n}N · back {fxDate(p.fx.ret)} · from {inr(p.eb)}</small></Link>)}</div></div>)}</div></div>
        <div className="grid g3">
          <div className="box"><h3>Book early, save more</h3><p className="muted" style={{ fontSize: '14px' }}>Flights and hotels for 24–31 December sell out fast and get costlier every week. Lock your trip with a 25% advance; early-bird prices apply till 31 October.*</p></div>
          <div className="box"><h3>Office &amp; group parties</h3><p className="muted" style={{ fontSize: '14px' }}>Planning a team New Year trip or a family reunion? Get a private departure, group rates and a trip captain.</p><EnquireButton className="btn btn-o" style={{ marginTop: '12px', width: '100%' }} subject="Christmas / New Year group trip" CONFIG={C}>Get group quote</EnquireButton></div>
          <div className="box"><h3>Travelling solo?</h3><p className="muted" style={{ fontSize: '14px' }}>Join a group departure or find a verified Travel Partner for the holidays — share a room only if you both agree.</p><Link className="btn btn-b" style={{ marginTop: '12px', width: '100%' }} href={VIEW_PATHS.partner}>Find a travel partner</Link></div>
        </div>
        <div className="box faq"><h2>Christmas &amp; New Year FAQs</h2>{FAQ.map(([q, a], i) => <details key={i} open={i < 2}><summary>{q}</summary><p>{a}</p></details>)}</div>
      </div></section>
      <JsonLd data={[...(page ? page.jsonld() : []), faqLd(ov.faqs)]} />
    </>
  );
}
