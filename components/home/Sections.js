/* Server-rendered home sections. Same markup as the original:
   home2.js → TrustStrip, BannerIndia, BannerThai, BannerCode, TripsForAll, Specialists, Reasons, Confidence, Spotlight
   app.js home() → ThemeRow, OfferBanner, Trending, IaPanes (+ homeInit ia()), PartnerBand, Spiritual, LongWeekendSection,
                   Departures, Season, Recommended, HowItWorks, Stories, Guides, CtaBand
   api.js apiReviews → Reviews */
import Link from 'next/link';
import { I, TI, RI } from '@/components/icons';
import { img, inr, dname, waLink, todayISO } from '@/lib/format';
import { PATHS, VIEW_PATHS } from '@/lib/routes';
import { SecHead, TallDest } from '@/components/ui/cards';
import { RailNav, PlanButton } from '@/components/ui/buttons';
import GuideCard from '@/components/editorial/GuideCard';
import Avatar from '@/components/partner/Avatar';
import { LongWeekend } from './HomeClient';
import { nextLongWeekend } from './longWeekend';

/* lowest price of a destination (its own "from" price or any of its packages) */
const fromPrice = (S, d) => Math.min(d.price, ...S.pkgsOf(d.id).map(p => p.price));

/* ---------- trust strip ---------- */
export function TrustStrip({ S }) {
  const C = S.CONFIG;
  const items = [
    [I.bag, `${S.PKG.length}+`, 'Ready itineraries'],
    [I.globe, `${S.PLACES.length}+`, 'India travel guides'],
    [I.pin, `${S.DEST.length}`, 'Destinations, India & abroad'],
    ...(C.travellers ? [[I.users, C.travellers.toLocaleString('en-IN') + '+', 'Happy travellers']] : [[I.star, '100%', 'Customisable trips']]),
    [I.headset, '24×7', 'On-trip support']];
  const aw = (C.awards || [])[0];
  const t2 = ([i, n, l]) => <div className="t2" key={l}>{i}<span><b className="num">{n}</b><small>{l}</small></span></div>;
  return (
    <section className="trust2"><div className="wrap"><div className="t2-row">
      {items.slice(0, 2).map(t2)}
      <div className="t2-award">{aw ? <><span className="laurel l">❦</span><div><small>Awarded</small><b>{aw.title}</b><em>{aw.by || ''}</em></div><span className="laurel r">❦</span></> : <div><small>Why TripPartner</small><b>One trip expert, start to end</b><em>Explore · Plan · Travel · Together</em></div>}</div>
      {items.slice(2).map(t2)}
    </div></div></section>
  );
}

/* ---------- theme row ---------- */
export function ThemeRow({ S }) {
  return (
    <section className="sec-tight"><div className="wrap">
      <SecHead h="Explore Holidays By Theme" p="Find your perfect getaway, tailored to your interests." />
      <div className="theme-row">{S.THEMES.slice(0, 8).map(t => <Link key={t.id} className="th-card" href={PATHS.theme(t.id)}>{TI[t.icon]}<b>{t.name}</b><small>Explore Now</small></Link>)}</div>
    </div></section>
  );
}

