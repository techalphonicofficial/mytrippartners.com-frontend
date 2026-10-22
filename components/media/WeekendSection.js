/* Weekend getaways section for the home page (legacy weekendSection + weekendInit). <WeekendSection S={S} /> */
import Link from 'next/link';
import { I } from '@/components/icons';
import { inr } from '@/lib/format';
import { VIEW_PATHS } from '@/lib/routes';
import { weekendList, nextWeekends, ymd } from '@/lib/media/weekend';
import WeekendScale from './WeekendScale';
import { WeekendBrowser } from './WeekendParts';

export default function WeekendSection({ S }) {
  if (!S.WEEKEND.length) return null;
  const list = weekendList(S);
  return (
    <section className="wk" id="weekend-sec"><div className="wrap">
      <div className="wk-h"><div><span className="eyebrow">Weekend getaways from Delhi NCR</span><h2>Friday night to Sunday night — sorted</h2><p>{S.WEEKEND.length} short trips within {Math.max(...S.WEEKEND.map(p => p.wk.km))} km. Pickup from Delhi, Noida, Gurugram &amp; Ghaziabad. Prices from {inr(Math.min(...S.WEEKEND.map(p => p.price)))}.</p></div><Link className="btn btn-b" href={VIEW_PATHS.weekend}>All weekend trips {I.arrow}</Link></div>
      <WeekendScale list={list} />
      <WeekendBrowser list={list} fri={ymd(nextWeekends(1)[0])} variant="section" CONFIG={S.CONFIG} />
    </div></section>
  );
}
