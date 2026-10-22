'use client';
/* Interactive parts of the header (client islands). */
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { I, TI, withProps } from '@/components/icons';
import { img, inr, waLink } from '@/lib/format';
import { PATHS, VIEW_PATHS } from '@/lib/routes';
import { useUI } from '@/components/providers/UIProvider';
import { useWishlist, useRecent, useSite } from '@/lib/client/hooks';
import { CopyButton } from '@/components/ui/buttons';
import { EnquireButton } from '@/components/ui/LeadForm';
import Suggest from '@/components/ui/Suggest';

/* light/dark toggle (top bar and drawer) */
export function ThemeButton({ className, children }) {
  const ui = useUI(), [m, setM] = useState(false); useEffect(() => setM(true), []);
  const dark = m && ui.theme.dark;
  return <button type="button" className={className} data-theme-btn aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'} onClick={ui.theme.toggle}>{children}{dark ? I.sun : I.moon}</button>;
}

export function WishlistCount() { const n = useWishlist().length; return <span className="wl-count num" id="wlc">{n || ''}</span>; }

export function Burger() { const ui = useUI(); return <button className="burger" id="burger" aria-label="Open menu" onClick={() => ui.drawer.setOpen(true)}>{I.menu}</button>; }

/* "Talk to an expert" — call / WhatsApp / callback */
export function ExpertButton({ CONFIG }) {
  const ui = useUI();
  const open = () => {
    const msg = 'Hi TripPartner, I want to talk to a travel expert.';
    ui.openModal(
      <div className="ok" style={{ textAlign: 'left', justifyItems: 'stretch' }}><p className="muted">A travel expert can help you choose a destination, compare packages or customise a trip. {CONFIG.hours}.</p>
        <div className="copyline" style={{ justifyContent: 'flex-start' }}>Call: <code>{CONFIG.phone}</code><CopyButton value={CONFIG.phone} /></div>
        <a className="btn btn-wa" href={waLink(CONFIG, msg)} target="_blank" rel="noopener">{I.wa} Chat on WhatsApp</a>
        <EnquireButton subject="Callback request" CONFIG={CONFIG} className="btn btn-ghost">Request a callback</EnquireButton></div>,
      'Talk to a travel expert', 'Free advice · no obligation');
  };
  return <button type="button" className="bb-call" data-expert onClick={open}><span className="bb-call-ic">{I.headset}<span className="bb-pulse"></span></span><span className="bb-call-t"><small>Talk to an expert</small><b className="num">{CONFIG.phone}</b></span></button>;
}

/* account drop-down */
export function AccountMenu() {
  const ui = useUI(), [open, setOpen] = useState(false), ref = useRef(null);
  useEffect(() => { const off = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }; document.addEventListener('click', off); return () => document.removeEventListener('click', off); }, []);
  return (
    <div className={'bb-acc' + (open ? ' open' : '')} ref={ref}><button type="button" className="bb-ico bb-me" aria-haspopup="true" aria-expanded={open ? 'true' : 'false'} onClick={e => { e.stopPropagation(); setOpen(o => !o); }}><span className="bb-ring me"><span className="ico-me">tp</span></span><em>Account</em></button>
      <div className="acc-menu" role="menu" onClick={e => { if (e.target.closest('a,[data-login]')) setOpen(false); }}>
        <div className="am-h"><span className="ico-me">tp</span><div><b>Welcome, traveller</b><small>Login to sync trips across devices</small></div></div>
        <button type="button" className="btn btn-o btn-sm" data-login style={{ width: '100%' }} onClick={() => ui.open('login')}>Login / Sign up</button>
        <Link href={VIEW_PATHS.account} role="menuitem">{I.bag}My Trips &amp; bookings</Link>
        <Link href={VIEW_PATHS.wishlist} role="menuitem">{I.heart}Wishlist</Link>
        <Link href={VIEW_PATHS.compare} role="menuitem">{I.star}Compare packages</Link>
        <Link href={VIEW_PATHS['partner-requests']} role="menuitem">{I.users}Travel Partner requests</Link>
        <button type="button" role="menuitem" data-theme-btn-row onClick={ui.theme.toggle}>{I.moon}Dark / light mode</button>
      </div></div>
  );
}

const SCOPES = [['all', 'All'], ['india', 'India'], ['intl', 'Abroad'], ['weekend', 'Weekend'], ['spiritual', 'Yatra']];
const TRENDING = ['Kashmir', 'Char Dham', 'Goa', 'Bali', 'Rishikesh', 'Kerala', 'Ladakh', 'Thailand'];

