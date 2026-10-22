'use client';
/* Payment receipt for a verified proof (original payproof.js receiptPage), from the booking saved on this device. */
import { useEffect } from 'react';
import Link from 'next/link';
import { inr, fmtDate } from '@/lib/format';
import { PATHS } from '@/lib/routes';
import { useDeviceDB, useMounted } from '@/lib/client/hooks';
import { payCalc, payMask, inrWords } from '@/lib/booking/calc';
import { payFetch, payLocal } from '@/lib/booking/device';

/* bookingRef, pf: from the URL; pkgs: { id → { title } }; CONFIG: { phone, email, address }; sample: CONFIG.pay.sample */
export default function Receipt({ bookingRef, pf, pkgs, CONFIG, sample }) {
  const db = useDeviceDB(), mounted = useMounted();
  /* device copy not verified yet: ask the backend once (the receipt link may be opened before My Trips refreshed) */
  useEffect(() => { const l = payLocal(bookingRef); if (l && l.phone && !(l.proofs || []).some(p => p.id === pf && p.status === 'Approved')) payFetch(bookingRef, l.phone, id => !!pkgs[id]).catch(() => {}); }, [bookingRef, pf, pkgs]);
  if (!mounted) return null;
  const b = db.bookings.find(x => x.ref === bookingRef); const x = b && (b.proofs || []).find(p => p.id === pf && p.status === 'Approved');
  if (!b || !x) return <div className="box" style={{ maxWidth: '640px', margin: 'auto' }}><h2>Receipt not available</h2><p className="muted">Receipts appear once our team verifies the payment. Open the booking to check its status.</p><div className="pl-nav"><Link className="btn btn-o" href={PATHS.pay(bookingRef)}>Open booking</Link></div></div>;
  const p = pkgs[b.pkg] || { title: b.pkgTitle || b.pkg }, amt = +x.approved || +x.amount, c = payCalc(b);
  return (
    <article className="box py-rc" id="py-rc"><header><img src="/img/logo-new.png" alt="TripPartner" width="170" height="45" /><div><h2>Payment receipt</h2><p className="num">{x.receipt}</p></div></header>
      <div className="py-rc-amt"><small>Amount received</small><b className="num">{inr(amt)}</b><em>Rupees {inrWords(amt)} only</em></div>
      <dl className="py-dl py-rc-dl"><dt>Received from</dt><dd>{x.payer || b.name || ''}</dd><dt>Booking reference</dt><dd className="num">{b.ref}</dd><dt>Package</dt><dd>{p.title}</dd>{b.date ? <><dt>Departure</dt><dd>{fmtDate(b.date)}</dd></> : null}<dt>Payment mode</dt><dd>{x.mode}{x.app ? ' · ' + x.app : ''}</dd><dt>Transaction ID / UTR</dt><dd className="num">{payMask(x.utr)}</dd><dt>Payment date</dt><dd>{fmtDate(x.paidAt)}</dd><dt>Verified on</dt><dd>{x.decidedAt ? new Date(x.decidedAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' }) : '—'}</dd></dl>
      <dl className="py-dl py-rc-tot"><dt>Trip total</dt><dd className="num">{inr(c.total)}</dd><dt>Total paid to date</dt><dd className="num">{inr(c.paid)}</dd><dt><b>Balance due</b></dt><dd className="num"><b>{inr(Math.max(0, c.total - c.paid))}</b></dd></dl>
      <p className="py-rc-f">This is an acknowledgement of payment received, not a tax invoice. A GST invoice is issued separately. {sample ? <b>Sample receipt — preview data.</b> : null}<br />TripPartner · {CONFIG.address} · {CONFIG.phone} · {CONFIG.email}</p>
      <div className="pl-nav py-noprint"><Link className="btn btn-ghost" href={PATHS.pay(b.ref)}>Back to booking</Link><button type="button" className="btn btn-o" onClick={() => print()}>Print / save as PDF</button></div></article>
  );
}
