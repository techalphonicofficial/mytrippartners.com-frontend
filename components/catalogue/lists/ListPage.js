/* Package listing page (legacy listPage + listInit): page hero, then the filterable / sortable / paged grid.
   Server component. title, lead and crumbs accept strings or React nodes; crumbs is what follows "Home /".
   items: package objects (S.P(id)), already filtered. afterHero: rendered between the hero and the list
   (dashboard SEO intro / FAQs go there). listKey: change it to reset the filters (e.g. a new search). */
import Link from 'next/link';
import { getSite } from '@/lib/site';
import { img } from '@/lib/format';
import PhGal from './PhGal';
import ListClient from './ListClient';

/* what the list needs per package (keeps the client payload small) */
export const slimPkg = (S, p) => ({ id: p.id, title: p.title, img: p.img, n: p.n, price: p.price, tag: p.tag || '', route: p.route, themes: p.themes, type: (S.D(p.dest) || {}).type || '' });
export const contactOf = C => ({ phone: C.phone, email: C.email, whatsapp: C.whatsapp });

export default async function ListPage({ title, lead, img: im, crumbs, items, eyebrow, filters = true, afterHero = null, listKey }) {
  const S = await getSite();
  const src = img(im || 'group-lake');
  return (
    <>
      <section className="page-hero"><div className="ph-bg" style={{ backgroundImage: `url(${src})` }}></div><div className="wrap"><div><nav className="crumbs"><Link href="/">Home</Link><span>/</span><span>{crumbs}</span></nav>{eyebrow ? <span className="eyebrow">{eyebrow}</span> : null}<h1>{title}</h1><p className="lead">{lead}</p></div><PhGal className="ph-gal one" srcs={[src]} /></div></section>
      {afterHero}
      <section className="sec"><div className="wrap"><ListClient key={listKey} items={(items || []).map(p => slimPkg(S, p))} themes={S.THEMES.map(t => [t.id, t.name])} CONFIG={contactOf(S.CONFIG)} filters={filters} /></div></section>
    </>
  );
}
