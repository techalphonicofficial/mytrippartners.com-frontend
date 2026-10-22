/* Service detail (original servicePage, app.js) */
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getSite } from '@/lib/site';
import { viewMetadata } from '@/lib/seo';
import { PATHS, VIEW_PATHS } from '@/lib/routes';
import { I, withProps } from '@/components/icons';
import { EnquiryBox, HelpBox } from '@/components/ui/boxes';

export const dynamicParams = true;
export async function generateStaticParams() { return []; }
const find = (S, id) => S.SERVICES.find(x => x.id === id);
export async function generateMetadata({ params }) { const { id } = await params; const S = await getSite(); const s = find(S, id); return s ? viewMetadata(S, PATHS.service(id), s.name) : {}; }

const STEPS = [['Share your plan', 'Tell us dates, travellers and budget by form, call or WhatsApp.'], ['Get your quote', 'Receive an itemised quote, usually within one working day.'], ['Confirm & travel', 'Pay the advance, get vouchers, and travel with on-trip support.']];

export default async function ServicePage({ params }) {
  const { id } = await params;
  const S = await getSite();
  const s = find(S, id); if (!s) notFound();
  return (
    <>
      <section className="page-hero"><div className="wrap"><div><nav className="crumbs"><Link href="/">Home</Link><span>/</span><Link href={VIEW_PATHS.services}>Services</Link><span>/</span><span>{s.name}</span></nav><span className="eyebrow">TripPartner services</span><h1>{s.name}</h1><p className="lead">{s.desc}</p></div><div style={{ display: 'grid', placeItems: 'center' }}><div style={{ width: '180px', height: '180px', borderRadius: '40px', background: 'rgba(255,255,255,.07)', display: 'grid', placeItems: 'center', color: 'var(--orange)' }}>{withProps(I[s.icon], { width: '90', height: '90' })}</div></div></div></section>
      <section className="sec"><div className="wrap layout"><div style={{ display: 'grid', gap: '22px' }}><div className="box"><h2>What we handle</h2><ul className="checks two">{(S.SVC_DETAIL[id] || []).map((x, i) => <li key={i}>{I.check}<span>{x}</span></li>)}</ul></div>
        <div className="box"><h2>How it works</h2><div className="grid g3">{STEPS.map(([t, x], i) => <div key={t}><b style={{ font: '800 34px var(--f-display)', color: 'var(--orange)' }}>{i + 1}</b><h4 style={{ margin: '6px 0' }}>{t}</h4><p className="muted" style={{ fontSize: '14px' }}>{x}</p></div>)}</div></div>
        <div><h2 style={{ fontSize: '24px', marginBottom: '14px' }}>Other services</h2><div className="grid g4">{S.SERVICES.filter(x => x.id !== id).slice(0, 4).map(x => <Link key={x.id} className="box" href={PATHS.service(x.id)} style={{ display: 'grid', gap: '8px' }}><span style={{ color: 'var(--orange)' }}>{withProps(I[x.icon], { width: '30', height: '30' })}</span><b>{x.name}</b></Link>)}</div></div></div>
        <aside className="side"><EnquiryBox subject={s.name} CONFIG={S.CONFIG} /><HelpBox CONFIG={S.CONFIG} /></aside></div></section>
    </>
  );
}
