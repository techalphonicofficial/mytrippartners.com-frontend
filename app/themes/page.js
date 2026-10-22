/* Holiday themes index (legacy themesIndex) */
import Link from 'next/link';
import { getSite } from '@/lib/site';
import { viewMetadata } from '@/lib/seo';
import { img } from '@/lib/format';
import { PATHS } from '@/lib/routes';
import { I } from '@/components/icons';
import PhGal from '@/components/catalogue/lists/PhGal';

export async function generateMetadata() { const S = await getSite(); return viewMetadata(S, '/themes/', 'Holiday Themes'); }

export default async function Page() {
  const S = await getSite();
  return (
    <>
      <section className="page-hero"><div className="ph-bg" style={{ backgroundImage: `url(${img('th-honeymoon')})` }}></div><div className="wrap"><div><nav className="crumbs"><Link href="/">Home</Link><span>/</span><span>Holiday Themes</span></nav><h1>Holidays by theme</h1><p className="lead">Start with the kind of trip you want, then pick a destination.</p></div><PhGal srcs={[img('th-honeymoon'), img('rafting'), img('th-pilgrimage')]} /></div></section>
      <section className="sec"><div className="wrap grid g3">{S.THEMES.map(t => {
        const n = S.PKG.filter(p => p.themes.includes(t.id)).length;
        return <Link key={t.id} className="cur-card" href={PATHS.theme(t.id)} style={{ textAlign: 'left' }}><img loading="lazy" src={img(t.img)} alt={t.name} decoding="async" /><div style={{ padding: '16px 18px 20px' }}><h4 style={{ textTransform: 'none', margin: '0 0 6px', fontSize: '22px' }}>{t.name}</h4><p className="muted">{t.desc}</p><span className="link-arrow" style={{ padding: '10px 0 0' }}>{n} packages {I.arrow}</span></div></Link>;
      })}</div></section>
    </>
  );
}
