'use client';
/* Client parts of the page chrome: drawer, footer columns, bottom nav, floating buttons, site-wide effects. */
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { I, withProps } from '@/components/icons';
import { useUI } from '@/components/providers/UIProvider';
import { useSite } from '@/lib/client/hooks';
import { hashToPath, VIEW_PATHS as V } from '@/lib/routes';
import { ThemeButton } from './HeaderClient';
import { PlanButton, OpenButton } from '@/components/ui/buttons';

/* <div class="drawer [on]" id="drawer"><div class="scrim"/><div class="panel">…</div></div> */
export function DrawerShell({ children }) {
  const ui = useUI(), path = usePathname(), open = ui.drawer.open;
  useEffect(() => { ui.drawer.setOpen(false); }, [path]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (!open) return; const k = e => { if (e.key === 'Escape') ui.drawer.setOpen(false); }; document.addEventListener('keydown', k); return () => document.removeEventListener('keydown', k); }, [open, ui.drawer]);
  return (
    <div className={'drawer' + (open ? ' on' : '')} id="drawer">
      <div className="scrim" onClick={() => ui.drawer.setOpen(false)}></div>
      <div className="panel" onClick={e => { if (e.target.closest('a[href]')) ui.drawer.setOpen(false); }}>{children}</div>
    </div>
  );
}
export function DrawerCloseButton() { const ui = useUI(); return <button aria-label="Close menu" onClick={() => ui.drawer.setOpen(false)}>×</button>; }
export function ThemeDrawerButton() { return <ThemeButton className="d-link d-theme" />; }
export function LoginButton({ className, children }) { const ui = useUI(); return <button type="button" className={className} data-login onClick={() => ui.open('login')}>{children}</button>; }

/* drawer accordion: <div class="acc [on]"><button>title ⌄</button><div>…</div></div> */
export function DrawerAcc({ title, children }) {
  const [on, setOn] = useState(false);
  return <div className={'acc' + (on ? ' on' : '')}><button type="button" onClick={() => setOn(v => !v)}>{title}{withProps(I.chev, { width: '14', height: '14' })}</button><div>{children}</div></div>;
}

/* footer link columns: open on desktop, collapsed on phones (≤720px) */
export function FooterCols({ children }) {
  useEffect(() => {
    const mq = matchMedia('(max-width:720px)');
    const set = () => document.querySelectorAll('#foot .fcol').forEach(d => { d.open = !mq.matches; });
    set(); mq.addEventListener && mq.addEventListener('change', set);
    return () => mq.removeEventListener && mq.removeEventListener('change', set);
  }, []);
  return children;
}

/* mobile bottom navigation */
/* the original built the home icon from the bag icon with its <path> swapped for a house outline */
const homeIconFrom = bag => withProps(bag, { children: [bag.props.children[0], <path key="h" d="M3 11 12 3l9 8v10H3z" />] });
const FAB_PLAN = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M7 9h6M7 13h10M7 17h4" /><circle cx="17" cy="9" r="1.5" /></svg>;
export function BottomNav() {
  const path = usePathname() || '/';
  const on = key => (key === 'home' ? path === '/' : key === 'partner' ? path.startsWith(V.partner) : path.startsWith(V.account));
  const homeIcon = homeIconFrom(I.bag);
  return (
    <>
      <Link href="/" className={on('home') ? 'on' : undefined}>{homeIcon}<span>Home</span></Link>
      <OpenButton feature="search">{I.search}<span>Search</span></OpenButton>
      <PlanButton className="bn-plan">{I.plan}<span>Plan Trip</span></PlanButton>
      <Link href={V.partner} className={on('partner') ? 'on' : undefined}>{I.users}<span>Partner</span></Link>
      <Link href={V.account} className={on('account') ? 'on' : undefined}>{I.heart}<span>My Trips</span></Link>
    </>
  );
}

