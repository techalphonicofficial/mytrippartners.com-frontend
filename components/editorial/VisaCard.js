/* Photo visa card (original visaCard, design.js). Server component: <VisaCard S={S} v={v} k="free|voa" />
   v = an entry of S.VISA.free / S.VISA.voa; extra photo/stay/tip from S.VISA_X. Used by the visa page and the home page. */
import Link from 'next/link';
import { I } from '@/components/icons';
import { img, inr } from '@/lib/format';
import { PATHS } from '@/lib/routes';

export default function VisaCard({ S, v, k }) {
  const x = S.VISA_X[v.id] || { img: 'europe', stay: '', tip: '' };
  const dest = S.D(v.dest || v.id);
  const from = dest ? Math.min(dest.price, ...S.pkgsOf(dest.id).map(p => p.price)) : 0;
  const label = k === 'free' ? 'Visa Free' : 'On Arrival';
  const short = v.name.replace(' (Bali)', ''), n = short.length;
  const href = PATHS.dest(v.dest || v.id);
  return (
    <article className="vcard" style={{ '--c1': v.c1, '--c2': v.c2 }}>
      <Link className="vc-img" href={href} aria-label={`${v.name} holidays`}><img loading="lazy" src={img(x.img)} alt={v.name} decoding="async" /><span className={`vc-tag ${k}`}>{k === 'free' ? I.shield : I.passport}{label}</span>
        <span className="vc-stamp"><i>{label}</i><b style={{ fontSize: `${n > 8 ? 10 : n > 6 ? 11.5 : 13}px` }}>{short}</b></span>
        <span className="vc-name"><b>{v.name}</b><small>{v.sub}</small></span></Link>
      <div className="vc-body">
        <p className="vc-note">{v.note}</p>
        <ul className="vc-facts"><li>{I.cal}<span><small>Stay</small><b>{x.stay}</b></span></li><li>{I.star}<span><small>Must see</small><b>{x.tip}</b></span></li></ul>
        <div className="vc-foot"><span><small>Packages from</small><b className="num">{from ? inr(from) : 'On request'}</b></span><Link className="btn btn-o btn-sm" href={href}>Explore</Link></div>
        <Link className="vc-help" href={PATHS.service('visa-services')}>{I.passport} Visa help &amp; checklist</Link>
      </div></article>
  );
}
