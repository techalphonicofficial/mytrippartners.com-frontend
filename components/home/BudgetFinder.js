'use client';
/* Budget explorer (original next.js BX / budgetSection / budgetInit): budget slider with a price histogram,
   quick budget buttons, where / trip-length / style filters, and a rail of the packages that fit. */
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { PkgCard } from '@/components/ui/cards';
import { RailNav, PlanButton } from '@/components/ui/buttons';
import { EnquireButton } from '@/components/ui/LeadForm';
import { I } from '@/components/icons';
import { inr } from '@/lib/format';
import { PATHS } from '@/lib/routes';

const BX = { min: 5000, max: 150000, step: 1000 };
const DEFAULT = { b: 30000, n: 'any', t: 'all', th: '' };
const BX_N = [['any', 'Any length', () => true], ['short', '1–3 nights', p => p.n <= 3], ['mid', '4–6 nights', p => p.n >= 4 && p.n <= 6], ['long', '7+ nights', p => p.n >= 7]];
const BX_T = [['all', 'Anywhere'], ['india', 'India'], ['intl', 'Abroad']];
const BX_TH = [['', 'Any style'], ['family', 'Family'], ['honeymoon', 'Honeymoon'], ['group', 'Friends & groups'], ['spiritual', 'Pilgrimage'], ['adventure', 'Adventure'], ['beach', 'Beach'], ['weekend', 'Weekend']];
const QUICK = [15000, 25000, 40000, 60000, 100000];

/* the original kept the choice in a global (BX.s) for the rest of the visit */
let saved = null;

/* pkgs: [{ id, img, title, n, tag, route, price, themes, type }] (type = destination type: india | intl) */
export default function BudgetFinder({ pkgs, CONFIG }) {
  const [s, setS] = useState(() => saved || DEFAULT);
  const set = patch => setS(v => (saved = { ...v, ...patch }));

  const pool = pkgs.filter(p => (s.t === 'all' || p.type === s.t) && BX_N.find(x => x[0] === s.n)[2](p) && (!s.th || p.themes.includes(s.th)));
  const top = s.b >= BX.max, fit = pool.filter(p => top || p.price <= s.b).sort((a, b) => b.price - a.price);
  const places = new Set(fit.map(p => p.dest)).size;
  const next = pool.filter(p => p.price > s.b).sort((a, b) => a.price - b.price)[0];

  /* histogram: 30 price bins of the current pool, bins under the budget highlighted */
  const bins = 30, w = (BX.max - BX.min) / bins, c = Array(bins).fill(0);
  pool.forEach(p => { c[Math.min(bins - 1, Math.max(0, Math.floor((p.price - BX.min) / w)))]++; });
  const mx = Math.max(1, ...c);

  useEffect(() => { const r = document.getElementById('r-bx'); if (r && r.scrollTo) r.scrollTo({ left: 0 }); }, [s]);

  const nextLink = p => <Link href={PATHS.pkg(p.id)}><b>{p.title}</b></Link>;
  return (
    <section className="sec bx" id="bx-sec"><div className="wrap">
      <div className="bx-card">
        <div className="bx-l">
          <span className="eyebrow">Budget explorer</span>
          <h2>Tell us your budget — see where you can go</h2>
          <p className="muted">Move the slider. Prices are per person on twin sharing, as shown on each package.</p>
          <div className="bx-amt"><small>My budget per person</small><b className="num" id="bx-val">{inr(s.b) + (top ? '+' : '')}</b></div>
          <div className="bx-hist" id="bx-hist" aria-hidden="true">{c.map((v, i) => <i key={i} className={BX.min + i * w < s.b ? 'on' : ''} style={{ height: (v ? Math.max(10, Math.round(v / mx * 100)) : 3) + '%' }}></i>)}</div>
          <input type="range" id="bx-range" min={BX.min} max={BX.max} step={BX.step} value={s.b} aria-label="Budget per person in rupees" style={{ '--p': ((s.b - BX.min) / (BX.max - BX.min) * 100) + '%' }} onChange={e => set({ b: +e.target.value })} />
          <div className="bx-scale num"><span>{inr(BX.min)}</span><span>{inr(50000)}</span><span>{inr(100000)}</span><span>{inr(BX.max)}+</span></div>
          <div className="bx-quick">{QUICK.map(v => <button key={v} type="button" className={v === s.b ? 'on' : undefined} onClick={() => set({ b: v })}>Under {inr(v)}</button>)}</div>
          <div className="bx-f"><div className="pill-tabs" id="bx-t" role="group" aria-label="Where">{BX_T.map(([k, l]) => <button key={k} type="button" aria-selected={k === s.t ? 'true' : 'false'} onClick={() => set({ t: k })}>{l}</button>)}</div>
            <div className="pill-tabs" id="bx-n" role="group" aria-label="Trip length">{BX_N.map(([k, l]) => <button key={k} type="button" aria-selected={k === s.n ? 'true' : 'false'} onClick={() => set({ n: k })}>{l}</button>)}</div>
            <label className="sr" htmlFor="bx-th">Travel style</label><select id="bx-th" value={s.th} onChange={e => set({ th: e.target.value })}>{BX_TH.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></div>
        </div>
        <div className="bx-r">
          <div className="bx-rh"><p id="bx-count" aria-live="polite">{fit.length ? <><b className="num">{fit.length}</b>{` trip${fit.length === 1 ? '' : 's'} across `}<b className="num">{places}</b>{` destination${places === 1 ? '' : 's'} fit your budget`}</> : 'No trips match yet'}</p><RailNav id="r-bx" /></div>
          <div className="rail" id="r-bx" style={{ '--cw': '270px' }}>{fit.slice(0, 10).map(p => <PkgCard key={p.id} p={p} />)}</div>
          <div className="bx-foot" id="bx-foot">
            {fit.length
              ? <>{next && !top ? <span className="muted">Add {inr(next.price - s.b)} more to unlock {nextLink(next)}.</span> : <span></span>}<PlanButton className="btn btn-o btn-sm">{I.plan} Get a custom quote in this budget</PlanButton></>
              : <><span className="muted">{next ? <>The closest match starts at {inr(next.price)} — {nextLink(next)}.</> : 'Try a different trip length or style.'}</span><EnquireButton className="btn btn-o btn-sm" subject={`Trip within ${inr(s.b)} per person`} CONFIG={CONFIG}>Ask our experts</EnquireButton></>}
          </div>
        </div>
      </div></div></section>
  );
}
