/* /travel-partner/ — find a travel partner (original partnerPage + partnerInit, partner2.js). */
import Link from 'next/link';
import { getSite } from '@/lib/site';
import { viewMetadata } from '@/lib/seo';
import { img } from '@/lib/format';
import { PATHS, VIEW_PATHS } from '@/lib/routes';
import { I } from '@/components/icons';
import { SecHead } from '@/components/ui/cards';
import { partnerData, buddyDestIds } from '@/lib/partner/core';
import { PAvatar, SafetyBlock } from '@/components/partner/blocks';
import { PartnerData, MatchButton } from '@/components/partner/client';
import Browse from '@/components/partner/Browse';

export async function generateMetadata() { const S = await getSite(); return viewMetadata(S, VIEW_PATHS.partner, 'Find a Travel Partner'); }

const one = v => (Array.isArray(v) ? v[0] : v) || '';
const HOW = [['Create a verified profile', 'Add your photo, travel style and trips. Verify phone, government ID and a selfie (18+ only).'], ['Search your way', 'By destination, month, package, interest, city or women-only — with a match score.'], ['Match & chat safely', 'Contact details stay hidden. Chat opens only after both accept.'], ['Plan & book together', 'Pick a package, choose seats together, and decide shared or separate rooms.'], ['Pay your way', 'Pay for both, split 50/50, or book individually. Travel with 24×7 support.']];
const VSTEPS = [['phone', 'Mobile OTP', 'Confirms your number (kept private).'], ['passport', 'Government ID', 'Aadhaar (masked), PAN, passport, driving licence or voter ID — we see only the last 4 digits.'], ['users', 'Selfie match', 'A live selfie is matched to your ID photo by our team.'], ['star', 'Profile photo', 'Shown to members — or only after you accept a request, your choice.'], ['shield', 'Documents deleted', 'ID images are deleted once your profile is approved or rejected.']];
const MODES = ['smart', 'dest', 'month', 'trip', 'interest', 'city', 'women'];

