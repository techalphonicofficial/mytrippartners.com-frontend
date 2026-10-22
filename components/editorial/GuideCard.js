/* Travel guide card (original guideCard, extra.js) */
import Link from 'next/link';
import { I } from '@/components/icons';
import { img } from '@/lib/format';
import { PATHS } from '@/lib/routes';

export default function GuideCard({ g }) {
  return <Link className="guide" href={PATHS.guide(g.id)}><div className="gi"><img loading="lazy" src={img(g.img)} alt="" decoding="async" /><span className="gcat">{g.cat}</span></div><div className="gb"><h3>{g.title}</h3><p>{g.intro}</p><span className="link-arrow">Read guide · {g.min} min {I.arrow}</span></div></Link>;
}
