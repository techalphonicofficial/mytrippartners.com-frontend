'use client';
/* "Send us your video" form on the videos page (legacy <form data-lead="Traveller video submission"> handled by onLead):
   validates, saves a device copy (My Trips), sends the lead to the dashboard and shows the WhatsApp follow-up. */
import { useState } from 'react';
import { useUI } from '@/components/providers/UIProvider';
import { LeadSuccess } from '@/components/ui/LeadForm';
import { DB } from '@/lib/client/storage';
import { send } from '@/lib/client/api';

const SUBJECT = 'Traveller video submission';

export default function UgcForm({ CONFIG }) {
  const ui = useUI();
  const [err, setErr] = useState('');
  const onSubmit = e => {
    e.preventDefault();
    const form = e.currentTarget, f = Object.fromEntries(new FormData(form));
    if (!String(f.name || '').trim()) return setErr('Please enter your name.');
    if (!/^[6-9]\d{9}$/.test(String(f.phone || '').replace(/\D/g, '').slice(-10))) return setErr('Please enter a valid 10-digit Indian mobile number.');
    if (f.email && !/^\S+@\S+\.\S+$/.test(f.email)) return setErr('Please check the email address.');
    setErr('');
    const text = `Hi TripPartner, new enquiry:\nTrip: ${SUBJECT}\nName: ${f.name}\nMobile: ${f.phone}${f.email ? `\nEmail: ${f.email}` : ''}${f.date ? `\nTravel month: ${f.date}` : ''}\nTravellers: ${f.pax}${f.msg ? `\nNotes: ${f.msg}` : ''}`;
    const lead = { subject: SUBJECT, name: f.name, phone: f.phone, email: f.email, month: f.date, pax: f.pax, msg: f.msg };
    DB.addLead(lead);
    send('/leads', { ...lead, source: 'Website enquiry', page: location.pathname });
    ui.openModal(<LeadSuccess name={f.name} text={text} CONFIG={CONFIG} />, 'Enquiry for ' + SUBJECT);
    form.reset();
  };
  return (
    <form className="form" data-lead={SUBJECT} noValidate onSubmit={onSubmit}><label>Your name<input name="name" id="ugc-name" required autoComplete="name" /></label><label>Mobile<input name="phone" id="ugc-phone" inputMode="tel" required /></label><input type="hidden" name="email" defaultValue="" /><input type="hidden" name="date" defaultValue="" /><input type="hidden" name="pax" defaultValue="Video submission" /><label>Trip &amp; video link (Google Drive, Instagram or YouTube)<textarea name="msg" id="ugc-msg" placeholder="e.g. Kerala, March — https://…"></textarea></label><p className="err" aria-live="polite">{err}</p><button className="btn btn-o">Submit video</button></form>
  );
}