/* ---------- offer banners (slides of the #promo slider) ---------- */
export function BannerIndia() {
  const arch = ['ladakh', 'kedarnath', 'th-pilgrimage', 'madurai', 'rajasthan-fort', 'taj', 'sikkim', 'kerala-house', 'arunachal'];
  return (
    <Link className="banner bn-india" href={VIEW_PATHS.india}><div className="bni-sky"></div>
      <div className="bni-t"><h3>India Tour Packages</h3><p>Explore North, South &amp; North East India</p></div>
      <div className="bni-sky-line">{arch.map((im, i) => <span key={i} className={`arc a${i % 3}`}><img src={img(im)} alt="" decoding="async" /></span>)}</div>
      <span className="bn-cta">Book now {I.arrow}</span></Link>
  );
}
export function BannerThai({ S }) {
  const p = S.P('thailand-phuket-krabi');
  return (
    <Link className="banner bn-thai" href={PATHS.dest('thailand')}><img className="bnt-bg" src={img('thailand')} alt="Phi Phi Islands" decoding="async" />
      <div className="bnt-t"><small>Phuket · Krabi · Phi Phi Island · Group departures</small><h3><span className="y">Thailand</span> <span className="w">Group</span></h3><em>Trip</em></div>
      <div className="bnt-pics"><img src={img('snorkel')} alt="Snorkelling" decoding="async" /><img src={img('jetski')} alt="Jet ski" decoding="async" /></div>
      <span className="bn-cta y">From {p ? inr(p.price) : ''} · Book now {I.arrow}</span></Link>
  );
}
export function BannerCode() {
  return (
    <Link className="banner bn-code" href={VIEW_PATHS.deals}><div className="bnc-t"><small>Last-minute escape sale</small><h3>5% off departures<br />within 15 days</h3><p>Use code <span className="code">LASTMINUTE</span> at checkout</p></div>
      <div className="bnc-tiles">{['goa-beach', 'kerala-lake', 'manali', 'andaman'].map(i => <img key={i} src={img(i)} alt="" decoding="async" />)}</div><span className="bn-cta">See deals {I.arrow}</span></Link>
  );
}
/* plain offer banner: colour, title, line, price, small print, image */
export function OfferBanner({ href, bc, h, p, price, tc, im, alt }) {
  return (
    <Link className="banner" href={href} style={{ '--bc': bc, background: bc }}><div className="b-txt"><h3>{h}</h3><p>{p}</p><div className="from"><small>Starting<br />From</small><b>{inr(price)}*</b></div><span className="tc">{tc}</span></div><div className="b-img"><img src={img(im)} alt={alt} decoding="async" /></div></Link>
  );
}

/* ---------- trending destinations ---------- */
export function Trending({ S }) {
  const list = ['arunachal', 'ladakh', 'uttarakhand', 'maharashtra', 'andaman', 'kashmir'].map(S.D).filter(Boolean);
  return (
    <section className="sec-tight"><div className="wrap">
      <SecHead h="Trending Holiday Destinations" p="Where India is travelling this season." right={<RailNav id="r-trend" />} />
      <div className="rail" id="r-trend" style={{ '--cw': '230px' }}>{list.map(d => <TallDest key={d.id} d={d} />)}</div>
    </div></section>
  );
}

/* ---------- "India & Around Holiday" tab contents ---------- */
const IA_TABS = { North: ['kashmir', 'himachal', 'uttarakhand', 'uttar-pradesh', 'rajasthan', 'ladakh'], South: ['kerala', 'coorg-ooty', 'south-india', 'tamil-nadu', 'tirupati'], East: ['andaman', 'odisha', 'sikkim-darjeeling', 'arunachal'], West: ['goa', 'maharashtra', 'gujarat', 'madhya-pradesh'], Neighbours: ['nepal', 'bhutan', 'maldives'], International: ['thailand', 'bali', 'dubai', 'singapore-malaysia', 'vietnam', 'japan', 'europe', 'australia'] };
const IA_IMG = { kashmir: 'kashmir-snow', himachal: 'himachal-river', uttarakhand: 'rafting', 'uttar-pradesh': 'taj', ladakh: 'ladakh', rajasthan: 'rajasthan-camel', kerala: 'kerala-house', 'coorg-ooty': 'coorg', 'south-india': 'munnar', 'tamil-nadu': 'madurai', tirupati: 'tirupati', andaman: 'snorkel', odisha: 'puri', 'sikkim-darjeeling': 'darjeeling', arunachal: 'northeast', goa: 'goa-palms', maharashtra: 'maharashtra', gujarat: 'dwarka-ghat', 'madhya-pradesh': 'ujjain', nepal: 'trek', bhutan: 'bhutan', maldives: 'maldives', thailand: 'thailand', dubai: 'dubai' };
export const iaPanes = S => Object.keys(IA_TABS).map(k => [k, IA_TABS[k].map(S.D).filter(Boolean).map(d => (
  <Link key={d.id} className="ia-card" href={PATHS.dest(d.id)}><img loading="lazy" src={img(IA_IMG[d.id] || d.img)} alt={d.name} decoding="async" /><span className="ia-t"><b>{dname(d)}</b><small>Starting at {inr(d.price)}</small></span><span className="go">{I.ne}</span></Link>
))]);

