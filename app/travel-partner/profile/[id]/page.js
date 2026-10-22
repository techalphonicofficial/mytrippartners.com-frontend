/* /travel-partner/profile/<id>/ — a traveller's profile (original buddyPage, partner2.js). */
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getSite } from '@/lib/site';
import { viewMetadata } from '@/lib/seo';
import { img, dname } from '@/lib/format';
import { PATHS, VIEW_PATHS } from '@/lib/routes';
import { I } from '@/components/icons';
import { SecHead } from '@/components/ui/cards';
import { RailNav } from '@/components/ui/buttons';
import { HelpBox } from '@/components/ui/boxes';
import { partnerData, firstName, bookHref } from '@/lib/partner/core';
import { PAvatar } from '@/components/partner/blocks';
import { PartnerData, RequestButton, ShareProfileButton } from '@/components/partner/client';
import { ProfileCta, MatchBox, SimilarCards } from '@/components/partner/Profile';

export const dynamicParams = true;
export async function generateStaticParams() { return []; }
export async function generateMetadata({ params }) {
  const { id } = await params; const S = await getSite(); const b = S.B(id);
  return viewMetadata(S, PATHS.buddy(id), `${b ? b.name : 'Traveller'} · Travel Partner`);
}

export default async function Page({ params }) {
  const { id } = await params; const S = await getSite(); const b = S.B(id); if (!b) notFound();
  const C = S.CONFIG, fn = firstName(b.name), d0 = S.D(b.trips[0][0]) || { img: 'group-lake' };
  const similar = S.BUDDIES.filter(x => x.id !== b.id && (x.trips.some(t => b.trips.some(u => u[0] === t[0])) || x.style.split(' · ')[0] === b.style.split(' · ')[0])).slice(0, 6);
  const rows = [['Gender', b.g], ['Age', b.age], ['Lives in', b.city], ['Travelling from', b.from || b.city], ['Languages', b.lang.join(', ')], ['Budget', b.bud || '—'], ['Pace', b.pace || '—'], ['Food', b.diet || '—'], ['Smoking', b.smoke ? 'Smoker' : 'Non-smoker'], ['Drinking', b.drink || '—'], ['Member since', b.joined || '2026'], ['Response', b.resp]];
  const ver = [['Phone', b.ver.includes('Phone'), 'Mobile number verified by OTP'], ['ID', b.ver.includes('ID'), 'Government ID checked by our team'], ['Selfie', !!b.selfie, 'Live selfie matched to the ID photo'], ['Email', b.ver.includes('Email'), 'Email address confirmed']];
  return (
    <PartnerData value={partnerData(S)}>
      <section className="bp2-hero" style={{ '--bg': `url(${img(d0.img)})` }}><div className="wrap"><nav className="crumbs"><Link href="/">Home</Link><span>/</span><Link href={VIEW_PATHS.partner}>Travel Partner</Link><span>/</span><span>{b.name}</span></nav>
        <div className="bp2-id"><PAvatar b={b} size="xl" /><div><span className="eyebrow">{C.demo ? 'Sample profile · ' : ''}Travel partner</span><h1>{b.name}, {b.age}</h1><p>{b.g} · {b.city} · {b.style}</p>
          <div className="vbadges">{b.ver.map(v => <span key={v}>{I.shield}{v} verified</span>)}{b.selfie ? <span>{I.check}Selfie matched</span> : null}{b.womenOnly ? <span className="wo">{I.shield}Women-only circle</span> : null}</div></div>
          <ProfileCta b={b} /></div></div></section>
      <section className="sec"><div className="wrap layout"><div style={{ display: 'grid', gap: '22px', minWidth: '0' }}>
        <div className="box"><h2>About {fn}</h2><p>{b.about}</p><h3 style={{ marginTop: '14px' }}>Interests</h3><div className="pchips">{b.int.map(x => <button key={x} type="button" className="on" tabIndex={-1}>{x}</button>)}</div></div>
        <div className="box"><h2>Travel habits &amp; details</h2><dl className="bp2-dl">{rows.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl></div>
        <div className="box"><h2>Planned trips</h2><div className="bp2-trips">{b.trips.map(([d, mo]) => { const dd = S.D(d) || { id: d, name: d, img: 'group-lake' }; const pks = S.pkgsOf(d).slice(0, 2); return <div key={d + mo} className="bp2-trip"><img loading="lazy" src={img(dd.img)} alt="" decoding="async" /><div><b>{dname(dd)}</b><small>{mo}</small>{pks.map(pk => <Link key={pk.id} className="link-arrow" href={PATHS.pkg(pk.id)}>{pk.title} {I.arrow}</Link>)}<RequestButton b={b} className="btn btn-o btn-sm">Join {fn} here</RequestButton></div></div>; })}</div></div>
        <MatchBox b={b} />
        <div className="box"><h2>Verification</h2><ul className="bp2-ver">{ver.map(([t, ok, x]) => <li key={t} className={ok ? 'ok' : ''}><span>{ok ? I.check : I.clock}</span><div><b>{`${t} ${ok ? 'verified' : 'pending'}`}</b><small>{x}</small></div></li>)}</ul><p className="muted" style={{ fontSize: '12.5px', marginTop: '10px' }}>Documents are seen only by TripPartner&apos;s verification team and are never shared with members.</p></div>
        <div className="box"><h2>Before you travel together</h2><ul className="checks"><li>{I.check}<span>Chat on TripPartner first and do a video call before booking.</span></li><li>{I.check}<span>Agree on budget, room choice and daily plan in writing in the chat.</span></li><li>{I.check}<span>Never send money directly to another member; pay only through TripPartner.</span></li><li>{I.check}<span>Share your trip details with family; our 24×7 team tracks every departure.</span></li></ul></div>
        {similar.length ? <div><SecHead h="Similar travellers" p="Going to the same places or with the same style" right={<RailNav id="r-sim" />} /><div className="rail" id="r-sim" style={{ '--cw': '300px' }}><SimilarCards ids={similar.map(x => x.id)} /></div></div> : null}
      </div><aside className="side"><div className="box"><h3>Travel with {fn}</h3><p className="muted" style={{ fontSize: '14px', marginBottom: '12px' }}>Send a request. Chat opens when {fn} accepts. Contact details stay private.</p><RequestButton b={b} className="btn btn-o" style={{ width: '100%' }}>Send partner request</RequestButton><Link className="btn btn-ghost" style={{ width: '100%', marginTop: '10px' }} href={bookHref({ b: b.id })}>Plan a joint booking</Link>
        <div className="bp2-act"><ShareProfileButton /><Link href={VIEW_PATHS['partner-safety']}>{I.xmark} Report or block</Link></div></div><HelpBox CONFIG={C} /></aside></div></section>
    </PartnerData>
  );
}
