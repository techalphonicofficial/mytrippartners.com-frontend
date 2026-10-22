'use client';
/* My Trips (original system.js accountPage + emptyAcct, next.js tripsEnhance/tripsSync and payproof.js
   payTripsEnhance): bookings, enquiries, wishlist and Travel Partner activity saved on this device, with live
   booking stage, payment status and days-to-go. Device data is read after mount (empty on the server). */
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { I } from '@/components/icons';
import { img, inr, waLink, fmtDate } from '@/lib/format';
import { PATHS, VIEW_PATHS } from '@/lib/routes';
import { ls } from '@/lib/client/storage';
import { useDeviceDB, useWishlist, useRecent, useMounted } from '@/lib/client/hooks';
import { PkgCard, SecHead } from '@/components/ui/cards';
import { RailNav } from '@/components/ui/buttons';
import { EmptyState } from '@/components/ui/boxes';
import { LoginButton } from '@/components/layout/ChromeClient';
import { payCalc } from '@/lib/booking/calc';
import { tripsSync, proofsSync } from '@/lib/booking/device';
import StatusTrack from './StatusTrack';

let lastTab = 'bookings';       /* STATE.acct — kept for this visit */
const EMPTY_PS = { me: null, req: [], book: [] };

/* days to departure chip (tripsEnhance) */
function DaysToGo({ b }) {
  const d = Math.round((new Date(b.date + 'T00:00:00') - new Date(new Date().toDateString())) / 864e5);
  if (b.status >= 5 || isNaN(d)) return null;
  return <span className={'trip-cd' + (d <= 7 && d >= 0 ? ' soon' : '')}>{d > 1 ? `${d} days to go` : d === 1 ? 'Tomorrow' : d === 0 ? 'Departs today' : 'Departure date passed'}</span>;
}

/* payment status of a booking (payTripsEnhance) */
function PayStatus({ b }) {
  const c = payCalc(b), proofs = b.proofs || [], pend = proofs.filter(p => p.status === 'Pending').length, last = proofs.slice(-1)[0], rc = proofs.filter(p => p.status === 'Approved' && p.receipt);
  return (
    <div className="py-trip"><div className="py-trip-m"><span>Paid <b className="num">{inr(c.paid)}</b> of <b className="num">{inr(c.total)}</b></span>{c.pending ? <span className="py-st wait">{inr(c.pending)} under verification</span> : null}{last && last.status === 'Rejected' ? <span className="py-st bad">Last proof rejected</span> : null}{!c.due && !c.pending && c.total ? <span className="py-st ok">Fully paid</span> : null}</div>
      <div className="py-bar" aria-hidden="true"><i style={{ width: `${c.total ? Math.min(100, c.paid / c.total * 100) : 0}%` }}></i><em style={{ width: `${c.total ? Math.min(100, c.pending / c.total * 100) : 0}%` }}></em></div>
      <div className="py-trip-a">{!b.cancelled && c.due ? <Link className="btn btn-o btn-sm" href={PATHS.pay(b.ref)}>{I.wallet} {c.paid || pend ? 'Pay balance / upload proof' : 'Pay advance / upload proof'}</Link> : null}{rc.map(x => <Link key={x.id} className="btn btn-ghost btn-sm" href={PATHS.receipt(b.ref, x.id)}>Receipt {x.receipt}</Link>)}</div></div>
  );
}

