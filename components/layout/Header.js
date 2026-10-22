/* Site header: top bar, brand bar (search, account, Plan My Trip) and the main navigation with mega menus.
   Server component — interactive parts are client islands from HeaderClient.js. Markup = original header(). */
import Link from 'next/link';
import { I, TI } from '@/components/icons';
import { img, inr, dname, telHref } from '@/lib/format';
import { PATHS, VIEW_PATHS } from '@/lib/routes';
import { nextMonths } from '@/lib/months';
import { PlanButton, OpenButton } from '@/components/ui/buttons';
import { ThemeButton, HeaderSearch, AccountMenu, ExpertButton, Burger, NavItem, MegaTabs, PartnerMegaForm, WishlistCount } from './HeaderClient';

const V = VIEW_PATHS;

const rdPkg = p => <Link key={p.id} className="rd" href={PATHS.pkg(p.id)}><img loading="lazy" src={img(p.img)} alt="" /><span><b>{p.title}</b><small>{p.n}N/{p.n + 1}D · from {inr(p.price)}</small></span></Link>;
const RdIco = ({ href, ico, t, s }) => <Link className="rd rd-i" href={href}><span className="rd-ic">{ico}</span><span><b>{t}</b><small>{s}</small></span></Link>;

function megaTabsData(key, groups) {
  return groups.map(([label, list]) => ({ label, count: list.length, from: list.length ? Math.min(...list.map(d => d.price)) : 0, items: list.map(d => ({ id: d.id, name: dname(d), tag: d.tag, price: d.price, img: d.img })) }));
}

