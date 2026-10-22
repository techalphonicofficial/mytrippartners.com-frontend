/* Information page (original staticPage, app.js): FAQ, privacy policy, terms, cancellation policy — content from S.STATIC.
   Server component: <InfoPage S={S} id="faq" />. Rendered by the lead's catch-all route at /faq/, /privacy/ …
   Metadata for these pages: viewMetadata(S, `/${id}/`, S.STATIC[id][0]) — see infoTitle(). */
import Link from 'next/link';
import { HelpBox } from '@/components/ui/boxes';

/* original document.title (without " | TripPartner"); null for unknown ids */
export const infoTitle = (S, id) => (S.STATIC[id] ? S.STATIC[id][0] : null);

export default function InfoPage({ S, id }) {
  const [t, items] = S.STATIC[id];
  const updated = new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
  return (
    <>
      <section className="page-hero"><div className="wrap"><div><nav className="crumbs"><Link href="/">Home</Link><span>/</span><span>{t}</span></nav><h1>{t}</h1><p className="lead">Last updated {updated}</p></div><div></div></div></section>
      <section className="sec"><div className="wrap layout"><div className="box faq">{items.map(([q, a], i) => <details key={i} open={id !== 'faq' || i === 0}><summary>{q}</summary><p>{a}</p></details>)}</div><aside className="side"><HelpBox CONFIG={S.CONFIG} /></aside></div></section>
    </>
  );
}
