'use client';
/* Create / edit my Travel Partner profile with photo and identity proof (original partnerCreatePage +
   partnerCreateInit, partner2.js). The profile goes to POST /partners, then photo + ID images to
   POST /partners/:id/docs. ID images live only in memory (PV), never in localStorage.
   ?verify=1 scrolls to the photo / verification steps. */
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useUI } from '@/components/providers/UIProvider';
import { I } from '@/components/icons';
import { img } from '@/lib/format';
import { PATHS, VIEW_PATHS } from '@/lib/routes';
import { monthOptions, nextMonths } from '@/lib/months';
import { useMounted } from '@/lib/client/hooks';
import { post } from '@/lib/client/api';
import { STYLES, BUDS, PACES, DIETS, ID_TYPES } from '@/lib/partner/core';
import { PS, PV, fileToJpeg } from '@/lib/partner/state';
import { usePData } from './client';

const DOCS = [['idFront', 'ID — front side', 'JPG or PNG, clear and readable'], ['idBack', 'ID — back side', 'Optional for PAN / passport photo page'], ['selfie', 'Live selfie', 'Hold your ID next to your face', 'user']];

export default function CreateForm({ verify, aside }) {
  const m = useMounted(), me = m ? PS.get().me : null;
  /* first render = empty form (as on the server); after mount it is rebuilt with my saved profile, if any */
  return <Form key={me ? 'c' : 's'} me={me || {}} verify={verify && m} aside={aside} />;
}