function MegaIndia({ S }) {
  const R = S.regionList;
  const groups = megaTabsData('in', [['North India', R('North')], ['South India', R('South')], ['East & North East', [...R('East'), ...R('North East')]], ['West India', R('West')]]);
  const k = S.D('kashmir');
  return <MegaTabs id="in" groups={groups} allHref={V.india} allLabel="All India holidays" placesCount={S.PLACES.length}
    promo={k ? <Link className="mega-promo" href={PATHS.dest('kashmir')}><img src={img('kashmir-snow')} alt="" /><small>This winter</small><b>Kashmir snow holidays from {inr(k.price)}</b><span className="mp-cta">Explore {I.arrow}</span></Link> : null} />;
}
function MegaIntl({ S }) {
  const by = r => S.DEST.filter(d => d.type === 'intl' && r.includes(d.region)); const asia = by(['Asia']);
  const groups = megaTabsData('intl', [['South-East Asia', asia.filter(d => ['thailand', 'bali', 'singapore-malaysia', 'vietnam'].includes(d.id))], ['Himalaya, South & East Asia', asia.filter(d => ['bhutan', 'nepal', 'sri-lanka', 'japan'].includes(d.id))],
    ['Middle East, Central Asia & Islands', [...by(['Middle East']), ...by(['Central Asia']), ...by(['Islands'])]], ['Europe, Africa & Oceania', by(['Europe', 'Africa', 'Oceania'])]]);
  const b = S.D('bali');
  return <MegaTabs id="intl" groups={groups} allHref={V.international} allLabel="All international holidays"
    promo={b ? <Link className="mega-promo" href={PATHS.dest('bali')}><img src={img('bali-temple')} alt="" /><small>Honeymoon special</small><b>Bali pool-villa holidays from {inr(b.price)}</b><span className="mp-cta">Explore {I.arrow}</span></Link> : null} />;
}
function MegaThemes({ S }) {
  return <div className="mega"><div className="wrap mt-grid">{S.THEMES.map(t => { const n = S.PKG.filter(p => p.themes.includes(t.id)).length; return <Link key={t.id} className="mt-tile" href={PATHS.theme(t.id)}><img loading="lazy" src={img(t.img)} alt="" /><span className="mt-ico">{TI[t.icon]}</span><span className="mt-t"><b>{t.name}</b><small>{n} package{n === 1 ? '' : 's'}</small></span></Link>; })}</div></div>;
}
function MegaPartner({ S }) {
  const B = S.BUDDIES, dCount = id => B.filter(b => b.trips.some(t => t[0] === id)).length;
  const topD = [...new Set(B.flatMap(b => b.trips.map(t => t[0])))].map(id => [id, dCount(id)]).sort((a, b) => b[1] - a[1]).slice(0, 8);
  const nW = B.filter(b => b.g === 'Female').length, nM = B.filter(b => b.g === 'Male').length;
  const P = V.partner, fixed = ['kashmir', 'goa', 'chardham', 'bali'];
  const dl = id => { const d = S.D(id); return d ? <li key={id}><Link href={`${P}?d=${id}`}>Partners for {dname(d)} <em>{dCount(id)}</em></Link></li> : null; };
  return (
    <div className="mega mega-p2"><div className="wrap">
      <PartnerMegaForm dests={S.DEST.map(d => ({ id: d.id, name: dname(d) }))} months={nextMonths()} />
      <div className="mega-partner mp2-cols">
        <div><h5>Find a partner</h5><ul>
          <li><Link href={P}>Browse travel partners</Link></li>
          <li><Link href={`${P}?g=Female`}>Women travellers <em>{nW}</em></Link></li>
          <li><Link href={`${P}?g=Male`}>Men travellers <em>{nM}</em></Link></li>
          <li><Link href={`${P}?women=1`}>Women-only circle</Link></li>
          <li><Link href={`${P}?mode=month`}>Search by travel month</Link></li>
          <li><Link href={`${P}?mode=interest`}>Search by interest</Link></li>
          <li><Link href={`${P}?match=1`}>Smart match quiz</Link></li></ul></div>
        <div><h5>Popular partner trips</h5><ul className="mp2-dest">
          {fixed.map(dl)}
          {topD.filter(([id]) => !fixed.includes(id)).slice(0, 4).map(([id]) => dl(id))}</ul></div>
        <div><h5>Plan together</h5><ul>
          <li><Link href={V['partner-create']}>Create partner profile</Link></li>
          <li><Link href={`${V['partner-create']}?verify=1`}>Upload photo &amp; verify ID</Link></li>
          <li><Link href={P}>Send a partner request</Link></li>
          <li><Link href={V['partner-book']}>Book a trip together</Link></li>
          <li><Link href={V['partner-requests']}>My requests &amp; bookings</Link></li>
          <li><Link href={`${V['partner-requests']}?tab=fav`}>Shortlisted partners</Link></li>
          <li><Link href={V['partner-safety']}>Safety centre</Link></li></ul></div>
        <div><h5>Pay your way</h5><ul className="opt-list">
          <li><Link href={V['partner-book']}>{I.wallet}<span><b>Pay for both</b><small>One traveller books &amp; pays</small></span></Link></li>
          <li><Link href={V['partner-book']}>{I.users}<span><b>Split 50 / 50</b><small>Each pays half</small></span></Link></li>
          <li><Link href={V['partner-book']}>{I.passport}<span><b>Book individually</b><small>Separate bookings, same trip</small></span></Link></li></ul>
          <h5 style={{ marginTop: '14px' }}>Travel &amp; stay</h5><ul className="opt-list">
            <li><Link href={V['partner-book']}>{I.plane}<span><b>Seats together</b><small>Flight, train &amp; cab</small></span></Link></li>
            <li><Link href={V['partner-book']}>{I.bed}<span><b>Shared room</b><small>Only if both agree</small></span></Link></li>
            <li><Link href={V['partner-book']}>{I.shield}<span><b>Separate rooms</b><small>Always available</small></span></Link></li></ul></div>
        <div className="mp2-promo"><img src={img('group-lake')} alt="" /><div><small>Verified · 18+ · Safety first</small><b>Don&apos;t travel alone. Find a verified partner.</b>
          <ul><li>{I.shield}Government ID + selfie check</li><li>{I.users}Requests need both to agree</li><li>{I.headset}24×7 SOS on every trip</li></ul>
          <Link className="btn btn-o btn-sm" href={V['partner-create']}>Create profile</Link></div></div>
      </div></div></div>
  );
}
const PILGRIM = ['chardham-yatra', 'kedarnath-heli', 'kashi-ayodhya', 'ayodhya-special', 'dwarka-somnath', 'ujjain-omkareshwar', 'tirupati-darshan', 'puri-konark', 'madurai-rameswaram', 'mumbai-shirdi'];
const DropPilgrim = ({ S }) => <div className="drop drop-rich two">{PILGRIM.map(S.P).filter(Boolean).map(rdPkg)}<Link className="rd-foot" href={PATHS.theme('spiritual')}>All pilgrimage packages {I.arrow}</Link></div>;
const DropGroup = ({ S }) => <div className="drop drop-rich"><RdIco href={V.departures} ico={I.cal} t="Upcoming departures calendar" s="Fixed dates with a tour manager" />{S.PKG.filter(p => p.themes.includes('group')).map(rdPkg)}<Link className="rd-foot" href={PATHS.theme('group')}>All group tours {I.arrow}</Link></div>;
const DropVisa = () => <div className="drop drop-rich"><RdIco href={V.visa} ico={I.globe} t="Visa-free countries" s="Thailand, Malaysia, Mauritius, Nepal, Bhutan" /><RdIco href={V.visa} ico={I.passport} t="Visa on arrival & e-visa" s="Maldives, Bali, Vietnam, UAE, Bahrain" /><RdIco href={PATHS.service('visa-services')} ico={I.shield} t="Visa assistance service" s="Checklist, forms & appointments" /><RdIco href={PATHS.guide('visa-free-countries')} ico={I.star} t="Visa guide for Indians" s="Read before you book flights" /></div>;
const DropServices = ({ S }) => <div className="drop drop-rich two">{S.SERVICES.map(s => <RdIco key={s.id} href={PATHS.service(s.id)} ico={I[s.icon]} t={s.name} s={s.desc.split(/[,.]/)[0]} />)}</div>;
const DropDeals = ({ S }) => <div className="drop drop-rich"><RdIco href={V['christmas-new-year']} ico={TI.festive} t="Christmas & New Year 2026–27" s={`${S.FESTIVE.length} festive departures · early-bird prices`} />{S.WEEKEND.length ? <RdIco href={V.weekend} ico={I.car} t="Weekend getaways from Delhi" s={`${S.WEEKEND.length} trips from ${inr(Math.min(...S.WEEKEND.map(p => p.price)))}`} /> : null}<RdIco href={V.deals} ico={I.wallet} t="Last-minute sale" s="5% off with code LASTMINUTE" /><RdIco href={V.departures} ico={I.cal} t="Group departures" s="Fixed dates with a trip captain" /></div>;
const DropAbout = () => <div className="drop drop-rich"><RdIco href={V.about} ico={I.star} t="About TripPartner" s="Our story, mission & values" /><RdIco href={V.videos} ico={I.star} t="TripPartner TV" s="Travel reels & films" /><RdIco href={V.guides} ico={I.globe} t="Travel guides" s="Seasons, visas & packing tips" /><RdIco href={V.departures} ico={I.cal} t="Group departures" s="Fixed-date tours" /><RdIco href={PATHS.info('faq')} ico={I.headset} t="FAQs" s="Booking, payments & changes" /><RdIco href={PATHS.info('cancellation')} ico={I.shield} t="Cancellation policy" s="Charges & refunds" /><RdIco href={V.contact} ico={I.phone} t="Contact us" s="Call, WhatsApp or email" /></div>;

