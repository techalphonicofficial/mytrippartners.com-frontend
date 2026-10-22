/* Travel Partner presentational blocks (server-safe, no hooks): partnerHero, safetyBlock, pAvatar, matchPill. */
import Link from 'next/link';
import { I } from '@/components/icons';
import { img } from '@/lib/format';
import { VIEW_PATHS } from '@/lib/routes';
import { hueOf, initials } from '@/lib/partner/core';

/* page hero of the partner views; crumb = last breadcrumb (omitted on the landing page) */
export function PartnerHero({ title, lead, crumb }) {
  return (
    <section className="page-hero partner-hero"><div className="ph-bg" style={{ backgroundImage: `url(${img('group-lake')})` }}></div><div className="wrap"><div><nav className="crumbs"><Link href="/">Home</Link><span>/</span>{crumb ? <><Link href={VIEW_PATHS.partner}>Travel Partner</Link><span>/</span><span>{crumb}</span></> : <span>Travel Partner</span>}</nav><span className="eyebrow">New · Travel Partner</span><h1>{title}</h1><p className="lead">{lead}</p></div>
      <div className="ph-gal"><img src={img('group-lake')} alt="Travellers at a mountain lake" decoding="async" /><img src={img('th-honeymoon')} alt="" decoding="async" /><img src={img('trek')} alt="" decoding="async" /></div></div></section>
  );
}

const SAFETY = [
  ['shield', '18+ and ID-verified', 'Government ID and phone verification before a profile goes live.'],
  ['users', 'Mutual consent', 'Requests, chats, shared rooms and bookings need both travellers to agree.'],
  ['mail', 'Private contact details', 'Numbers and emails stay hidden until you choose to share them.'],
  ['headset', '24×7 SOS support', 'One-tap help line during the trip, with live trip tracking by our team.'],
  ['star', 'Women-only filter', 'Women can choose to be visible to, and match with, women only.'],
  ['xmark', 'Report & block', 'Block anyone instantly. Reports are reviewed within 24 hours.']];

export function SafetyBlock() {
  return (
    <section className="sec-tight" id="safety"><div className="wrap"><div className="safety">
      <div className="sf-intro"><span className="eyebrow" style={{ color: 'var(--sun)' }}>Safety centre</span><h2>Safety comes first, for every traveller</h2><p>We built Travel Partner with women travellers in mind. These rules apply to every member and every trip.</p><Link className="btn btn-o" href={VIEW_PATHS['partner-safety']}>Read safety guidelines</Link></div>
      <div className="sf-grid">{SAFETY.map(([i, t, x]) => <div key={t}><span>{I[i]}</span><b>{t}</b><p>{x}</p></div>)}</div>
    </div></div></section>
  );
}

/* profile avatar with photo or initials and the "ID verified" tick (pAvatar); photo = b.photo or my own photo */
export function PAvatar({ b, size, photo }) {
  const ph = photo !== undefined ? photo : (b.photo || ''), verified = !!(b.ver && b.ver.includes('ID'));
  return (
    <span className={`pav ${size || ''} ${verified ? 'ver' : ''}`} aria-hidden="true">{ph ? <img src={ph} alt="" decoding="async" /> : <span className="pa-ini" style={{ '--h': hueOf(b.id) }}>{initials(b.name)}</span>}{verified ? <i title="ID verified">{I.check}</i> : null}</span>
  );
}

export function MatchPill({ n }) {
  if (n == null) return null;
  return <span className={`mt-pill ${n >= 75 ? 'hi' : n >= 55 ? 'mid' : ''}`} title="Compatibility based on your preferences">{n}% match</span>;
}
