'use client';
/* "Login / Create account" modal (accounts are not live yet: explains that and links to My Trips). */
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useUI } from '@/components/providers/UIProvider';
import { I } from '@/components/icons';
import { VIEW_PATHS } from '@/lib/routes';

function LoginForm() {
  const ui = useUI(), [err, setErr] = useState(''), [done, setDone] = useState(false);
  if (done) return <div className="ok"><span className="tick">{I.tick}</span><h3>Accounts are launching soon</h3><p className="muted">Online sign-in isn&apos;t live yet. Your wishlist is saved on this device in the meantime, and our team can help with any booking.</p><button className="btn btn-o" onClick={ui.closeModal}>OK</button></div>;
  return (
    <form className="form" id="loginf" noValidate onSubmit={e => { e.preventDefault(); const v = e.currentTarget.elements['login-id'].value.trim(); if (!v) return setErr('Please enter your mobile number or email.'); setDone(true); }}>
      <label>Mobile number or email<input id="login-id" name="login-id" required placeholder="Enter mobile or email" /></label><p className="err" aria-live="polite">{err}</p><button className="btn btn-o">Continue with OTP</button>
      <p className="muted" style={{ fontSize: '13px', textAlign: 'center' }}>New here? Continuing creates your TripPartner account.</p><Link className="btn btn-ghost" href={VIEW_PATHS.account} onClick={ui.closeModal}>View My Trips on this device</Link></form>
  );
}

export default function LoginFeature() {
  const ui = useUI();
  useEffect(() => ui.register('login', () => ui.openModal(<LoginForm />, 'Login or Create Account', 'Save trips, track bookings and get member offers')), [ui]);
  return null;
}