export default function Header({ S }) {
  const C = S.CONFIG;
  return (
    <>
      <div className="topbar tb3"><div className="wrap"><div className="tb-l"><a href={telHref(C.phone)}>{I.phone}{C.phone}</a><a href={`mailto:${C.email}`}>{I.mail}{C.email}</a><span className="tb-hours">{I.clock}{C.hours}</span></div>
        <div className="tb-r"><Link className="tb-chip tbc-fx" href={V['christmas-new-year']}>{TI.festive}<b>Christmas &amp; New Year</b></Link><Link className="tb-chip tbc-wk" href={V.weekend}>{I.car}<b>Weekend trips from Delhi</b></Link>
          <OpenButton feature="quickfind" className="tb-qf" aria-label="Quick find (Ctrl K)">{I.search}<span>Quick find</span><kbd>Ctrl K</kbd></OpenButton><span className="tb-sep"></span><ThemeButton className="tb-theme" />
          <Link href={V.compare}>Compare</Link><Link href={V.account}>My Trips</Link><Link href={V.about}>About</Link><Link href={PATHS.info('faq')}>FAQs</Link><Link href={V.contact}>Contact</Link><Link href={PATHS.service('corporate')}>Corporate travel</Link></div></div></div>
      <div className="brandbar bb2 bb3"><div className="wrap">
        <Link className="logo" href="/" aria-label="TripPartner home"><img className="lg-l" src="/img/logo-new.png" alt="TripPartner — Explore · Plan · Travel · Together" width="212" height="56" /><img className="lg-d" src="/img/logo-new-dark.png" alt="" width="212" height="56" /></Link>
        <HeaderSearch hints={S.HS_HINTS} />
        <div className="bb-actions bb2-act">
          <ExpertButton CONFIG={C} />
          <Link className="bb-ico" href={V.wishlist} aria-label="Wishlist"><span className="bb-ring">{I.heart}</span><WishlistCount /><em>Wishlist</em></Link>
          <AccountMenu />
          <PlanButton className="btn btn-o bb-plan">{I.plan} Plan My Trip</PlanButton>
        </div>
        <OpenButton feature="search" className="m-ico" aria-label="Search">{I.search}</OpenButton><Link className="m-ico" href={V.wishlist} aria-label="Wishlist">{I.heart}</Link>
        <Burger />
      </div></div>
      <nav className="navbar nv3" aria-label="Main"><div className="wrap">
        <NavItem href={V.india} icon={I.pin} label="India Holidays" chev><MegaIndia S={S} /></NavItem>
        <NavItem href={V.international} icon={I.globe} label="International" chev><MegaIntl S={S} /></NavItem>
        <NavItem href={V.themes} icon={I.umbrella} label="Themes" chev><MegaThemes S={S} /></NavItem>
        <NavItem href={V.partner} icon={I.users} label="Travel Partner" chev linkClass="nav-new"><MegaPartner S={S} /></NavItem>
        <NavItem rel href={PATHS.theme('spiritual')} icon={I.temple} label="Pilgrimage" chev><DropPilgrim S={S} /></NavItem>
        <NavItem rel href={PATHS.theme('group')} icon={I.cal} label="Group Tours" chev><DropGroup S={S} /></NavItem>
        <NavItem rel href={V.visa} icon={I.passport} label="Visa" chev><DropVisa /></NavItem>
        <NavItem rel href={V.services} icon={I.brief} label="Services" chev><DropServices S={S} /></NavItem>
        <NavItem rel href={V.deals} icon={I.wallet} label="Deals" linkClass="nav-hot"><DropDeals S={S} /></NavItem>
        <div className="nav-spacer"></div>
        <NavItem rel href={V.about} icon={I.star} label="About" chev><DropAbout /></NavItem>
      </div></nav>
      <datalist id="dlist">{S.DEST.map(d => <option key={'d' + d.id} value={d.name} />)}{S.THEMES.map(t => <option key={'t' + t.id} value={t.name} />)}</datalist>
    </>
  );
}
