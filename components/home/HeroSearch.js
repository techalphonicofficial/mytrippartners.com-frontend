'use client';
/* Hero search card (original home() markup + homeInit()): trip-type tabs, "Depart from / Going to / Month"
   form with instant suggestions, and the "Popular:" quick searches. Submitting opens /search/ with the
   same filters the original put in STATE.search (q, from, month, theme, type). */
import { useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Suggest from '@/components/ui/Suggest';
import { I } from '@/components/icons';
import { VIEW_PATHS } from '@/lib/routes';

const CITIES = ['New Delhi', 'Mumbai', 'Bengaluru', 'Kolkata', 'Chennai', 'Hyderabad', 'Ahmedabad', 'Pune', 'Lucknow', 'Jaipur', 'Patna', 'Chandigarh'];
const TABS = [['all', I.bag, 'Holidays'], ['spiritual', I.temple, 'Pilgrimage'], ['intl', I.globe, 'International'], ['group', I.users, 'Group Tours']];
const PH = { all: 'Ladakh', spiritual: 'Char Dham', intl: 'Thailand', group: 'Spiti Valley' };
const POPULAR = ['Kashmir', 'Kerala', 'Goa', 'Char Dham', 'Bali', 'Thailand', 'Dubai'];

const searchUrl = s => { const p = new URLSearchParams(); Object.entries(s).forEach(([k, v]) => { if (v) p.set(k, v); }); const q = p.toString(); return VIEW_PATHS.search + (q ? '?' + q : ''); };

/* months: ['Select Month', 'October 2026', …] computed by the server page (same list on server and client) */
export default function HeroSearch({ months }) {
  const router = useRouter();
  const [stab, setStab] = useState('all');
  const [q, setQ] = useState('Ladakh');
  const [focus, setFocus] = useState(false);
  const inp = useRef(null), from = useRef(null), month = useRef(null);

  const onSubmit = e => {
    e.preventDefault();
    const m = month.current.value;
    router.push(searchUrl({ q: q.trim(), from: from.current.value, month: m === 'Select Month' ? '' : m, theme: stab === 'spiritual' ? 'spiritual' : stab === 'group' ? 'group' : '', type: stab === 'intl' ? 'intl' : '' }));
  };
  const close = () => { setFocus(false); inp.current && inp.current.blur(); };

  return (
    <div className="search-card">
      <div className="s-tabs" role="tablist">
        {TABS.map(([k, ic, l]) => <button key={k} role="tab" aria-selected={stab === k ? 'true' : 'false'} onClick={() => { setStab(k); setQ(PH[k]); }}>{ic} {l}</button>)}
      </div>
      <form className="s-fields" id="bigsearch" onSubmit={onSubmit}>
        <div className="s-field"><label htmlFor="sfrom">Depart From</label><select id="sfrom" ref={from}>{CITIES.map(c => <option key={c}>{c}</option>)}</select></div>
        <div className="s-field" style={{ position: 'relative' }}><label htmlFor="sto">Going To</label>
          <input id="sto" ref={inp} value={q} autoComplete="off" onChange={e => setQ(e.target.value)} onFocus={() => setFocus(true)} onBlur={() => setTimeout(() => setFocus(false), 180)} />
          <Suggest query={q} open={focus} inputRef={inp} onPick={close} /></div>
        <div className="s-field"><label htmlFor="smonth">Month of Travel (Optional)</label><select id="smonth" ref={month}>{months.map(m => <option key={m}>{m}</option>)}</select></div>
        <button className="s-go" type="submit">Search</button>
      </form>
      <div className="s-pop">Popular: {POPULAR.map(x => <a key={x} href="#" onClick={e => { e.preventDefault(); router.push(searchUrl({ q: x })); }}>{x}</a>)}<Link href={VIEW_PATHS.weekend} className="s-wk">Weekend from Delhi</Link></div>
    </div>
  );
}
