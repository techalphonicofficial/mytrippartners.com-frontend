/* Services index (original servicesIndex, app.js) */
import Link from 'next/link';
import { getSite } from '@/lib/site';
import { viewMetadata } from '@/lib/seo';
import { PATHS, VIEW_PATHS } from '@/lib/routes';
import { I, withProps } from '@/components/icons';
import { Gal } from '@/components/editorial/Hero';

export async function generateMetadata() { const S = await getSite(); return viewMetadata(S, VIEW_PATHS.services, 'Services'); }

export default async function ServicesPage() {
  const S = await getSite();
  return (
    <>
      <section className="page-hero"><div className="wrap"><div><nav className="crumbs"><Link href="/">Home</Link><span>/</span><span>Services</span></nav><h1>Everything for your trip, in one place</h1><p className="lead">Holidays, tickets, hotels, cabs, visas and insurance — booked and supported by one team.</p></div><Gal imgs={['europe', 'th-group', 'dubai']} /></div></section>
      <section className="sec"><div className="wrap grid g4">{S.SERVICES.map(s => <Link key={s.id} className="box" href={PATHS.service(s.id)} style={{ display: 'grid', gap: '10px', alignContent: 'start' }}><span style={{ color: 'var(--orange)' }}>{withProps(I[s.icon], { width: '40', height: '40' })}</span><h3 style={{ margin: '0' }}>{s.name}</h3><p className="muted" style={{ fontSize: '14px' }}>{s.desc}</p><span className="link-arrow">Know more {I.arrow}</span></Link>)}</div></section>
    </>
  );
}