/* brand-bar search: scope + rotating placeholder + empty-state panel + suggestions + "/" shortcut */
export function HeaderSearch({ hints = [] }) {
  const router = useRouter(), S = useSite(), recent = useRecent(), ui = useUI();
  const [q, setQ] = useState(''), [scope, setScope] = useState('all'), [focus, setFocus] = useState(false), [ph, setPh] = useState(`Search “Kashmir houseboat”`), [phOut, setPhOut] = useState(false);
  const inp = useRef(null), form = useRef(null);
  useEffect(() => {
    if (!hints.length || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let i = 0; const t = setInterval(() => { if (document.activeElement === inp.current || inp.current.value) return; i = (i + 1) % hints.length; setPhOut(true); setTimeout(() => { setPh(`Search “${hints[i]}”`); setPhOut(false); }, 220); }, 2800);
    return () => clearInterval(t);
  }, [hints]);
  useEffect(() => {
    const k = e => { if (e.key === '/' && !/INPUT|TEXTAREA|SELECT/.test((document.activeElement || {}).tagName || '') && !ui.modalOpen) { e.preventDefault(); inp.current && inp.current.focus(); } };
    document.addEventListener('keydown', k); return () => document.removeEventListener('keydown', k);
  }, [ui.modalOpen]);
  const go = (query, sc = scope) => {
    if (sc === 'weekend' && !query) return router.push(VIEW_PATHS.weekend);
    const p = new URLSearchParams(); if (query) p.set('q', query); if (sc === 'india' || sc === 'intl') p.set('type', sc); if (sc === 'weekend' || sc === 'spiritual') p.set('theme', sc);
    setFocus(false); inp.current && inp.current.blur(); router.push(`${VIEW_PATHS.search}${p.toString() ? '?' + p : ''}`);
  };
  const rv = S ? recent.map(S.P).filter(Boolean).slice(0, 3) : [];
  const showEmpty = focus && !q.trim();
  return (
    <form className={'hsearch hs2' + (focus ? ' focus' : '')} id="hsearch" role="search" ref={form} style={{ position: 'relative' }} onSubmit={e => { e.preventDefault(); go(q.trim()); }}>
      <label className="sr" htmlFor="hscope">Search in</label>
      <span className="hs-scope"><select id="hscope" value={scope} onChange={e => setScope(e.target.value)}>{SCOPES.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>{I.chev}</span>
      <span className="hs-div"></span>
      <label className="sr" htmlFor="hq">Search</label>{I.search}<input id="hq" ref={inp} className={phOut ? 'ph-out' : undefined} placeholder={ph} autoComplete="off" enterKeyHint="search" value={q} onChange={e => setQ(e.target.value)}
        onFocus={() => setFocus(true)} onBlur={() => setTimeout(() => setFocus(false), 180)} />
      <kbd className="hs-kbd" aria-hidden="true">/</kbd>
      <button className="go" aria-label="Search">{I.arrow}</button>
      <div className="hs-empty" id="hsempty" hidden={!showEmpty} onMouseDown={e => e.preventDefault()}>
        {showEmpty ? <>
          <p className="hs-l">Trending searches</p><div className="pchips">{TRENDING.map(x => <button key={x} type="button" onClick={() => { setQ(x); go(x); }}>{withSize(I.search)} {x}</button>)}</div>
          <p className="hs-l">Quick links</p><div className="hs-quick"><Link href={VIEW_PATHS['christmas-new-year']}>{TI.festive}<span>Christmas &amp; New Year</span></Link><Link href={VIEW_PATHS.weekend}>{I.car}<span>Weekend from Delhi</span></Link><Link href={VIEW_PATHS.deals}>{I.wallet}<span>Deals</span></Link><Link href={VIEW_PATHS.places}>{I.pin}<span>India A–Z</span></Link><Link href={VIEW_PATHS.videos}>{I.play}<span>Watch reels</span></Link></div>
          {rv.length ? <><p className="hs-l">Recently viewed</p>{rv.map(p => <Link key={p.id} className="hs-rv" href={PATHS.pkg(p.id)}><img src={img(p.img)} alt="" /><span><b>{p.title}</b><small>{p.n}N/{p.n + 1}D · {inr(p.price)}</small></span></Link>)}</> : null}
        </> : null}
      </div>
      <Suggest query={q} open={focus && !!q.trim()} onPick={() => { setFocus(false); inp.current && inp.current.blur(); }} inputRef={inp} />
    </form>
  );
}
const withSize = el => withProps(el, { width: '13', height: '13' });

/* top-level nav item: hover opens (CSS); on touch the first tap opens the menu; clicking a link inside closes it */
export function NavItem({ href, icon, label, chev, rel, linkClass, children }) {
  const [open, setOpen] = useState(false), [hush, setHush] = useState(false), ref = useRef(null);
  const path = usePathname();
  useEffect(() => { setOpen(false); }, [path]);
  useEffect(() => { const off = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }; document.addEventListener('click', off); return () => document.removeEventListener('click', off); }, []);
  const onLink = e => { if (matchMedia('(hover: none)').matches && !open) { e.preventDefault(); setOpen(true); } };
  const onMenuClick = e => { if (e.target.closest('.mega a, .drop a')) { setHush(true); setOpen(false); if (document.activeElement) document.activeElement.blur(); } };
  return (
    <div className={'nav-item' + (rel ? ' rel' : '') + (open ? ' open' : '') + (hush ? ' hush' : '')} ref={ref} onMouseLeave={() => setHush(false)} onClick={onMenuClick}>
      <Link className={'nav-link' + (linkClass ? ' ' + linkClass : '')} href={href} onClick={onLink}><i className="nv-ic">{icon}</i>{label}{chev ? <> {I.chev}</> : null}</Link>
      {children}
    </div>
  );
}

/* tabbed mega menu (India / International): tabs switch on hover, focus or click */
export function MegaTabs({ id, groups, allHref, allLabel, promo, placesCount }) {
  const [sel, setSel] = useState(0);
  return (
    <div className="mega mega-x"><div className="wrap mx">
      <div className="mx-tabs" role="tablist" aria-label={allLabel}>{groups.map((g, i) => <button key={i} type="button" role="tab" aria-selected={i === sel ? 'true' : 'false'} onMouseOver={() => setSel(i)} onFocus={() => setSel(i)} onClick={() => setSel(i)}><b>{g.label}</b><small>{g.count} destination{g.count > 1 ? 's' : ''} · from {inr(g.from)}</small></button>)}
        {id === 'in' ? <><Link className="mx-all mx-wk" href={VIEW_PATHS.weekend}>{I.car} Weekend getaways from Delhi</Link><Link className="mx-all" href={VIEW_PATHS.places}>{placesCount}+ places by state {I.arrow}</Link></> : null}<Link className="mx-all" href={allHref}>{allLabel} {I.arrow}</Link></div>
      <div className="mx-panels">{groups.map((g, i) => <div key={i} className="mx-panel" hidden={i !== sel}><div className="mx-grid">{g.items.map(d => <Link key={d.id} className="mx-card" href={PATHS.dest(d.id)}><span className="mx-img"><img loading="lazy" src={img(d.img)} alt="" /></span><b>{d.name}</b><small>{d.tag}</small><em>from {inr(d.price)}</em></Link>)}</div></div>)}</div>
      {promo}</div></div>
  );
}

/* quick partner search inside the Travel Partner mega menu */
export function PartnerMegaForm({ dests, months }) {
  const router = useRouter();
  const onSubmit = e => {
    e.preventDefault(); const fm = e.currentTarget, p = new URLSearchParams();
    const d = fm.querySelector('#mp2-d').value, m = fm.querySelector('#mp2-m').value, g = (fm.querySelector('input[name=mp2g]:checked') || {}).value;
    if (d) p.set('d', d); if (m) p.set('m', m); if (g && g !== 'Anyone') p.set('g', g);
    router.push(VIEW_PATHS.partner + (p.toString() ? '?' + p : ''));
  };
  return (
    <form className="mp2-search" onSubmit={onSubmit}>
      <span className="mp2-t">{I.users}<b>Find a travel partner</b></span>
      <label className="sr" htmlFor="mp2-d">Destination</label><select id="mp2-d"><option value="">Any destination</option>{dests.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}</select>
      <label className="sr" htmlFor="mp2-m">Month</label><select id="mp2-m"><option value="">Any month</option>{months.map(m => <option key={m}>{m}</option>)}</select>
      <span className="mp2-g" role="group" aria-label="Looking for">{[['Anyone', 'Anyone'], ['Female', 'Women'], ['Male', 'Men']].map(([v, l], i) => <label key={v}><input type="radio" name="mp2g" value={v} defaultChecked={!i} /><span>{l}</span></label>)}</span>
      <button className="btn btn-o btn-sm" type="submit">{I.search} Search</button>
    </form>
  );
}