/* ---------- solo, couple or friends ---------- */
export function TripsForAll() {
  const V = VIEW_PATHS;
  const c = [
    ['Solo', 'solo', 'group-lake', 'Travel alone, never lonely. Verified travel partners, women-only departures and 24×7 SOS support.', V.partner, 'Find a travel partner', [[PATHS.theme('women'), "Women's special"], [V['partner-safety'], 'Safety centre']]],
    ['Couples', 'couple', 'th-honeymoon', 'Private transfers, pool villas, candle-lit dinners and houseboats — honeymoons done right.', PATHS.theme('honeymoon'), 'Honeymoon packages', [[PATHS.dest('maldives'), 'Maldives'], [PATHS.dest('kerala'), 'Kerala'], [PATHS.dest('bali'), 'Bali']]],
    ['Friends', 'friends', 'th-group', 'Group departures, backpacking circuits and treks with trip captains who know the way.', PATHS.theme('group'), 'Group trips', [[V.departures, 'Departure calendar'], [PATHS.theme('trek'), 'Treks'], [PATHS.pkg('spiti-backpack'), 'Spiti backpacking']]]];
  return (
    <section className="tfa"><div className="tfa-clouds" aria-hidden="true"></div><div className="wrap">
      <div className="tfa-h"><h2><span>Solo, couple or friends —</span> trips for everyone</h2><p>Most travellers come for the place and leave with new people. Pick your style and we plan the rest.</p></div>
      <div className="tfa-grid">{c.map(([t, k, im, d, href, cta, links]) => (
        <article key={k} className={`tfa-c ${k}`}><Link className="tfa-img" href={href}><img loading="lazy" src={img(im)} alt={`${t} trips`} decoding="async" /><span className="tfa-lab">{t}</span></Link>
          <div className="tfa-b"><p>{d}</p><div className="tfa-links">{links.map(([h, l]) => <Link key={h} href={h}>{l}</Link>)}</div><Link className="btn btn-o btn-sm" href={href}>{cta} {I.arrow}</Link></div></article>
      ))}</div>
    </div></section>
  );
}

/* ---------- travel partner band ---------- */
export function PartnerBand({ S }) {
  const V = VIEW_PATHS;
  return (
    <section className="sec-tight"><div className="wrap"><div className="tp-band">
      <div className="tpb-t"><span className="eyebrow" style={{ color: 'var(--sun)' }}>New · Travel Partner</span><h2>Don&apos;t travel alone. Find a verified travel partner.</h2><p>Match with travellers going to the same place, book the same trip, sit together, and choose shared or separate rooms. Pay for both, split 50/50 or book individually.</p>
        <div className="tpb-f"><span>{I.shield} 18+ &amp; ID-verified</span><span>{I.users} Mutual consent</span><span>{I.wallet} Pay your way</span><span>{I.headset} 24×7 SOS</span></div>
        <div className="btns"><Link className="btn btn-o" href={V.partner}>Find a travel partner</Link><Link className="btn btn-ghost tpb-g" href={V['partner-create']}>Create profile</Link></div></div>
      <div className="tpb-cards">{S.BUDDIES.slice(0, 4).map(b => { const d = S.D(b.trips[0][0]); return <Link key={b.id} className="tpb-c" href={PATHS.buddy(b.id)}><Avatar b={b} /><span><b>{b.name}, {b.age}</b><small>{d ? dname(d) : b.trips[0][0]} · {b.trips[0][1]}</small></span>{I.shield}</Link>; })}{S.CONFIG.demo ? <small className="tpb-s">Sample profiles for preview</small> : null}</div>
    </div></div></section>
  );
}

