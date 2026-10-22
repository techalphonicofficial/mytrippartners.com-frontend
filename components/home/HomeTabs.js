'use client';
/* Tabbed home sections (original tabs() calls in homeInit): "India & Around Holiday" (#iatabs → #r-ia) and
   "Easy Visa Destination" (#vtabs → #r-visa). The cards of every tab are server-rendered and passed in `panes`. */
import { useState } from 'react';
import { SecHead } from '@/components/ui/cards';

/* panes: [[key, node], …] — the first tab is selected initially */
function useTab(panes) { const [k, setK] = useState(panes[0][0]); return [k, setK, (panes.find(p => p[0] === k) || panes[0])[1]]; }

export function IaSection({ panes }) {
  const [k, setK, pane] = useTab(panes);
  return (
    <section className="sec-tight"><div className="wrap">
      <div className="sec-head"><h2>India &amp; Around Holiday</h2><div className="line-tabs" role="tablist" id="iatabs">{panes.map(([t]) => <button key={t} role="tab" aria-selected={t === k ? 'true' : 'false'} onClick={() => setK(t)}>{t}</button>)}</div></div>
      <div className="rail-wrap"><div className="rail" id="r-ia" style={{ '--cw': '290px' }}>{pane}</div></div>
    </div></section>
  );
}

const VTABS = [['free', 'Visa Free'], ['voa', 'Visa On Arrival']];
export function VisaSection({ panes }) {
  const [k, setK, pane] = useTab(panes);
  return (
    <section className="sec-tight"><div className="wrap">
      <SecHead h="Easy Visa Destination" p="Unfold top visa-free getaways for smooth journeys." right={<div className="pill-tabs" role="tablist" id="vtabs">{VTABS.map(([t, l]) => <button key={t} role="tab" aria-selected={t === k ? 'true' : 'false'} onClick={() => setK(t)}>{l}</button>)}</div>} />
      <div className="rail" id="r-visa" style={{ '--cw': '290px' }}>{pane}</div>
      <p className="muted" style={{ fontSize: '12.5px', marginTop: '8px' }}>For Indian passport holders. Entry rules change often; our visa desk confirms the latest before you book.</p>
    </div></section>
  );
}
