/* Distance-from-Delhi scale with a dot per weekend trip (legacy wkScale). list = weekendList(S) */
import Link from 'next/link';
import { I } from '@/components/icons';
import { PATHS } from '@/lib/routes';

export default function WeekendScale({ list }) {
  const max = 500, last = [-99, -99, -99, -99];
  const dots = list.map(p => {
    const x = Math.min(98, p.wk.km / max * 100); let l = last.findIndex(v => x - v >= 9); if (l < 0) l = last.indexOf(Math.min(...last)); last[l] = x;
    return <Link key={p.id} className={`wks-dot l${l}`} href={PATHS.pkg(p.id)} style={{ left: `${x}%` }} title={`${p.title} · ${p.wk.km} km`}><span>{p.title.split(/[ &]/)[0]}</span></Link>;
  });
  return (
    <div className="wks" aria-label="Distance from Delhi NCR"><div className="wks-line"><span className="wks-home">{I.pin}<b>Delhi NCR</b></span>{[100, 200, 300, 400].map(k => <i key={k} className="wks-tick" style={{ left: `${k / max * 100}%` }}><em>{k} km</em></i>)}{dots}</div></div>
  );
}