/* ---------- spiritual packages ---------- */
export function Spiritual({ S }) {
  const list = ['chardham-yatra', 'madurai-rameswaram', 'ayodhya-special', 'kashi-ayodhya', 'dwarka-somnath', 'tirupati-darshan'].map(S.P).filter(Boolean);
  return (
    <section className="sec-tight"><div className="wrap"><div className="spirit">
      <div><svg width="80" height="80" viewBox="0 0 64 64" fill="none"><path d="M32 6 10 30h44Z" fill="#fde2b8" stroke="#f47c20" strokeWidth="2.5" strokeLinejoin="round" /><text x="32" y="26" textAnchor="middle" fontSize="12" fontWeight="700" fill="#1463c7">ॐ</text><path d="M16 30v18M48 30v18M26 30v14M38 30v14M8 52h48" stroke="#d9251d" strokeWidth="3" strokeLinecap="round" /></svg>
        <h2>Spiritual Packages</h2><Link className="btn btn-o" href={PATHS.theme('spiritual')}>View All Packages</Link></div>
      <div className="rail" style={{ '--cw': '250px' }}>{list.map(p => { const h = PATHS.pkg(p.id); return <div key={p.id} className="sp-card"><Link className="p-img" href={h}><img loading="lazy" src={img(p.img)} alt={p.title} decoding="async" /><span className="badge">{p.n}N/{p.n + 1}D</span></Link><h4><Link href={h}>{p.title}</Link></h4><span className="muted">From {inr(p.price)}</span><Link className="link-arrow" href={h}>BOOK NOW {I.arrow}</Link></div>; })}</div>
    </div></div></section>
  );
}

/* ---------- long weekend getaways ---------- */
export function LongWeekendSection({ S }) {
  const cards = [['andaman-islands', 'snorkel', 'Andaman'], ['bali-honeymoon', 'bali-temple', 'Bali'], ['goa-getaway', 'jetski', 'Goa'], ['rishikesh-mussoorie', 'rafting', 'Rishikesh'], ['jaisalmer-desert', 'rajasthan-camel', 'Jaisalmer']];
  return (
    <section className="sec-tight"><div className="wrap"><div className="lw">
      <LongWeekend list={S.LONG_WEEKENDS} initial={nextLongWeekend(S.LONG_WEEKENDS, todayISO())} />
      <div className="rail" style={{ '--cw': '280px' }}>{cards.map(([id, im, n]) => { const p = S.P(id); if (!p) return null; return <div key={id} className="lw-card"><img loading="lazy" src={img(im)} alt={n} decoding="async" /><div><h4>{n}</h4><p>{p.n} Nights / {p.n + 1} Days</p><Link className="link-arrow" href={PATHS.pkg(id)}>Explore Now {I.arrow}</Link></div></div>; })}</div>
    </div></div></section>
  );
}

/* ---------- winter season ---------- */
export function Season({ S }) {
  const list = ['dwarka-somnath', 'paris-passion', 'bali-honeymoon', 'kashmir-winter', 'goa-getaway', 'kerala-backwaters'].map(S.P).filter(Boolean);
  return (
    <section className="sec-tight"><div className="wrap"><div className="season">
      <div className="s-intro"><h3>Feel the winter vibes with our exclusive holiday packages!</h3><p>From snow in Gulmarg to sunny beaches in Goa and festive city breaks in Europe, the cool months are the best time to travel. Your dream winter getaway awaits with TripPartner.</p><Link className="btn btn-b" href={VIEW_PATHS.packages} style={{ alignSelf: 'flex-start' }}>See all packages</Link></div>
      <div className="rail" style={{ '--cw': '280px' }}>{list.map(p => <Link key={p.id} className="ss-card" href={PATHS.pkg(p.id)}><img loading="lazy" src={img(p.img)} alt={p.title} decoding="async" /><h4>{p.title}</h4><div className="row"><span>{p.n + 1} Days</span><b>{inr(p.price)}</b></div></Link>)}</div>
    </div></div></section>
  );
}

