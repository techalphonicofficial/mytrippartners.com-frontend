/* About us (original aboutPage, app.js) */
import Link from 'next/link';
import { getSite } from '@/lib/site';
import { viewMetadata } from '@/lib/seo';
import { VIEW_PATHS } from '@/lib/routes';
import { PlanButton } from '@/components/ui/buttons';
import { Gal } from '@/components/editorial/Hero';

export async function generateMetadata() { const S = await getSite(); return viewMetadata(S, VIEW_PATHS.about, 'About'); }

const VALUES = [['Transparency', 'Itemised quotes with no hidden charges.'], ['Safety first', 'Verified hotels, licensed vehicles and experienced drivers.'], ['Care', '24×7 on-trip support and senior-friendly planning.'], ['Local knowledge', 'Itineraries built from on-ground experience.']];

export default async function AboutPage() {
  const S = await getSite();
  const stats = [[S.DEST.length + '+', 'Destinations'], [S.PKG.length + '+', 'Ready itineraries'], [S.THEMES.length, 'Holiday themes']];
  return (
    <>
      <section className="page-hero"><div className="wrap"><div><nav className="crumbs"><Link href="/">Home</Link><span>/</span><span>About us</span></nav><span className="script" style={{ color: 'var(--sun)' }}>Explore · Plan · Travel · Together</span><h1 style={{ marginTop: '8px' }}>About TripPartner</h1><p className="lead">TripPartner is a tour and travel company that plans holidays, pilgrimages, group tours and corporate trips across India and abroad. Our promise is in our name: we travel with you as a partner, from the first call to the last transfer.</p></div><Gal imgs={['group-lake', 'th-group', 'spiti']} /></div></section>
      <section className="sec"><div className="wrap" style={{ display: 'grid', gap: '26px' }}>
        <div className="grid g2"><div className="box prose"><h2>Our mission</h2><p>Make well-planned travel simple and fairly priced for every Indian family, couple and group, with clear quotes and one accountable expert for every trip.</p></div><div className="box prose"><h2>Our vision</h2><p>Become India&apos;s most trusted travel partner, known for honest advice, safe journeys and service that continues after the booking.</p></div></div>
        <div className="box"><h2>What we stand for</h2><div className="grid g4">{VALUES.map(([t, x]) => <div key={t}><h4 style={{ marginBottom: '6px' }}>{t}</h4><p className="muted" style={{ fontSize: '14px' }}>{x}</p></div>)}</div></div>
        <div className="grid g3">{stats.map(([n, l]) => <div key={l} className="box" style={{ textAlign: 'center' }}><b style={{ font: '900 48px var(--f-display)', color: 'var(--orange)' }}>{n}</b><p className="muted">{l}</p></div>)}</div>
        <div className="cta-band"><div><h3>Let&apos;s plan your next trip</h3><p>Holidays, yatras, group tours and corporate travel.</p></div><div className="btns"><PlanButton className="btn btn-o">Plan My Trip</PlanButton><Link className="btn btn-wa" href={VIEW_PATHS.contact}>Contact us</Link></div></div>
      </div></section>
    </>
  );
}
