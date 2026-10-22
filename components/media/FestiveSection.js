/* Christmas & New Year blocks for the home page (legacy festive.js).
   <FestiveSection S={S} />  festiveSection + festiveInit (countdown, filter tabs)
   <FestiveBanner S={S} />   bannerFestive (hero slider banner) */
import Link from 'next/link';
import { I, TI } from '@/components/icons';
import { img, inr } from '@/lib/format';
import { VIEW_PATHS } from '@/lib/routes';
import { EnquireButton } from '@/components/ui/LeadForm';
import { festiveList, fxEB, fxLeft } from '@/lib/media/festive';
import { Countdown, FestiveBrowser } from './FestiveParts';

export default function FestiveSection({ S }) {
  if (!S.FESTIVE.length) return null;
  return (
    <section className="fx" id="fx-sec"><div className="fx-snow" aria-hidden="true"></div><div className="wrap">
      <div className="fx-h"><div><span className="fx-eye">{TI.festive} Christmas &amp; New Year 2026–27</span><h2>Snow, sand or fireworks — pick your holiday season</h2><p>{S.FESTIVE.length} fixed festive departures — snow in Gulmarg and Manali, beach parties in Goa and Phuket, fireworks in Dubai and Singapore. Early-bird prices till 31 Oct.*</p>
        <div className="fx-btns"><Link className="btn btn-o" href={VIEW_PATHS['christmas-new-year']}>See all festive trips {I.arrow}</Link><EnquireButton className="btn btn-ghost fx-ghost" subject="Christmas / New Year group booking" CONFIG={S.CONFIG}>Group &amp; office party quote</EnquireButton></div></div>
        <div className="fx-cdw"><small>Countdown to New Year 2027</small><Countdown initial={fxLeft()} /></div></div>
      <FestiveBrowser list={festiveList(S)} variant="section" CONFIG={S.CONFIG} />
      <p className="fx-tc">*Indicative prices per person on twin sharing; early-bird discount and seat counts are illustrative until confirmed by our team. Festive-period cancellation terms apply.</p>
    </div></section>
  );
}

export function FestiveBanner({ S }) {
  return (
    <Link className="banner bn-fx" href={VIEW_PATHS['christmas-new-year']}><div className="fx-snow" aria-hidden="true"></div><div className="bnf-t"><small>Christmas &amp; New Year 2026–27</small><h3>Ring in 2027<br /><span>somewhere new</span></h3><p>{S.FESTIVE.length} festive departures · from {inr(Math.min(...S.FESTIVE.map(fxEB)))}</p></div>
      <div className="bnf-pics">{['kashmir-snow', 'goa-beach', 'dubai'].map(i => <img key={i} src={img(i)} alt="" decoding="async" />)}</div><span className="bn-cta y">Explore festive trips {I.arrow}</span></Link>
  );
}
