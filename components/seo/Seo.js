/* SEO building blocks for pages.
   <JsonLd data={[...]} />                    structured data (null entries are skipped)
   <SeoExtra intro faqs vars links />         intro copy + FAQ accordion + related links (original pseoExtra()),
                                              rendered after a page's first section when the dashboard adds them */
import { Fragment } from 'react';
import { I } from '@/components/icons';
import { FaqAcc } from './SeoClient';

export function JsonLd({ data }) {
  const list = (Array.isArray(data) ? data : [data]).filter(Boolean);
  return list.map((j, i) => <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(j).replace(/</g, '\\u003c') }} />);
}

/* "**bold**" → <b>, blank line → new paragraph, newline → <br> (plain text otherwise) */
function Md({ text }) {
  return String(text || '').split(/\n{2,}/).map((para, i) => (
    <p key={i}>{para.split('\n').map((line, j) => <Fragment key={j}>{j ? <br /> : null}{line.split(/\*\*(.+?)\*\*/g).map((s, k) => (k % 2 ? <b key={k}>{s}</b> : s))}</Fragment>)}</p>
  ));
}

export function SeoExtra({ intro, faqs = [], vars, links = [] }) {
  const fq = (faqs || []).filter(f => f.q && f.a);
  const facts = vars ? [[I.cal, 'Best time', vars.best_time], [I.wallet, 'Starting from', vars.min_price ? vars.min_price + ' / person' : ''], [I.clock, 'Trip length', vars.durations ? vars.durations + ' days' : ''], [I.plane, 'Nearest airport', vars.airport]].filter(f => f[2]) : [];
  return (
    <>
      {intro || facts.length ? <section className="sec pseo-about"><div className="wrap pseo-ab"><div className="pseo-copy">{intro ? <Md text={intro} /> : null}</div>{facts.length ? <ul className="pseo-facts">{facts.map(([ic, k, v]) => <li key={k}>{ic}<span><small>{k}</small><b>{v}</b></span></li>)}</ul> : null}</div></section> : null}
      {fq.length ? <section className="sec pseo-faq"><div className="wrap"><h2>Frequently asked questions</h2><div className="pseo-acc">{fq.map((f, i) => <FaqAcc key={i} q={f.q} a={f.a} open={!i} />)}</div></div></section> : null}
      {(links || []).length ? <section className="sec-tight pseo-links"><div className="wrap"><h2>Related searches</h2><div className="pseo-chips">{links.map(l => <a key={l.u} href={l.u}>{l.t}</a>)}</div></div></section> : null}
    </>
  );
}