/* ---------- recommended packages ---------- */
export function Recommended({ S }) {
  const list = ['bhutan-escape', 'japan-grand', 'singapore-malaysia-value', 'europe-best', 'dubai-delight', 'vietnam-classic'].map(S.P).filter(Boolean);
  return (
    <section className="sec sec-alt"><div className="wrap rec">
      <div><h2 style={{ fontSize: 'clamp(30px,3.4vw,44px)', fontWeight: '700', marginBottom: '30px' }}>Recommended Packages</h2>
        <p className="muted" style={{ fontSize: '16px', maxWidth: '30ch' }}>Our travel experts&apos; favourite international trips this season — tried, tested and fully customisable.</p></div></div>
      <div className="rail-wrap"><div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px' }}><RailNav id="r-rec" /></div><div className="rail" id="r-rec" style={{ '--cw': '300px' }}>{list.map(p => <Link key={p.id} className="rec-card" href={PATHS.pkg(p.id)}><img loading="lazy" src={img(p.img)} alt={p.title} decoding="async" /><h4>{p.title}</h4><div className="row"><span className="muted">Starting from</span><span className="price">{inr(p.price)}</span></div></Link>)}</div></div>
    </section>
  );
}

/* ---------- destinations we know best ---------- */
export function Specialists({ S }) {
  const list = ['thailand', 'bali', 'dubai', 'singapore-malaysia', 'maldives', 'vietnam', 'europe', 'australia', 'bhutan', 'japan'].map(S.D).filter(Boolean);
  return (
    <section className="sec-tight"><div className="wrap"><SecHead h="Destinations we know best" p="International specialists on our team plan these trips end to end" right={<RailNav id="r-spec" />} />
      <div className="rail" id="r-spec" style={{ '--cw': '300px' }}>{list.map((d, i) => <Link key={d.id} className="spec" href={PATHS.dest(d.id)}><img loading="lazy" src={img(d.img)} alt={d.name} decoding="async" /><span className={`spec-w s${i % 3}`}>{dname(d).replace(' & Malaysia', '')}</span><span className="spec-f">{d.tag} · from {inr(fromPrice(S, d))}</span></Link>)}</div></div></section>
  );
}

/* ---------- reasons ---------- */
export function Reasons() {
  const r = [
    ['solo', 'Solo is safe.', 'Verified travel partners, women-only departures and a 24×7 helpline. Pack your bag and go — no need to wait for anyone.'],
    ['flag', 'We are the green flag.', 'Hotels and drivers we have used before, licensed vehicles and trained guides for a safe, comfortable trip.'],
    ['captain', 'Trip captains who care.', 'On group departures a TripPartner captain travels with you — part guide, part friend, full-time problem solver.'],
    ['kebab', 'No kebab mein haddi.', 'No middlemen and no hidden fees. Itemised quotes, direct bookings and one expert for your whole trip.'],
    ['vibe', 'Vibe check comes first.', 'We plan group departures by travel style and age band where possible, so the group feels like your people.']];
  return <section className="reasons"><div className="wrap"><h2>Reasons to make us your travel bestie</h2><div className="rs-grid">{r.map(([k, t, d]) => <div key={k} className="rs"><span className="rs-i">{RI[k]}</span><div><h3>{t}</h3><p>{d}</p></div></div>)}</div></div></section>;
}

