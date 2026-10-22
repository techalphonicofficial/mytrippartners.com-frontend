/* Home hero (original home(), first <section class="hero">): headline, search card, trust points and photo collage. */
import Link from 'next/link';
import { I } from '@/components/icons';
import { img, inr } from '@/lib/format';
import { PATHS } from '@/lib/routes';
import HeroSearch from './HeroSearch';

const COLLAGE = [['kashmir', 'kashmir-lake', 'Kashmir'], ['bali', 'bali', 'Bali'], ['kerala', 'kerala-boat', 'Kerala'], ['ladakh', 'ladakh', 'Ladakh'], ['dubai', 'dubai', 'Dubai']];

/* "Select Month" + the next 12 months as "October 2026" (en-IN long month, like the original) */
export const heroMonths = () => ['Select Month', ...Array.from({ length: 12 }, (_, i) => { const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() + i); return d.toLocaleString('en-IN', { month: 'long', year: 'numeric' }); })];

export default function Hero({ S, h1 }) {
  const nIn = S.DEST.filter(d => d.type === 'india').length, nIntl = S.DEST.filter(d => d.type === 'intl').length;
  return (
    <section className="hero"><div className="wrap">
      <div>
        <h1>{h1 || <><span className="script">Explore · Plan · Travel · Together</span>Your partner for every <em>trip</em> worth taking</>}</h1>
        <p className="hero-sub">{`Holidays, pilgrimages and group tours across ${nIn}+ Indian and ${nIntl}+ international destinations, planned by one travel expert who stays with you until you're home.`}</p>
        <HeroSearch months={heroMonths()} />
        <div className="trust">
          <div>{I.headset}<span><b>1 expert</b>per trip, start to end</span></div>
          <div>{I.wallet}<span><b>No hidden</b>costs in your quote</span></div>
          <div>{I.shield}<span><b>Verified</b>hotels &amp; drivers</span></div>
        </div>
      </div>
      <div className="collage">
        <svg className="route" aria-hidden="true" viewBox="0 0 500 500" fill="none"><path d="M40 120C160 20 260 260 380 120S470 380 300 440" stroke="currentColor" strokeWidth="2" strokeDasharray="6 8" /></svg>
        {COLLAGE.map(([id, im, n], i) => <Link key={id} className={`pc pc${i + 1}`} href={PATHS.dest(id)}><img src={img(im)} alt="" decoding="async" /><span>{n}</span></Link>)}
        <div className="stamp"><span>From<b>{inr(6199)}</b>per person</span></div>
      </div>
    </div></section>
  );
}