function Form({ me, verify, aside }) {
  const pd = usePData(), ui = useUI(), form = useRef(null);
  const read = () => { const f = form.current, v = id => (f.querySelector('#' + id) || { value: '' }).value.trim(); return { name: v('pc-name'), g: v('pc-g'), age: v('pc-age'), city: v('pc-city'), dest: v('pc-dest'), month: v('pc-month'), bud: v('pc-bud'), pace: v('pc-pace'), diet: v('pc-diet') }; };
  const [vals, setVals] = useState(() => ({ name: me.name || '', g: me.g || 'Female', age: String(me.age || ''), city: me.city || '', dest: me.dest || pd.destOrder[0], month: me.month || nextMonths()[0], bud: me.bud || BUDS[0], pace: me.pace || PACES[0], diet: me.diet || DIETS[0] }));
  const [styles, setStyles] = useState(() => (me.styles || []).slice());
  const [photo, setPhoto] = useState(me.photo || '');
  const [docs, setDocs] = useState({ idFront: '', idBack: '', selfie: '' });
  const [err, setErr] = useState(''), [busy, setBusy] = useState(false);
  useEffect(() => { PV.idFront = PV.idBack = PV.selfie = ''; }, []);
  useEffect(() => { if (!verify) return; const t = setTimeout(() => { const h = document.getElementById('pc-photo-h'); if (h) window.scrollTo({ top: h.getBoundingClientRect().top + scrollY - 170, behavior: 'smooth' }); }, 60); return () => clearTimeout(t); }, [verify]);

  const onInput = () => setVals(read());
  const toggleStyle = s => { const on = !styles.includes(s); if (on && styles.length >= 3) return ui.toast('Pick up to 3 styles'); setStyles(on ? [...styles, s] : styles.filter(x => x !== s)); };
  const onPhoto = async e => { const inp = e.target; try { setPhoto(await fileToJpeg(inp.files[0], 480, true)); } catch (er) { ui.toast(er.message); } inp.value = ''; };
  const onDoc = k => async e => { const inp = e.target; try { const d = await fileToJpeg(inp.files[0], 1400, false); PV[k] = d; setDocs(x => ({ ...x, [k]: d })); } catch (er) { ui.toast(er.message); } inp.value = ''; };
  const rmDoc = k => { PV[k] = ''; setDocs(x => ({ ...x, [k]: '' })); };
  const styleOrder = () => STYLES.filter(s => styles.includes(s));

  const onSubmit = async e => {
    e.preventDefault(); const f = form.current, v = id => (f.querySelector('#' + id) || { value: '' }).value.trim(), chk = id => f.querySelector('#' + id).checked;
    const scrollTo = id => document.getElementById(id).scrollIntoView({ behavior: 'smooth', block: 'center' });
    if (!v('pc-name')) return setErr('Please enter your first name.');
    if (!(+v('pc-age') >= 18)) return setErr('Travel Partner is for adults 18 and above.');
    if (!v('pc-city')) return setErr('Please enter your city.');
    if (!/^[6-9]\d{9}$/.test(v('pc-phone').replace(/\D/g, '').slice(-10))) return setErr('Please enter a valid 10-digit mobile number.');
    if (!photo) { scrollTo('pc-photo-h'); return setErr('Please add a profile photo (step 2).'); }
    if (!/^[0-9A-Za-z]{4}$/.test(v('pc-idlast'))) { scrollTo('pc-verify'); return setErr('Please enter the last 4 characters of your ID number (step 3).'); }
    if (!PV.idFront || !PV.selfie) { scrollTo('pc-verify'); return setErr('Please upload the front of your ID and a selfie (step 3).'); }
    if (!chk('pc-idok')) return setErr('Please confirm the ID is yours and give consent for verification.');
    if (!chk('pc-ok')) return setErr('Please confirm the age and safety declaration.');
    setErr('');
    const st = PS.get();
    const me2 = { name: v('pc-name'), g: v('pc-g'), age: +v('pc-age'), city: v('pc-city'), phone: v('pc-phone'), email: v('pc-email'), dest: v('pc-dest'), month: v('pc-month'), bud: v('pc-bud'), look: v('pc-look'), pace: v('pc-pace'), diet: v('pc-diet'), smoke: v('pc-smoke') === 'yes', styles: styleOrder(), about: v('pc-about'), seat: chk('pc-seat'), share: chk('pc-share'), women: chk('pc-women'), phvis: v('pc-phvis'), idType: v('pc-idtype'), idLast4: v('pc-idlast'), photo, status: 'Verification pending' };
    let uploaded = false;
    setBusy(true);
    try {
      const { photo: _p, ...pub } = me2; const r = await post('/partners', pub); me2.apiId = r.id;
      await post(`/partners/${encodeURIComponent(r.id)}/docs`, { photo, idType: me2.idType, idLast4: me2.idLast4, idFront: PV.idFront, idBack: PV.idBack, selfie: PV.selfie }); uploaded = true;
    } catch (er) { setBusy(false); return setErr('Upload failed: ' + (er.message || 'please try again') + '. Your documents were not saved.'); }
    setBusy(false);
    PV.idFront = PV.idBack = PV.selfie = ''; setDocs({ idFront: '', idBack: '', selfie: '' });
    PS.set({ ...st, me: me2 });
    const dName = (pd.dests[me2.dest] || { n: me2.dest }).n;
    ui.openModal(<div className="ok"><span className="tick">{I.tick}</span><h3>Profile submitted, {me2.name}</h3><p className="muted">{uploaded ? 'Your photo and ID were uploaded securely. Our team verifies profiles within 24 hours; you\'ll get an SMS when you\'re live.' : 'Preview mode: your ID images were not stored anywhere. After launch they are uploaded securely to our verification team.'}</p><Link className="btn btn-o" href={`${VIEW_PATHS.partner}?d=${encodeURIComponent(me2.dest)}`} onClick={() => ui.closeModal()}>Find partners for {dName}</Link></div>, 'Travel Partner profile');
  };

  const dd = pd.dests[vals.dest] || pd.dests[pd.destOrder[0]];
  const pName = vals.name || 'You', pStyle = styleOrder().join(' · ') || 'Your travel style';
  return (
    <section className="sec"><div className="wrap layout"><form className="box form pcf2" id="pcf" noValidate ref={form} onInput={onInput} onChange={onInput} onSubmit={onSubmit}>
      <ol className="pc2-steps"><li className="on">Profile</li><li>Photo</li><li>Identity proof</li><li>Review</li></ol>
      <h2>1. Your profile</h2>
      <div className="row2"><label>First name<input id="pc-name" defaultValue={me.name || ''} autoComplete="given-name" required /></label><label>Gender<select id="pc-g" defaultValue={me.g || undefined}>{['Female', 'Male', 'Other'].map(g => <option key={g}>{g}</option>)}</select></label></div>
      <div className="row2"><label>Age<input id="pc-age" type="number" min="18" max="80" defaultValue={me.age || ''} inputMode="numeric" required /></label><label>City<input id="pc-city" defaultValue={me.city || ''} autoComplete="address-level2" required /></label></div>
      <div className="row2"><label>Mobile (private)<input id="pc-phone" inputMode="tel" autoComplete="tel" defaultValue={me.phone || ''} required /></label><label>Email (private)<input id="pc-email" type="email" autoComplete="email" defaultValue={me.email || ''} /></label></div>
      <label>Where do you want to go?<select id="pc-dest" defaultValue={me.dest || undefined}>{pd.destOrder.map(id => <option key={id} value={id}>{pd.dests[id].name}</option>)}</select></label>
      <div className="row2"><label>When?<select id="pc-month" defaultValue={me.month || undefined}>{monthOptions()}</select></label><label>Budget per person<select id="pc-bud" defaultValue={me.bud || undefined}>{BUDS.map(x => <option key={x}>{x}</option>)}</select></label></div>
      <div className="row2"><label>Looking for<select id="pc-look" defaultValue={me.look || undefined}>{['Anyone', 'Female', 'Male'].map(x => <option key={x}>{x}</option>)}</select></label><label>Travel pace<select id="pc-pace" defaultValue={me.pace || undefined}>{PACES.map(x => <option key={x}>{x}</option>)}</select></label></div>
      <div className="row2"><label>Food<select id="pc-diet" defaultValue={me.diet || undefined}>{DIETS.map(x => <option key={x}>{x}</option>)}</select></label><label>Smoking<select id="pc-smoke" defaultValue={me.smoke ? 'yes' : 'no'}><option value="no">Non-smoker</option><option value="yes">Smoker</option></select></label></div>
      <div><span className="pc2-lbl">Travel style (up to 3)</span><div className="pchips">{STYLES.map(s => <button key={s} type="button" className={styles.includes(s) ? 'on' : ''} onClick={() => toggleStyle(s)}>{s}</button>)}</div></div>
      <label>About you<textarea id="pc-about" maxLength={400} placeholder="Your travel style, habits (early riser? non-smoker?), what kind of partner you're looking for" defaultValue={me.about || ''}></textarea></label>
      <fieldset className="pr-opts"><legend>Default preferences</legend>
        <label className="chk"><input type="checkbox" id="pc-seat" defaultChecked={me.seat !== false} /> Sit together while travelling</label>
        <label className="chk"><input type="checkbox" id="pc-share" defaultChecked={!!me.share} /> Open to a shared room (only if both agree)</label>
        <label className="chk"><input type="checkbox" id="pc-women" defaultChecked={!!me.women} /> Women only: show my profile only to verified women</label></fieldset>

      <h2 id="pc-photo-h">2. Profile photo</h2>
      <div className="pc2-photo"><div className="pc2-ph" id="pc-ph">{photo ? <img src={photo} alt="Your profile photo" /> : <span>{I.users}</span>}</div>
        <div><p className="muted" style={{ fontSize: '14px', margin: '0 0 10px' }}>A clear, recent photo of your face — no group photos, sunglasses or filters. Square crop is applied automatically.</p>
          <input type="file" id="up-photo" accept="image/*" className="sr" onChange={onPhoto} /><label htmlFor="up-photo" className="btn btn-ghost btn-sm">{I.users} {me.photo ? 'Change photo' : 'Upload photo'}</label> <button type="button" className="btn btn-ghost btn-sm" id="pc-ph-rm" hidden={!photo} onClick={() => setPhoto('')}>Remove</button>
          <label className="pc2-vis">Who can see my photo?<select id="pc-phvis" defaultValue={me.phvis || (me.g === 'Female' ? 'accepted' : 'members')}>{[['members', 'All verified members'], ['accepted', 'Only after I accept a request (blurred until then)'], ['women', 'Only verified women']].map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></label></div></div>

      <h2 id="pc-verify">3. Identity proof</h2>
      <div className="pc2-idnote">{I.shield}<p><b>Private and secure.</b> Your ID is used only to verify you, seen only by TripPartner&apos;s verification team, never shown to members, and deleted after your profile is approved or rejected. For Aadhaar, upload the <b>masked</b> Aadhaar.</p></div>
      <div className="row2"><label>ID type<select id="pc-idtype" defaultValue={me.idType || undefined}>{ID_TYPES.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></label><label>Last 4 digits of ID number<input id="pc-idlast" inputMode="numeric" maxLength={4} pattern="[0-9A-Za-z]{4}" defaultValue={me.idLast4 || ''} placeholder="e.g. 4821" /></label></div>
      <div className="pc2-ups">{DOCS.map(([k, label, hint, cap]) => <div key={k} className={`pc2-up${docs[k] ? ' done' : ''}`}><input type="file" id={`up-${k}`} accept="image/*" capture={cap} className="sr" onChange={onDoc(k)} /><label htmlFor={`up-${k}`} className="pc2-drop"><span className="pc2-prev" id={`pv-${k}`}>{docs[k] ? <img src={docs[k]} alt="" /> : I.passport}</span><span><b>{label}</b><small>{hint}</small></span><em>Choose file</em></label><button type="button" className="pc2-rm" hidden={!docs[k]} onClick={() => rmDoc(k)}>Remove</button></div>)}</div>
      <label className="chk"><input type="checkbox" id="pc-idok" /> I confirm this ID is mine and consent to TripPartner using it only to verify my identity</label>

      <h2>4. Review &amp; submit</h2>
      <label className="chk"><input type="checkbox" id="pc-ok" /> I confirm I am 18 or older and accept the <Link href={VIEW_PATHS['partner-safety']} style={{ textDecoration: 'underline' }}>safety rules</Link> and <Link href={PATHS.info('privacy')} style={{ textDecoration: 'underline' }}>privacy policy</Link></label>
      <p className="err" aria-live="polite">{err}</p><button className="btn btn-o" type="submit" disabled={busy}>{busy ? 'Uploading securely…' : 'Save profile & submit for verification'}</button>
    </form><aside className="side"><div className="box pc2-preview"><h3>Profile preview</h3><div id="pc-prev"><div className="bcard bc2 mini"><div className="bc2-cover" style={{ backgroundImage: `url(${img(dd.img)})` }}><span>{I.pin}{dd.n} · {vals.month || 'Flexible'}</span></div><div className="bc2-top"><span className="pav ver">{photo ? <img src={photo} alt="" /> : <span className="pa-ini" style={{ '--h': 210 }}>{(pName[0] || 'Y').toUpperCase()}</span>}<i>{I.check}</i></span><div className="bc2-id"><h3>{pName}, {+vals.age || '—'}</h3><p>{vals.g} · {vals.city || 'Your city'}</p></div></div><p className="bc-style">{pStyle}</p><div className="bc2-facts"><span>{I.wallet}{vals.bud}</span><span>{I.clock}{vals.pace}</span><span>{I.star}{vals.diet}</span></div></div></div><p className="muted" style={{ fontSize: '12.5px', marginTop: '10px' }}>This is how other members will see your card after verification.</p></div>
      <div className="box"><h3>How verification works</h3><ul className="checks"><li>{I.check}<span>Mobile OTP verification</span></li><li>{I.check}<span>Government ID check (e.g. via DigiLocker)</span></li><li>{I.check}<span>Selfie match to confirm it&apos;s you</span></li><li>{I.check}<span>Profile goes live after review (usually within 24 hours)</span></li></ul></div>{aside}</aside></div></section>
  );
}