/* ---------- book with confidence ---------- */
export function Confidence() {
  const c = [
    [I.shield, '25%', 'Secure your spot by paying 25% of the trip'],
    [I.wallet, 'EMI', 'Easy EMI on select cards and payment partners'],
    [I.cal, 'Dates', 'Date-change help, subject to hotel & airline availability'],
    [I.check, 'Clear', 'Clear cancellation policy, shared before you pay'],
    [I.headset, '24×7', '24×7 support and trip captains on group departures']];
  return <section className="conf"><div className="wrap"><h2>Book with confidence</h2><div className="cf-grid">{c.map(([i, b, t]) => <div key={b} className="cf"><span className="cf-i">{i}<em>{b}</em></span><p>{t}</p></div>)}</div><p className="cf-tc"><Link href={PATHS.info('cancellation')}>Terms &amp; cancellation policy apply*</Link></p></div></section>;
}

/* ---------- how it works ---------- */
export function HowItWorks() {
  const steps = [['Tell us your plan', 'Use the Trip Planner, call or WhatsApp with dates, budget and who is travelling.'], ['Get a custom itinerary', 'Your trip expert sends an itemised quote, usually within one working day.'], ['Book with 25% advance', 'Confirm with a small advance; pay the balance 21 days before travel.'], ['Travel with support', 'Vouchers, driver details and a 24×7 contact for the whole trip.']];
  return (
    <section className="sec-tight"><div className="wrap">
      <SecHead h="How TripPartner works" p="" />
      <div className="how">{steps.map(([t, x], i) => <div key={t}><span className="how-n">{i + 1}</span><h4>{t}</h4><p>{x}</p></div>)}</div>
    </div></section>
  );
}

/* ---------- sample stories ---------- */
export function Stories({ S }) {
  const stories = [
    ['kashmir-paradise', 'kashmir-snow', 'A.', 'Our Kashmir trip was well organised. Houseboat, Gulmarg and Pahalgam all ran on time.', 5],
    ['singapore-malaysia-value', 'malaysia', 'R.', 'Hotels were central and transfers were always waiting. Genting was the highlight for the kids.', 5],
    ['sikkim-darjeeling-tour', 'darjeeling', 'K.', 'From hotel bookings to local transfers, everything was smooth and hassle-free.', 4],
    ['kerala-backwaters', 'kerala-house', 'P.', 'The itinerary suited our family and the houseboat stay was comfortable.', 5]];
  return (
    <section className="sec-tight"><div className="wrap">
      <SecHead h="Discover real experiences from travellers like you" p="" right={<span className="sample-note">Sample reviews for layout — replace with verified guest reviews</span>} />
      <div className="grid g2">{stories.map(([pid, im, ini, txt, st]) => { const p = S.P(pid); if (!p) return null; const d = S.D(p.dest); return (
        <div key={pid} className="story"><div className="st-t"><div className="q">“</div><p>{txt}</p><div className="who"><span className="av">{ini}</span><div><b>Guest name</b><small>{d ? dname(d) : p.dest} · Month Year</small></div><span className="stars">{'★'.repeat(st) + '☆'.repeat(5 - st)}</span></div></div>
          <div className="st-img"><img loading="lazy" src={img(im)} alt="" decoding="async" /><div><small>PACKAGE BOOKED</small><b>{p.title}</b><Link className="btn btn-o" href={PATHS.pkg(pid)}>EXPERIENCE IT YOURSELF {I.arrow}</Link></div></div></div>
      ); })}</div>
    </div></section>
  );
}