/* pkgs: { id → { id, title, img, n, price, route, tag } }; CONFIG: { whatsapp } */
export default function MyTrips({ pkgs, CONFIG }) {
  const db = useDeviceDB(), wlIds = useWishlist(), rvIds = useRecent(), mounted = useMounted();
  const [tab, setTab] = useState('bookings');
  const [ps, setPs] = useState(EMPTY_PS);
  const P = id => pkgs[id];
  useEffect(() => {
    setTab(lastTab);
    const v = ls('tp_partner'); if (v) setPs({ ...EMPTY_PS, ...v, req: v.req || [], book: v.book || [] });
    const hasPkg = id => !!pkgs[id];
    tripsSync(); proofsSync(hasPkg);
  }, [pkgs]);
  const pick = k => { lastTab = k; setTab(k); };

  const wl = wlIds.map(P).filter(Boolean), rv = rvIds.map(P).filter(Boolean);
  const tabs = [['bookings', 'Bookings', db.bookings.length], ['enquiries', 'Enquiries', db.leads.length], ['wishlist', 'Wishlist', wl.length], ['partner', 'Travel Partner', ps.req.length + ps.book.length]];
  let content = null;
  if (tab === 'bookings') content = db.bookings.length ? db.bookings.map(b => {
    const p = P(b.pkg) || { id: b.pkg, title: b.pkgTitle || b.pkg, img: 'group-lake' };
    return (
      <div className="trip" key={b.ref}><img src={img(p.img)} alt="" decoding="async" /><div className="trip-b"><div className="trip-h"><b>{p.title}</b><span className="refno">{b.ref}</span>{mounted ? <DaysToGo b={b} /> : null}</div>
        <small className="muted">{fmtDate(b.date)} · from {b.from} · {b.ad}A{b.ch ? ` ${b.ch}C` : ''}{b.inf ? ` ${b.inf}I` : ''} · Total {inr(b.total)}</small><StatusTrack n={b.status} /><PayStatus b={b} />
        <div className="trip-a"><Link className="btn btn-ghost btn-sm" href={PATHS.pkg(p.id)}>View package</Link><a className="btn btn-wa btn-sm" href={waLink(CONFIG, `Hi TripPartner, status of my booking ${b.ref}?`)} target="_blank" rel="noopener">{I.wa} Ask for update</a></div></div></div>
    );
  }) : <EmptyState h="No bookings yet" p="Pick a package and tap Book Now." href={VIEW_PATHS.packages} btn="Browse packages" />;
  if (tab === 'enquiries') content = db.leads.length ? (
    <div className="dep-wrap"><table className="dep"><thead><tr><th>Ref</th><th>Trip</th><th>Date</th><th>Status</th></tr></thead><tbody>{db.leads.map(l => (
      <tr key={l.id}><td className="num">{l.id}</td><td><b>{l.subject}</b><small className="muted" style={{ display: 'block' }}>{l.pax || ''} {l.month ? '· ' + l.month : ''}</small></td><td className="num">{new Date(l.at).toLocaleDateString('en-IN')}</td><td><span className="rstat">{l.status}</span></td></tr>
    ))}</tbody></table></div>
  ) : <EmptyState h="No enquiries yet" p="Use Plan My Trip or any quote form." href="/" btn="Plan a trip" />;
  if (tab === 'wishlist') content = wl.length ? <div className="grid g3">{wl.map(p => <PkgCard key={p.id} p={p} />)}</div> : <EmptyState h="Your wishlist is empty" p="Tap ♥ on any package to save it." href={VIEW_PATHS.packages} btn="Browse packages" />;
  if (tab === 'partner') content = (
    <div className="grid g2"><Link className="box" href={VIEW_PATHS['partner-requests']}><h3>Requests &amp; proposals</h3><p className="muted">{ps.req.length} request{ps.req.length === 1 ? '' : 's'} · {ps.book.length} joint booking proposal{ps.book.length === 1 ? '' : 's'}</p><span className="link-arrow">Open {I.arrow}</span></Link>
      <Link className="box" href={VIEW_PATHS['partner-create']}><h3>{ps.me ? 'Your partner profile' : 'Create partner profile'}</h3><p className="muted">{ps.me ? `${ps.me.name} · ${ps.me.status}` : 'Get found by verified travellers going your way.'}</p><span className="link-arrow">{ps.me ? 'Edit' : 'Create'} {I.arrow}</span></Link></div>
  );

  return (
    <>
      <section className="acct-hero"><div className="wrap"><div className="acct-id"><span className="ico-me big">tp</span><div><h1>My Trips</h1><p>{ps.me ? `Hi ${ps.me.name}! ` : ''}Bookings, enquiries and saved trips on this device.</p></div><LoginButton className="btn btn-o">Login / Sign up</LoginButton><Link className="btn btn-ghost py-acct" href={VIEW_PATHS.pay}>{I.wallet} Make a payment</Link></div>
        <div className="acct-tabs" role="tablist">{tabs.map(([k, l, n]) => <button key={k} role="tab" aria-selected={k === tab ? 'true' : 'false'} onClick={() => pick(k)}>{l}{n ? <> <span>{n}</span></> : null}</button>)}</div></div></section>
      <section className="sec-tight"><div className="wrap">{content}{rv.length && tab !== 'wishlist' ? <div style={{ marginTop: '34px' }}><SecHead h="Recently viewed" right={<RailNav id="r-arv" />} /><div className="rail" id="r-arv" style={{ '--cw': '260px' }}>{rv.map(p => <PkgCard key={p.id} p={p} />)}</div></div> : null}</div></section>
    </>
  );
}
