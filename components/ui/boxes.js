/* Shared side boxes and small blocks used by many pages (same markup as the original):
   enquiryBox → <EnquiryBox>, helpBox → <HelpBox>, emptyAcct → <EmptyState>, placeCard → <PlaceCard>, monthCal → <MonthCal>. */
import Link from 'next/link';
import { I } from '@/components/icons';
import { img, dname, waLink, MON } from '@/lib/format';
import { PATHS } from '@/lib/routes';
import { TLAB } from '@/lib/places';
import { LeadForm } from './LeadForm';

/* "Get a free quote" side box with the enquiry form (id prefix "side") */
export function EnquiryBox({ subject, CONFIG }) {
  return <div className="box"><h3>Get a free quote</h3><p className="muted" style={{ margin: '-6px 0 14px', fontSize: '14px' }}>For {subject}</p><LeadForm subject={subject} k="side" CONFIG={CONFIG} /></div>;
}

/* "Need help deciding?" call / WhatsApp box */
export function HelpBox({ CONFIG }) {
  return <div className="box" style={{ background: 'var(--blue)', color: '#fff', border: '0' }}><h3>Need help deciding?</h3><p style={{ opacity: '.9', fontSize: '14px' }}>Call or WhatsApp a travel expert.</p><p style={{ font: '800 22px var(--f-display)', margin: '12px 0', userSelect: 'all' }}>{CONFIG.phone}</p><a className="btn btn-wa" style={{ width: '100%' }} href={waLink(CONFIG, 'Hi TripPartner, I need help planning a trip.')} target="_blank" rel="noopener">{I.wa} Chat on WhatsApp</a></div>;
}

/* empty state with a call-to-action link */
export function EmptyState({ h, p, href, btn }) {
  return <div className="empty"><h3>{h}</h3><p style={{ margin: '8px 0 16px' }}>{p}</p><Link className="btn btn-o" href={href}>{btn}</Link></div>;
}

/* India place card (S = site store or { placeImg, ST }) */
export function PlaceCard({ p, S, extra = '' }) {
  return <Link className="plc" href={PATHS.place(p)}><span className="plc-img"><img loading="lazy" decoding="async" src={img(S.placeImg(p))} alt={p.n} /><span className="plc-tag">{TLAB[p.t[0]] || ''}</span></span><span className="plc-b"><b>{p.n}</b><small>{(S.ST(p.s) || {}).n}{extra}</small><em>Best: {p.best.split(';')[0]}</em></span></Link>;
}

/* best months from text like "Mar–Jun for gardens; Dec–Feb for snow" → month indexes (first clause) */
export function bestMonths(str) {
  if (/year-round/i.test(str)) return MON.map((_, i) => i);
  const set = new Set(); const re = /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s*[–-]\s*(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/g; let m;
  const main = str.split(';')[0];
  while ((m = re.exec(main))) { const a = MON.indexOf(m[1]), b = MON.indexOf(m[2]); for (let i = a; ; i = (i + 1) % 12) { set.add(i); if (i === b) break; } }
  const singles = main.replace(re, '').match(/Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec/g) || []; singles.forEach(s => set.add(MON.indexOf(s)));
  return [...set];
}

/* "When to visit" 12-month calendar; d needs { best, name, short? } (destinations and places — places pass { name: p.n, best: p.best }) */
export function MonthCal({ d }) {
  const best = bestMonths(d.best); const alt = /;\s*(.*)/.exec(d.best);
  return (
    <div className="box"><h2>When to visit {dname(d)}</h2><div className="mcal">{MON.map((m, i) => { const b = best.includes(i); const near = !b && (best.includes((i + 1) % 12) || best.includes((i + 11) % 12)); return <div key={m} className={b ? 'best' : near ? 'ok' : 'off'}><b>{m}</b><small>{b ? 'Best' : near ? 'Good' : 'Off-peak'}</small></div>; })}</div>
      <p className="muted" style={{ fontSize: '13.5px', marginTop: '12px' }}><b>Best time:</b> {d.best.split(';')[0]}.{alt ? ` Also: ${alt[1]}.` : ''} Off-peak months bring lower prices; ask your expert about weather and road conditions.</p></div>
  );
}
