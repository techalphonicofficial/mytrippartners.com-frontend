/* Trip-type category across India, e.g. /india/hill-stations-in-india/ (original catPage, places.js). Server component. */
import { Fragment } from 'react';
import Link from 'next/link';
import { img } from '@/lib/format';
import { PATHS, VIEW_PATHS } from '@/lib/routes';
import { PlaceCard } from '@/components/ui/boxes';
import { HeroGallery } from './PlacesClient';

export default function CatPage({ S, t, h1, extra }) {
  const [, h, d] = S.CATS[t]; const list = S.PLACES.filter(p => p.t.includes(t));
  const byState = [...new Set(list.map(p => p.s))];
  return (
    <>
      <section className="page-hero cine"><div className="ph-bg" style={{ backgroundImage: `url(${img(S.placeImg(list[0]))})` }}></div><div className="wrap"><div><nav className="crumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><Link href={VIEW_PATHS.places}>India</Link><span>/</span><span>{h}</span></nav><h1>{h1 || `${list.length} ${h}`}</h1><p className="lead">{d}</p></div><HeroGallery imgs={list.slice(0, 3).map(p => [S.placeImg(p), p.n])} /></div></section>
      {extra}
      <section className="sec"><div className="wrap" style={{ display: 'grid', gap: '26px' }}>
        <div className="plc-grid big">{list.map(p => <PlaceCard key={p.id} p={p} S={S} />)}</div>
        <div className="box"><h2>{h} by state</h2><div className="grid g3">{byState.map(s => <div key={s}><h3 style={{ fontSize: '17px', marginBottom: '6px' }}><Link href={PATHS.state(s)} style={{ color: 'var(--blue)' }}>{S.ST(s).n}</Link></h3><p className="muted" style={{ fontSize: '14px' }}>{list.filter(p => p.s === s).map((p, i) => <Fragment key={p.id}>{i ? ', ' : ''}<Link href={PATHS.place(p)}>{p.n}</Link></Fragment>)}</p></div>)}</div></div>
        <div className="box"><h2>Other ways to explore India</h2><div className="pchips">{Object.keys(S.CATS).filter(k => k !== t).map(k => <Link key={k} className="chipx" href={PATHS.cat(S.CATS[k][0])}>{S.CATS[k][1]}</Link>)}</div></div>
      </div></section>
    </>
  );
}
