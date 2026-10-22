'use client';
/* Device-dependent parts of a traveller's profile page (original buddyPage, partner2.js):
   match % + actions in the hero, "Why you match" / quiz box, similar travellers with their match %. */
import Link from 'next/link';
import { I } from '@/components/icons';
import { matchScore, firstName, bookHref } from '@/lib/partner/core';
import { usePData, usePrefs, BuddyCard, RequestButton, FavButton, MatchButton } from './client';
import { MatchPill } from './blocks';


export function ProfileCta({ b }) {
  const pr = usePrefs();
  return (
    <div className="bp2-cta"><MatchPill n={matchScore(b, pr)} /><RequestButton b={b} className="btn btn-o">Send partner request</RequestButton><Link className="btn btn-ghost bp2-g" href={bookHref({ b: b.id })}>Plan a joint booking</Link><FavButton b={b} big /></div>
  );
}

export function MatchBox({ b }) {
  const pd = usePData(), pr = usePrefs(), fn = firstName(b.name);
  if (!pr) return <div className="box p2-quiz-cta"><div><h3>See how well you match with {fn}</h3><p className="muted">Answer 7 quick questions about your trip.</p></div><MatchButton className="btn btn-o">{I.star} Smart match</MatchButton></div>;
  const m = matchScore(b, pr), dn = id => (pd.dests[id] || { n: id }).n;
  const why = [
    [b.trips.some(t => t[0] === pr.dest), pr.dest ? `Both going to ${dn(pr.dest)}` : 'Destination open'],
    [b.trips.some(t => t[1] === pr.month), pr.month && pr.month !== 'Flexible' ? `Same month (${pr.month})` : 'Flexible dates'],
    [(pr.styles || []).some(s => (b.style + ' ' + b.int.join(' ')).toLowerCase().includes(s.toLowerCase())), 'Similar travel style'],
    [pr.bud === b.bud, pr.bud ? 'Same budget band' : 'Budget flexible'],
    [pr.pace === b.pace, pr.pace ? 'Same pace' : 'Pace flexible']];
  return (
    <div className="box"><h2>Why you match <MatchPill n={m} /></h2><ul className="bp2-why">{why.map(([ok, t]) => <li key={t} className={ok ? 'ok' : ''}>{ok ? I.check : I.xmark}<span>{t}</span></li>)}</ul><MatchButton className="link-arrow" style={{ background: 'none', border: '0', padding: '0', marginTop: '8px' }}>Update my preferences {I.arrow}</MatchButton></div>
  );
}

export function SimilarCards({ ids }) {
  const pd = usePData(), pr = usePrefs();
  return ids.map(id => { const x = pd.buddies.find(b => b.id === id); return <BuddyCard key={id} b={{ ...x, _m: matchScore(x, pr) }} />; });
}

