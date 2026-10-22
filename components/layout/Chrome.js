/* Drawer (mobile menu) and footer — server components (data-driven markup = original drawer()/footer()). */
import Link from 'next/link';
import { I, withProps } from '@/components/icons';
import { dname, waLink } from '@/lib/format';
import { PATHS, VIEW_PATHS as V } from '@/lib/routes';
import { DrawerShell, DrawerCloseButton, ThemeDrawerButton, DrawerAcc, FooterCols, LoginButton } from './ChromeClient';
import { PlanButton } from '@/components/ui/buttons';

export function Drawer({ S }) {
  const R = S.regionList;
  const li = arr => arr.map(d => <Link key={d.id} href={PATHS.dest(d.id)}>{dname(d)}</Link>);
  const P = V.partner;
  return (
    <DrawerShell>
      <div className="d-head"><img src="/img/logo-new-dark.png" alt="TripPartner" /><DrawerCloseButton /></div>
      <Link className="d-link" href="/">Home</Link>
      <DrawerAcc title="India Holidays"><h6>North</h6>{li(R('North'))}<h6>South</h6>{li(R('South'))}<h6>East &amp; North East</h6>{li([...R('East'), ...R('North East')])}<h6>West</h6>{li(R('West'))}</DrawerAcc>
      <DrawerAcc title="International">{li(S.DEST.filter(d => d.type === 'intl'))}</DrawerAcc>
      <DrawerAcc title="Holiday Themes">{S.THEMES.map(t => <Link key={t.id} href={PATHS.theme(t.id)}>{t.name}</Link>)}</DrawerAcc>
      <DrawerAcc title={<>Travel Partner <span className="new-pill">NEW</span></>}>
        <Link href={P}>Find a travel partner</Link><Link href={`${P}?g=Female`}>Women travellers</Link><Link href={`${P}?g=Male`}>Men travellers</Link><Link href={`${P}?women=1`}>Women-only circle</Link><Link href={`${P}?match=1`}>Smart match quiz</Link>
        <Link href={V['partner-create']}>Create partner profile</Link><Link href={`${V['partner-create']}?verify=1`}>Upload photo &amp; verify ID</Link><Link href={V['partner-book']}>Book a trip together</Link><Link href={V['partner-requests']}>My requests &amp; bookings</Link><Link href={`${V['partner-requests']}?tab=fav`}>Shortlisted partners</Link><Link href={V['partner-safety']}>Safety centre</Link>
      </DrawerAcc>
      <DrawerAcc title="Pilgrimage">{S.PKG.filter(p => p.themes.includes('spiritual')).map(p => <Link key={p.id} href={PATHS.pkg(p.id)}>{p.title}</Link>)}</DrawerAcc>
      <DrawerAcc title="Services">{S.SERVICES.map(s => <Link key={s.id} href={PATHS.service(s.id)}>{s.name}</Link>)}</DrawerAcc>
      <Link className="d-link" href={V.visa}>Visa</Link><Link className="d-link" href={V.deals} style={{ color: 'var(--red)' }}>Deals</Link><Link className="d-link" href={V.places}>Explore India A–Z</Link><Link className="d-link" href={V['christmas-new-year']} style={{ color: '#c81e1e' }}>Christmas &amp; New Year packages</Link><Link className="d-link" href={V.weekend}>Weekend getaways from Delhi</Link><Link className="d-link" href={V.videos}>TripPartner TV (videos)</Link><Link className="d-link" href={V.departures}>Group Departures</Link><Link className="d-link" href={V.guides}>Travel Guides</Link><Link className="d-link" href={V.account}>My Trips</Link><Link className="d-link" href={V.compare}>Compare packages</Link><ThemeDrawerButton /><Link className="d-link" href={V.wishlist}>Wishlist</Link><Link className="d-link" href={V.about}>About</Link><Link className="d-link" href={V.contact}>Contact</Link>
      <div style={{ display: 'grid', gap: '10px', marginTop: '18px' }}><PlanButton className="btn btn-o">Plan My Trip</PlanButton><LoginButton className="btn btn-ghost">Login / Create account</LoginButton></div>
    </DrawerShell>
  );
}
export function Footer({ S }) {
  const C = S.CONFIG;
  const top = S.DEST.filter(d => d.type === 'india').slice(0, 8), intl = S.DEST.filter(d => d.type === 'intl').slice(0, 8);
  const sep = arr => arr.flatMap((x, i) => (i ? [<span key={'s' + i}>·</span>, x] : [x]));
  return (
    <>
      <div className="foot-cta"><div className="wrap">
        <div className="fc">{I.phone}<div><small>Talk to a travel expert</small><b>{C.phone}</b></div></div>
        <div className="fc">{I.mail}<div><small>Write to us</small><b>{C.email}</b></div></div>
        <div className="fc">{I.clock}<div><small>Working hours</small><b>{C.hours}</b></div></div>
        <a className="btn btn-wa" href={waLink(C, 'Hi TripPartner, I want to plan a trip.')} target="_blank" rel="noopener">{I.wa} Get deals on WhatsApp</a></div></div>
      <div className="foot-main"><div className="wrap">
        <div className="foot-brand"><img src="/img/logo-new-dark.png" alt="TripPartner" /><p>TripPartner plans holidays, pilgrimages and group tours across India and abroad, with one travel expert looking after your trip from enquiry to return.</p>
          <p style={{ marginTop: '12px' }}>{withProps(I.pin, { width: '15', height: '15', style: { verticalAlign: '-2px', marginRight: '6px' } })}{C.address}</p>
          <div className="socials"><a href={C.instagram || '/'} aria-label="Instagram">{I.ig}</a><a href="/" aria-label="Facebook">{I.fb}</a><a href={C.youtube || '/'} aria-label="YouTube">{I.yt}</a><a href="/" aria-label="LinkedIn">{I.li}</a></div></div>
        <FooterCols>
          <details className="fcol" open><summary><h6>India Holidays</h6></summary><ul>{top.map(d => <li key={d.id}><Link href={PATHS.dest(d.id)}>{dname(d)} tour packages</Link></li>)}<li><Link href={V.places}><b>All {S.PLACES.length}+ places in India</b></Link></li></ul></details>
          <details className="fcol" open><summary><h6>International</h6></summary><ul>{intl.map(d => <li key={d.id}><Link href={PATHS.dest(d.id)}>{dname(d)} packages</Link></li>)}</ul></details>
          <details className="fcol" open><summary><h6>Holiday Themes</h6></summary><ul>{S.THEMES.slice(0, 8).map(t => <li key={t.id}><Link href={PATHS.theme(t.id)}>{t.name}</Link></li>)}</ul></details>
          <details className="fcol" open><summary><h6>Company</h6></summary><ul><li><Link href={V.about}>About us</Link></li><li><Link href={V.contact}>Contact us</Link></li><li><Link href={V.services}>Our services</Link></li><li><Link href={V.visa}>Visa information</Link></li><li><Link href={V.deals}>Deals &amp; offers</Link></li><li><Link href={V.partner}>Find a travel partner</Link></li><li><Link href={V.departures}>Group departures</Link></li><li><Link href={V.guides}>Travel guides</Link></li><li><Link href={V['christmas-new-year']}>Christmas &amp; New Year</Link></li><li><Link href={V.weekend}>Weekend getaways from Delhi</Link></li><li><Link href={V.videos}>TripPartner TV</Link></li><li><Link href={V.compare}>Compare packages</Link></li><li><Link href={PATHS.info('faq')}>FAQs</Link></li><li><Link href={PATHS.info('terms')}>Terms &amp; conditions</Link></li><li><Link href={PATHS.info('privacy')}>Privacy policy</Link></li><li><Link href={PATHS.info('cancellation')}>Cancellation &amp; refunds</Link></li></ul></details>
        </FooterCols>
      </div></div>
      <div className="foot-links"><div className="wrap"><b>Explore India:</b>{sep(S.STATES.map(s => <Link key={s.s} href={PATHS.state(s.s)}>{s.n}</Link>))}</div><div className="wrap"><b>Trip types:</b>{sep(Object.keys(S.CATS).map(k => <Link key={k} href={PATHS.cat(S.CATS[k][0])}>{S.CATS[k][1]}</Link>))}</div><div className="wrap"><b>Popular searches:</b>{sep(S.PKG.slice(0, 14).map(p => <Link key={p.id} href={PATHS.pkg(p.id)}>{p.title}</Link>))}</div></div>
      <div className="foot-bot"><div className="wrap"><span>© {new Date().getFullYear()} TripPartner · {C.domain} · All rights reserved. · <a href="/admin/" style={{ textDecoration: 'underline' }}>Staff dashboard</a></span><div className="pay"><span>UPI</span><span>VISA</span><span>MASTERCARD</span><span>RUPAY</span><span>NET BANKING</span><span>EMI</span></div></div></div>
    </>
  );
}
