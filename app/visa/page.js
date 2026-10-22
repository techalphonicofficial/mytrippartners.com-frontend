/* Visa destinations (original visaPage, app.js + visaCard, design.js) */
import Link from 'next/link';
import { getSite } from '@/lib/site';
import { viewMetadata } from '@/lib/seo';
import { VIEW_PATHS } from '@/lib/routes';
import { I } from '@/components/icons';
import { EnquiryBox } from '@/components/ui/boxes';
import VisaCard from '@/components/editorial/VisaCard';
import { Gal, bg } from '@/components/editorial/Hero';

export async function generateMetadata() { const S = await getSite(); return viewMetadata(S, VIEW_PATHS.visa, 'Visa'); }

const CHECKLIST = ['Passport valid for 6+ months with 2 blank pages', 'Return / onward flight tickets', 'Hotel bookings for the full stay', 'Recent passport-size photographs (white background)', 'Bank statement for the last 3–6 months', 'Travel insurance (mandatory for some countries)', 'Filled application / arrival card', 'Proof of funds as required by the country'];

export default async function VisaPage() {
  const S = await getSite();
  return (
    <>
      <section className="page-hero"><div className="ph-bg" style={bg('thailand')}></div><div className="wrap"><div><nav className="crumbs"><Link href="/">Home</Link><span>/</span><span>Visa</span></nav><h1>Easy visa destinations</h1><p className="lead">Holidays abroad without the paperwork stress. Our visa desk checks current entry rules, prepares your checklist and books appointments where needed.</p></div><Gal imgs={['thailand', 'maldives', 'bhutan']} /></div></section>
      <section className="sec"><div className="wrap" style={{ display: 'grid', gap: '36px' }}>
        <div><div className="sec-head"><h2>Visa-free for Indian passport holders</h2></div><div className="grid g4">{S.VISA.free.map(v => <VisaCard key={v.id} S={S} v={v} k="free" />)}</div></div>
        <div><div className="sec-head"><h2>Visa on arrival &amp; e-visa</h2></div><div className="grid g4">{S.VISA.voa.map(v => <VisaCard key={v.id} S={S} v={v} k="voa" />)}</div></div>
        <div className="layout"><div className="box"><h2>General document checklist</h2><ul className="checks two">{CHECKLIST.map(x => <li key={x}>{I.check}<span>{x}</span></li>)}</ul><p className="muted" style={{ marginTop: '14px', fontSize: '13px' }}>Entry requirements change often. Always confirm with the embassy or our visa desk before travel.</p></div><aside className="side"><EnquiryBox subject="Visa assistance" CONFIG={S.CONFIG} /></aside></div>
      </div></section>
    </>
  );
}