export default async function Page({ searchParams }) {
  const sp = await searchParams, S = await getSite(), C = S.CONFIG, B = S.BUDDIES;
  const g = one(sp.g), mode = one(sp.mode);
  const preset = { g: ['Female', 'Male'].includes(g) ? g : '', women: one(sp.women) === '1', d: S.D(one(sp.d)) ? one(sp.d) : '', m: one(sp.m), mode: MODES.includes(mode) ? mode : '' };
  const pkey = [preset.g, preset.women, preset.d, preset.m, preset.mode].join('|');
  const nVer = B.filter(b => b.ver.includes('ID')).length, destIds = buddyDestIds(B);
  const dn = id => { const d = S.D(id); return d ? (d.short || d.name) : id; };
  const hero = B.filter(b => b.g === 'Female').slice(0, 2).concat(B.filter(b => b.g === 'Male').slice(0, 2));
  return (
    <PartnerData value={partnerData(S)}>
      <section className="page-hero partner-hero p2-hero"><div className="ph-bg" style={{ backgroundImage: `url(${img('group-lake')})` }}></div><div className="wrap"><div><nav className="crumbs"><Link href="/">Home</Link><span>/</span><span>Travel Partner</span></nav><span className="eyebrow">TripPartner signature service</span>
        <h1>Find your travel partner</h1><p className="lead">Meet ID-verified travellers going where you want to go. Search your way — by destination, month, trip, interest or city — send a request, and book the same trip together.</p>
        <div className="p2-stats"><span><b className="num">{B.length}</b>{C.demo ? 'sample ' : ''}travellers</span><span><b className="num">{nVer}</b>ID verified</span><span><b className="num">{destIds.length}</b>destinations</span><span><b>24×7</b>SOS support</span></div>
        <div className="btns" style={{ marginTop: '18px' }}><Link className="btn btn-o" href={VIEW_PATHS['partner-create']}>{I.users} Create your profile</Link><MatchButton className="btn btn-ghost p2-ghost">{I.star} Smart match quiz</MatchButton></div></div>
        <div className="p2-hero-cards">{hero.map(b => <Link key={b.id} className="p2-hc" href={PATHS.buddy(b.id)}><PAvatar b={b} size="sm" /><span><b>{b.name}, {b.age}</b><small>{dn(b.trips[0][0])} · {b.trips[0][1]}</small></span>{I.shield}</Link>)}{C.demo ? <small className="p2-sample">Sample profiles for preview</small> : null}</div></div></section>

      <Browse preset={preset} pkey={pkey} match={one(sp.match) === '1'} />

      <section className="sec-tight"><div className="wrap">
        <SecHead h="How Travel Partner works" p="From first hello to the same trip, in five steps" />
        <div className="how five">{HOW.map(([t, x], i) => <div key={t}><span className="how-n">{i + 1}</span><h4>{t}</h4><p>{x}</p></div>)}</div>
      </div></section>

      <section className="sec-tight"><div className="wrap"><div className="p2-verify">
        <div><span className="eyebrow">Trust &amp; verification</span><h2>Every profile is checked by a real person</h2><p>Photos help you recognise each other; ID proof keeps the community genuine. Your documents are for verification only — never shown to other members.</p><Link className="btn btn-o" href={`${VIEW_PATHS['partner-create']}?verify=1`}>Verify my profile</Link></div>
        <ol className="p2-vsteps">{VSTEPS.map(([ic, t, x]) => <li key={t}><span>{I[ic]}</span><b>{t}</b><p>{x}</p></li>)}</ol>
      </div></div></section>

      <section className="sec-tight" id="pay-options"><div className="wrap">
        <SecHead h="Book together, your way" p="Every option works on every TripPartner package" />
        <div className="grid g3 optcards">
          <div className="box"><span className="oc-ico">{I.wallet}</span><h3>Pay options</h3><ul className="checks"><li>{I.check}<span><b>One pays for both</b> — you or your partner books for two</span></li><li>{I.check}<span><b>Split 50/50</b> — two payment links, one booking</span></li><li>{I.check}<span><b>Book individually</b> — separate bookings on the same departure</span></li></ul></div>
          <div className="box"><span className="oc-ico">{I.plane}</span><h3>Seats together</h3><ul className="checks"><li>{I.check}<span>Adjacent seats on flights, trains and buses (subject to availability)</span></li><li>{I.check}<span>Same cab or coach for all transfers and sightseeing</span></li><li>{I.check}<span>Same itinerary, same guide, same timings</span></li></ul></div>
          <div className="box"><span className="oc-ico">{I.bed}</span><h3>Stay: shared or separate</h3><ul className="checks"><li>{I.check}<span><b>Shared room</b> only when <u>both</u> travellers agree</span></li><li>{I.check}<span><b>Separate rooms</b> any time, with single-room supplement</span></li><li>{I.check}<span>Switch from shared to separate until final payment</span></li></ul></div>
        </div>
      </div></section>

      <SafetyBlock />

      <section className="sec-tight"><div className="wrap layout"><div className="box faq"><h2>Travel Partner FAQs</h2>{[...S.PFAQ, ...S.PFAQ2].map(([q, a], i) => <details key={i} open={i === 0}><summary>{q}</summary><p>{a}</p></details>)}</div>
        <aside className="side"><div className="box" style={{ background: 'var(--char)', color: '#fff', border: '0' }}><h3>Ready to travel together?</h3><p style={{ color: '#ccc', fontSize: '14px', marginBottom: '14px' }}>Create your profile in 2 minutes.</p><Link className="btn btn-o" style={{ width: '100%' }} href={VIEW_PATHS['partner-create']}>Create profile</Link><Link className="btn btn-ghost" style={{ width: '100%', marginTop: '10px', color: '#fff', borderColor: '#555' }} href={VIEW_PATHS['partner-book']}>Book with a partner</Link></div></aside></div></section>
    </PartnerData>
  );
}