/* ---------- media spotlight + accreditations (config-driven; labelled samples in demo mode) ---------- */
export function Spotlight({ S }) {
  const C = S.CONFIG, demo = C.demo, P0 = C.press || [], A0 = C.accreditations || [];
  const press = P0.length ? P0 : (demo ? ['Newspaper', 'TV news', 'Travel magazine', 'Business daily', 'Digital media', 'Radio'].map(n => ({ name: n, sample: 1 })) : []);
  const acc = A0.length ? A0 : (demo ? ['Tourism ministry approval', 'Airline accreditation', 'Travel association', 'Tourism board specialist', 'Hotel partner', 'Insurance partner'].map(n => ({ name: n, sample: 1 })) : []);
  if (!press.length && !acc.length) return null;
  const tile = (x, i) => x.logo
    ? (x.url ? <a key={i} className="pr" href={x.url} target="_blank" rel="noopener"><img src={x.logo} alt={x.name} decoding="async" /></a> : <Link key={i} className="pr" href="/"><img src={x.logo} alt={x.name} decoding="async" /></Link>)
    : <span key={i} className={`pr ${x.sample ? 'smp' : ''}`}>{x.name}</span>;
  return (
    <>
      {press.length ? <section className="press"><div className="wrap"><h2>Media spotlight</h2>{demo && !P0.length ? <p className="smp-note">Sample slots — add your real press mentions in CONFIG.press</p> : null}<div className="marq"><div className="marq-t">{press.concat(press).map(tile)}</div></div></div></section> : null}
      {acc.length ? <section className="accr"><div className="wrap"><h2>Partnered with the best in the industry</h2>{demo && !A0.length ? <p className="smp-note dark">Sample slots — add only accreditations and partners you actually hold, with permission to show their logos</p> : null}<div className="ac-grid">{acc.map((x, i) => x.logo ? <span key={i} className="ac"><img src={x.logo} alt={x.name} decoding="async" /></span> : <span key={i} className={`ac ${x.sample ? 'smp' : ''}`}>{I.shield}<b>{x.name}</b></span>)}</div></div></section> : null}
    </>
  );
}

/* ---------- travel guides ---------- */
export function Guides({ S }) {
  return (
    <section className="sec-tight"><div className="wrap">
      <SecHead h="Travel Guides" p="Tips from our travel desk before you pack" right={<Link className="btn btn-ghost" href={VIEW_PATHS.guides}>All guides {I.arrow}</Link>} />
      <div className="grid g3">{S.GUIDES.slice(0, 3).map(g => <GuideCard key={g.id} g={g} />)}</div>
    </div></section>
  );
}

/* ---------- call to action ---------- */
export function CtaBand({ S }) {
  return (
    <section className="sec-tight"><div className="wrap"><div className="cta-band"><div><h3>Not sure where to go?</h3><p>Tell us your budget, dates and who&apos;s travelling. We&apos;ll send 2–3 options within a working day.</p></div><div className="btns"><PlanButton className="btn btn-o">{I.plan} Plan My Trip</PlanButton><a className="btn btn-wa" href={waLink(S.CONFIG, 'Hi TripPartner, please help me plan a holiday.')} target="_blank" rel="noopener">{I.wa} WhatsApp us</a></div></div></div></section>
  );
}

/* ---------- published traveller reviews (original api.js apiReviews) ---------- */
export function Reviews({ S }) {
  const rv = (S.reviews || []).slice(0, 6); if (!rv.length) return null;
  return (
    <section className="sec" id="tp-rv"><div className="wrap"><div className="tp-rvh"><span className="eyebrow">Traveller reviews</span><h2>What our travellers say</h2></div>
      <div className="grid g3">{rv.map((r, i) => { const n = Math.max(0, Math.min(5, +r.rating || 0)); return <figure key={r.id || i} className="box tp-rv"><div className="tp-stars" aria-label={`${n} out of 5`}>{'★'.repeat(n)}<span>{'★'.repeat(5 - n)}</span></div><blockquote>{r.text}</blockquote><figcaption><b>{r.name}</b>{r.city ? ` · ${r.city}` : ''}{r.trip ? <small>{r.trip}</small> : null}</figcaption></figure>; })}</div></div></section>
  );
}