/* floating WhatsApp / back-to-top / plan buttons */
export function Fab({ waHref }) {
  const [top, setTop] = useState(false);
  useEffect(() => { const s = () => setTop(scrollY > 900); addEventListener('scroll', s, { passive: true }); return () => removeEventListener('scroll', s); }, []);
  return (
    <div className="fab"><a className="f-wa" id="fabwa" href={waHref} target="_blank" rel="noopener" aria-label="Chat on WhatsApp">{I.wa}</a>
      <button className={'totop' + (top ? ' on' : '')} id="totop" aria-label="Back to top" onClick={() => scrollTo({ top: 0, behavior: 'smooth' })}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6" /></svg></button>
      <PlanButton className="f-plan">{FAB_PLAN}<span>Plan Your Trip</span></PlanButton></div>
  );
}
/* site-wide effects on every navigation:
   - compact header after scrolling (+ --hh CSS variable with the header height)
   - reveal-on-scroll animation for sections below the fold
   - body.has-mbar when the page has a mobile action bar
   - old "/#route" links (shared before the move to Next.js) → their new URL */
export function SiteEffects() {
  const path = usePathname(), router = useRouter(), S = useSite();
  useEffect(() => {
    const head = document.getElementById('head'); if (!head) return;
    const setH = () => document.documentElement.style.setProperty('--hh', head.offsetHeight + 'px');
    const onScroll = () => { const c = scrollY > 120; if (c !== head.classList.contains('compact')) { head.classList.toggle('compact', c); requestAnimationFrame(setH); setTimeout(setH, 300); setTimeout(setH, 700); } };
    addEventListener('scroll', onScroll, { passive: true }); addEventListener('resize', setH); setH();
    return () => { removeEventListener('scroll', onScroll); removeEventListener('resize', setH); };
  }, []);
  useEffect(() => {
    const app = document.getElementById('app'); if (!app) return;
    const mbar = () => document.body.classList.toggle('has-mbar', !!app.querySelector('.mbar'));
    mbar();
    if (matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -40px 0px' });
    /* reveal-on-scroll for sections below the fold (not the first one), as the original did after each page render */
    const seen = new WeakSet();
    const pass = () => app.querySelectorAll('section').forEach((s, i) => { if (seen.has(s)) return; seen.add(s); if (i > 0 && s.getBoundingClientRect().top > innerHeight) { s.classList.add('rv'); io.observe(s); } });
    pass();
    /* sections that stream in or mount just after the page (still part of the first render) get the same treatment */
    let raf = 0;
    const mo = new MutationObserver(() => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; pass(); mbar(); }); });
    mo.observe(app, { childList: true, subtree: true });
    const stop = setTimeout(() => mo.disconnect(), 3000);
    return () => { io.disconnect(); mo.disconnect(); clearTimeout(stop); cancelAnimationFrame(raf); };
  }, [path]);
  useEffect(() => {
    const h = location.hash.slice(1); if (!h || h.length < 2 || document.getElementById(h)) return;
    const to = hashToPath(h, S); if (to && to !== location.pathname) router.replace(to);
  }, [path, S, router]);
  return null;
}

/* thin reading-progress bar at the bottom of the header */
export function ReadingProgress() {
  useEffect(() => {
    const fill = document.querySelector('#tp-prog > i'); if (!fill) return; let tick = false;
    const upd = () => { tick = false; const max = document.documentElement.scrollHeight - innerHeight; fill.style.transform = `scaleX(${max > 200 ? Math.min(1, scrollY / max) : 0})`; };
    const onScroll = () => { if (!tick) { tick = true; requestAnimationFrame(upd); } };
    addEventListener('scroll', onScroll, { passive: true }); addEventListener('resize', upd); upd();
    return () => { removeEventListener('scroll', onScroll); removeEventListener('resize', upd); };
  }, []);
  return <div id="tp-prog" className="tp-prog" aria-hidden="true"><i></i></div>;
}
