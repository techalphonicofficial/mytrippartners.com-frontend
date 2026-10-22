'use client';
/* Enquiry form ("Get my free quote") + the button that opens it in a modal.
   Saves a copy on the device (My Trips), sends it to the dashboard (with offline outbox) and shows the
   WhatsApp / call follow-up — same markup and behaviour as the original site. */
import { useState } from 'react';
import { useUI } from '@/components/providers/UIProvider';
import { I } from '@/components/icons';
import { DB } from '@/lib/client/storage';
import { send } from '@/lib/client/api';
import { CopyButton } from './buttons';
import { monthOptions } from '@/lib/months';

const PAX = ['1 adult', '2 adults', '2 adults + 1 child', '2 adults + 2 children', '3–5 people', '6–10 people', 'Group (10+)'];
const waLink = (wa, txt) => `https://wa.me/${wa}?text=${encodeURIComponent(txt)}`;

export function LeadSuccess({ name, text, CONFIG }) {
  return (
    <div className="ok"><span className="tick">{I.tick}</span><h3>{`Thanks ${name.split(' ')[0]}, we've received your enquiry`}</h3>
      <p className="muted">A travel expert will call you shortly. For a faster reply, send it on WhatsApp too.</p>
      <a className="btn btn-wa" href={waLink(CONFIG.whatsapp, text)} target="_blank" rel="noopener">{I.wa} Send on WhatsApp</a>
      <div className="copyline">Call: <code>{CONFIG.phone}</code><CopyButton value={CONFIG.phone} /></div>
      <div className="copyline">Email: <code>{CONFIG.email}</code><CopyButton value={CONFIG.email} /></div></div>
  );
}

/* subject: what the enquiry is about; k: id prefix (several forms can be on one page); CONFIG: site contact config */
export function LeadForm({ subject, k = 'm', CONFIG, onSent }) {
  const ui = useUI();
  const [err, setErr] = useState('');
  const onSubmit = e => {
    e.preventDefault();
    const form = e.currentTarget, f = Object.fromEntries(new FormData(form));
    if (!String(f.name || '').trim()) return setErr('Please enter your name.');
    if (!/^[6-9]\d{9}$/.test(String(f.phone || '').replace(/\D/g, '').slice(-10))) return setErr('Please enter a valid 10-digit Indian mobile number.');
    if (f.email && !/^\S+@\S+\.\S+$/.test(f.email)) return setErr('Please check the email address.');
    setErr('');
    const text = `Hi TripPartner, new enquiry:\nTrip: ${subject}\nName: ${f.name}\nMobile: ${f.phone}${f.email ? `\nEmail: ${f.email}` : ''}${f.date ? `\nTravel month: ${f.date}` : ''}\nTravellers: ${f.pax}${f.msg ? `\nNotes: ${f.msg}` : ''}`;
    const lead = { subject, name: f.name, phone: f.phone, email: f.email, month: f.date, pax: f.pax, msg: f.msg };
    DB.addLead(lead);
    send('/leads', { ...lead, source: /^Trip Planner/.test(subject || '') ? 'Plan My Trip' : 'Website enquiry', page: location.pathname });
    ui.openModal(<LeadSuccess name={f.name} text={text} CONFIG={CONFIG} />, 'Enquiry for ' + subject);
    form.reset();
    onSent && onSent(lead);
  };
  return (
    <form className="form" data-lead={subject} noValidate onSubmit={onSubmit}>
      <label>Full name<input id={`${k}-name`} name="name" required autoComplete="name" placeholder="Your name" /></label>
      <div className="row2"><label>Mobile number<input id={`${k}-phone`} name="phone" required inputMode="tel" autoComplete="tel" placeholder="10-digit mobile" /></label><label>Email<input id={`${k}-email`} name="email" type="email" autoComplete="email" placeholder="you@email.com" /></label></div>
      <div className="row2"><label>Travel month<select id={`${k}-date`} name="date"><option value="">Not decided</option>{monthOptions()}</select></label><label>Travellers<select id={`${k}-pax`} name="pax">{PAX.map(x => <option key={x}>{x}</option>)}</select></label></div>
      <label>Anything else? (optional)<textarea id={`${k}-msg`} name="msg" placeholder="Budget, hotel preference, departure city…"></textarea></label>
      <p className="err" aria-live="polite">{err}</p><button className="btn btn-o" type="submit">Get my free quote</button>
      <p className="muted" style={{ fontSize: '12px', textAlign: 'center' }}>By submitting you agree to be contacted by TripPartner about your trip.</p></form>
  );
}

/* <button data-enquire="Kashmir Paradise">…</button> → opens the enquiry form in a modal */
export function EnquireButton({ subject, CONFIG, children, className, title = 'Plan your trip', ...rest }) {
  const ui = useUI();
  return <button type="button" className={className} data-enquire={subject} {...rest} onClick={() => ui.openModal(<LeadForm subject={subject} k="m" CONFIG={CONFIG} />, title, subject)}>{children}</button>;
}
