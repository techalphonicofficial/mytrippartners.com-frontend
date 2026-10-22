/* Shared presentational components (usable from server and client components). Same markup as the original:
   pkgCard → <PkgCard>, tallDest → <TallDest>, secHead → <SecHead>. */
import Link from 'next/link';
import { I } from '@/components/icons';
import { img, inr, dname } from '@/lib/format';
import { PATHS } from '@/lib/routes';
import { HeartButton, CmpButton } from './buttons';

/* package card. Per-night hint for multi-night packages (as the original "polish" layer added). */
export function PkgCard({ p }) {
  const href = PATHS.pkg(p.id);
  return (
    <article className="pkg"><div className="p-img"><Link href={href} aria-label={p.title}><img loading="lazy" decoding="async" src={img(p.img)} alt={p.title} /></Link><span className="badge">{p.n}N/{p.n + 1}D</span><HeartButton id={p.id} /></div>
      <div className="p-body"><div className="tags">{p.tag ? <span>{p.tag}</span> : null}<CmpButton id={p.id} /></div><h3><Link href={href}>{p.title}</Link></h3><div className="route-t">{p.route}</div>
        <div className="p-foot"><div><small>Starting from</small><span className="price">{inr(p.price)}</span><small>{p.n > 1 ? `per person · ≈ ${inr(Math.round(p.price / p.n / 10) * 10)}/night` : 'per person'}</small></div><Link className="link-arrow" href={href}>VIEW {I.arrow}</Link></div></div></article>
  );
}

/* tall destination tile (sm = compact variant) */
export function TallDest({ d, sm }) {
  return (
    <Link className={'tall ' + (sm ? 'sm' : '')} href={PATHS.dest(d.id)}><img loading="lazy" decoding="async" src={img(d.img)} alt={d.name} /><span className="t-top">{dname(d)}</span>
      <span className="t-bot">{sm ? <b>{dname(d)}</b> : <><small>Starting from</small><b>{inr(d.price)}</b></>}</span></Link>
  );
}

/* section heading: title + optional lead + optional right-hand element */
export function SecHead({ h, p, right }) {
  return <div className="sec-head"><div><h2>{h}</h2>{p ? <p>{p}</p> : null}</div>{right || null}</div>;
}
