/* Contact (original contactPage, app.js) */
import Link from 'next/link';
import { getSite } from '@/lib/site';
import { viewMetadata } from '@/lib/seo';
import { VIEW_PATHS } from '@/lib/routes';
import { I } from '@/components/icons';
import { LeadForm } from '@/components/ui/LeadForm';
import { HelpBox } from '@/components/ui/boxes';

export async function generateMetadata() { const S = await getSite(); return viewMetadata(S, VIEW_PATHS.contact, 'Contact'); }

export default async function ContactPage() {
  const S = await getSite(), C = S.CONFIG;
  const rows = [[I.phone, 'Phone', C.phone], [I.wa, 'WhatsApp', '+' + C.whatsapp], [I.mail, 'Email', C.email], [I.mail, 'Support', C.support], [I.pin, 'Office', C.address], [I.clock, 'Hours', C.hours]];
  return (
    <>
      <section className="page-hero"><div className="wrap"><div><nav className="crumbs"><Link href="/">Home</Link><span>/</span><span>Contact</span></nav><h1>Contact TripPartner</h1><p className="lead">Call, WhatsApp or send an enquiry. A travel expert replies within one working day.</p></div><div></div></div></section>
      <section className="sec"><div className="wrap layout"><div className="box"><h2>Send an enquiry</h2><LeadForm subject="Contact page enquiry" k="contact" CONFIG={C} /></div>
        <aside className="side"><div className="box" style={{ display: 'grid', gap: '16px' }}>{rows.map(([ic, l, v]) => <div key={l} style={{ display: 'flex', gap: '12px' }}><span style={{ color: 'var(--orange)', width: '22px', flex: 'none' }}>{ic}</span><div><small className="muted">{l}</small><b style={{ display: 'block', userSelect: 'all', wordBreak: 'break-word' }}>{v}</b></div></div>)}</div><HelpBox CONFIG={C} /></aside></div></section>
    </>
  );
}
