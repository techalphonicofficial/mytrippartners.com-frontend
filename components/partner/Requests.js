'use client';
/* "My requests & bookings" (original requestsPage + the partner2.js shortlist tab). Everything here is device
   state (tp_partner), so the server render shows the empty state, as the original did for a first visit.
   ?tab=fav scrolls to the shortlist. */
import { useEffect } from 'react';
import Link from 'next/link';
import { useUI } from '@/components/providers/UIProvider';
import { I } from '@/components/icons';
import { img, inr } from '@/lib/format';
import { VIEW_PATHS } from '@/lib/routes';
import { ID_TYPES, PAY_LABEL, matchScore, bookHref } from '@/lib/partner/core';
import { PS } from '@/lib/partner/state';
import { usePData, usePS, usePrefs, BuddyCard } from './client';
import { PAvatar } from './blocks';
import Avatar from './Avatar';

export default function Requests({ tab }) {
  const pd = usePData(), st = usePS(), pr = usePrefs(), ui = useUI();
  const B = id => pd.buddies.find(b => b.id === id), P = id => pd.pkgs.find(p => p.id === id);
  useEffect(() => { if (tab !== 'fav') return; const t = setTimeout(() => { const s = document.getElementById('shortlist'); if (s) s.scrollIntoView({ behavior: 'smooth' }); }, 350); return () => clearTimeout(t); }, [tab]);
  const fav = (st.fav || []).map(B).filter(Boolean).map(b => ({ ...b, _m: matchScore(b, pr) }));
  const me = st.me;
  const accept = id => { const s = PS.get(); PS.set({ ...s, req: s.req.map(x => (x.id === id ? { ...x, status: 'Accepted' } : x)) }); ui.toast('Preview: request marked accepted'); };
  const rowBox = { display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap' };
  return (
    <section className="sec"><div className="wrap" style={{ display: 'grid', gap: '22px' }}>
      {me ? <div className="box p2-me"><PAvatar b={{ id: 'me', name: me.name, ver: [] }} size="lg" photo={me.photo || ''} /><div><b>{me.name}, {me.age}</b><small className="muted">{me.city} · {me.idType ? `ID: ${(ID_TYPES.find(x => x[0] === me.idType) || ['', ''])[1]} ••••${me.idLast4 || ''}` : 'ID not added'}</small></div><span className="rstat">{me.status}</span><Link className="link-arrow" href={VIEW_PATHS['partner-create']} style={{ marginLeft: 'auto' }}>Edit profile {I.arrow}</Link></div>
        : <div className="box" style={rowBox}><span>You haven&apos;t created a Travel Partner profile yet.</span><Link className="btn btn-o btn-sm" href={VIEW_PATHS['partner-create']} style={{ marginLeft: 'auto' }}>Create profile</Link></div>}
      <div className="box" id="shortlist"><h2>Shortlisted partners</h2>{fav.length ? <div className="grid g3">{fav.map(b => <BuddyCard key={b.id} b={b} />)}</div> : <p className="muted">Tap ♥ on any traveller to shortlist them. <Link href={VIEW_PATHS.partner} style={{ color: 'var(--blue)' }}>Find a travel partner</Link>.</p>}</div>
      <div className="box"><h2>Partner requests</h2>{st.req.length ? st.req.map(r => {
        const b = B(r.b) || { name: 'Traveller', id: r.b, style: '' }, p = P(r.trip);
        return <div key={r.id} className="rq"><Avatar b={b} /><div className="rq-b"><b>{b.name}</b><small className="muted">{p ? p.title : 'Trip not decided'} · {r.month} · {r.seat ? 'Seats together' : 'Any seats'} · {r.room === 'shared' ? 'Open to shared room' : 'Separate rooms'}</small>{r.msg ? <p>“{r.msg}”</p> : null}</div><span className={`rstat ${r.status === 'Accepted' ? 'ok' : ''}`}>{r.status}</span>
          {r.status === 'Accepted' ? <Link className="btn btn-o btn-sm" href={bookHref({ b: r.b, p: r.trip })}>Book together</Link> : pd.demo ? <button className="btn btn-ghost btn-sm" title="Preview only" onClick={() => accept(r.id)}>Preview: accepted</button> : null}</div>;
      }) : <p className="muted">No requests yet. <Link href={VIEW_PATHS.partner} style={{ color: 'var(--blue)' }}>Find a travel partner</Link>.</p>}</div>
      <div className="box"><h2>Joint booking proposals</h2>{st.book.length ? st.book.map(x => {
        const b = B(x.b), p = P(x.pkg) || { title: x.pkg, img: 'group-lake' };
        return <div key={x.id} className="rq"><img src={img(p.img)} alt="" className="rq-img" decoding="async" /><div className="rq-b"><b>{p.title}</b><small className="muted">With {b ? b.name : 'your partner'} · {x.month} · {x.room === 'shared' ? 'Shared room' : 'Separate rooms'} · {PAY_LABEL[x.pay]}</small><p className="num">Total {inr(x.total)} · You {inr(x.you)} · Partner {inr(x.them)}</p></div><span className="rstat">{x.status}</span></div>;
      }) : <p className="muted">No proposals yet. <Link href={VIEW_PATHS['partner-book']} style={{ color: 'var(--blue)' }}>Book a trip together</Link>.</p>}</div>
      {pd.demo ? <p className="muted" style={{ fontSize: '12.5px' }}>Preview mode: requests and proposals are stored only in this browser. After launch they sync to your TripPartner account.</p> : null}
    </div></section>
  );
}
