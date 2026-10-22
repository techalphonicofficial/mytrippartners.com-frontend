'use client';
import { useState } from 'react';

/* FAQ accordion item: <div class="acc [on]"><button aria-expanded>q</button><div class="acc-b"><p>a</p></div></div> */
export function FaqAcc({ q, a, open = false }) {
  const [on, setOn] = useState(open);
  return <div className={'acc ' + (on ? 'on' : '')}><button type="button" aria-expanded={on ? 'true' : 'false'} onClick={() => setOn(v => !v)}>{q}</button><div className="acc-b"><p>{a}</p></div></div>;
}
