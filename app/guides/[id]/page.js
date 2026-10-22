/* Travel guide article (original guidePage, extra.js) — built-in SEO page */
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getSite } from '@/lib/site';
import { pageMetadata, seoOverride, faqLd } from '@/lib/seo';
import { builtInPage } from '@/lib/pages';
import { PATHS, VIEW_PATHS, routeHref } from '@/lib/routes';
import { img } from '@/lib/format';
import { I } from '@/components/icons';
import { JsonLd, SeoExtra } from '@/components/seo/Seo';
import { EnquiryBox } from '@/components/ui/boxes';
import { ShareButton } from '@/components/ui/buttons';
import { Gal, bg } from '@/components/editorial/Hero';

export const dynamicParams = true;
export async function generateStaticParams() { return []; }
export async function generateMetadata({ params }) { const { id } = await params; const S = await getSite(); return pageMetadata(S, PATHS.guide(id)); }

export default async function GuidePage({ params }) {
  const { id } = await params;
  const S = await getSite();
  const g = S.G(id); if (!g) notFound();
  const path = PATHS.guide(id), ov = seoOverride(S, path), page = builtInPage(S, path);
  return (
    <>
      <JsonLd data={[...(page ? page.jsonld() : []), faqLd(ov.faqs)]} />
      <section className="page-hero"><div className="ph-bg" style={bg(g.img)}></div><div className="wrap"><div><nav className="crumbs"><Link href="/">Home</Link><span>/</span><Link href={VIEW_PATHS.guides}>Travel Guides</Link><span>/</span><span>{g.cat}</span></nav><span className="eyebrow">{g.cat} · {g.min} min read</span><h1>{ov.h1 || g.title}</h1><p className="lead">{g.intro}</p></div><Gal imgs={[g.img]} one /></div></section>
      {ov.intro || ov.faqs.length ? <SeoExtra intro={ov.intro} faqs={ov.faqs} /> : null}
      <section className="sec"><div className="wrap layout"><article className="box prose article">
        {g.table ? <div style={{ overflowX: 'auto', marginBottom: '20px' }}><table className="pol cmp"><tbody>{g.table.map((r, i) => <tr key={i}>{r.map((c, j) => (i === 0 ? <th key={j}>{c}</th> : <td key={j}>{c}</td>))}</tr>)}</tbody></table></div> : null}
        {g.body.map(([h, t], i) => [<h2 key={'h' + i}>{h}</h2>, <p key={'p' + i}>{t}</p>])}
        <div className="art-cta"><Link className="btn btn-o" href={routeHref(g.link[1], S)}>{g.link[0]} {I.arrow}</Link><ShareButton>Share this guide</ShareButton></div>
      </article><aside className="side"><EnquiryBox subject={g.title} CONFIG={S.CONFIG} /><div className="box"><h3>More guides</h3><div style={{ display: 'grid', gap: '12px' }}>{S.GUIDES.filter(x => x.id !== id).slice(0, 4).map(x => <Link key={x.id} className="mini-g" href={PATHS.guide(x.id)}><img src={img(x.img)} alt="" decoding="async" /><span>{x.title}</span></Link>)}</div></div></aside></div></section>
    </>
  );
}
