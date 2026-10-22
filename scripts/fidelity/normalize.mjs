/* Turns an HTML fragment into a canonical tree so the legacy page and the Next.js page can be compared
   structurally: same elements, attributes and text — independent of formatting and of how each framework
   serialises HTML. Legacy "#route" links and relative image paths are mapped to the new URL scheme. */
import { parse } from 'node-html-parser';
import { hashToPath } from '../../lib/routes.js';

const SKIP_ATTR = new Set(['data-reactroot', 'suppresshydrationwarning']);
/* data-* attributes were JavaScript hooks in the old site (React uses event handlers instead); the stylesheet
   only selects on data-plan, so that one is compared. */
const keepData = k => k === 'data-plan';
const BOOL = new Set(['hidden', 'disabled', 'checked', 'selected', 'open', 'required', 'readonly', 'multiple', 'autofocus', 'novalidate', 'defer', 'async', 'controls', 'muted', 'playsinline', 'loop', 'autoplay']);

function normUrl(v, S) {
  if (!v) return v;
  let u = v.trim();
  if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?\//.test(u)) u = u.replace(/^https?:\/\/[^/]+/, '');
  if (u.startsWith('/#')) u = u.slice(1);
  if (u.startsWith('#')) { const p = hashToPath(u, S); if (p) return p; return u; }
  if (/^(img|video)\//.test(u)) u = '/' + u;
  /* filter presets that used to be data-* hooks are query strings now (/travel-partner/?g=Female) */
  if (u.startsWith('/') && u.includes('?')) u = u.slice(0, u.indexOf('?'));
  return u;
}
/* legacy pages used <base href="/">, so url(img/x.jpg) there === url(/img/x.jpg) here */
const relImg = v => ['url(', "url('", 'url("'].reduce((s, p) => s.split(p + 'img/').join(p + '/img/'), v);
const normStyle = v => relImg(v).split(';').map(s => s.trim()).filter(Boolean).map(s => s.replace(/\s*:\s*/, ':').replace(/\s+/g, ' ').toLowerCase()).join(';');
const normText = t => t.replace(/\s+/g, ' ');

/* → array of nodes: { t: tag, a: {attr}, c: [children] } | { x: text } */
export function canon(html, S) {
  const root = parse(html || '', { comment: false, blockTextElements: { script: true, style: true, pre: true } });
  const walk = n => {
    if (n.nodeType === 3) { const x = normText(n.text); return x.trim() ? { x } : null; }
    if (n.nodeType !== 1) return null;
    const tag = (n.rawTagName || '').toLowerCase();
    if (tag === 'script' || tag === 'template' || tag === 'noscript') return null;
    const a = {};
    for (const [k0, v0] of Object.entries(n.attributes)) {
      const k = k0.toLowerCase(); if (SKIP_ATTR.has(k) || (k.startsWith('data-') && !keepData(k))) continue;
      if (k === 'selected') continue; /* current choice of a <select> — React writes it as an attribute, the old site as a property */
      if (k === 'value' && (tag === 'input' || tag === 'textarea') && !v0) continue; /* empty controlled input */
      if (k === 'type' && tag === 'button') continue; /* React sets type="button" explicitly; no visual effect */
      let v = v0 == null ? '' : String(v0);
      if (BOOL.has(k)) v = '';
      else if (k === 'href' || k === 'src' || k === 'poster' || k === 'action') v = normUrl(v, S);
      else if (k === 'style') v = normStyle(v);
      else if (k === 'class') v = v.split(/\s+/).filter(Boolean).join(' ');
      a[k] = v;
    }
    const c = []; let prevText = null;
    for (const ch of n.childNodes) {
      const w = walk(ch); if (!w) continue;
      if (w.x !== undefined && prevText) { prevText.x += w.x; continue; } /* React may split text nodes */
      c.push(w); prevText = w.x !== undefined ? w : null;
    }
    c.forEach(k => { if (k.x !== undefined) k.x = k.x.replace(/\s+/g, ' ').trim(); });
    return { t: tag, a, c };
  };
  const out = []; let prev = null;
  for (const ch of root.childNodes) { const w = walk(ch); if (!w) continue; if (w.x !== undefined && prev) { prev.x += w.x; continue; } out.push(w); prev = w.x !== undefined ? w : null; }
  out.forEach(k => { if (k.x !== undefined) k.x = k.x.trim(); });
  return out;
}

const label = n => n.x !== undefined ? `"${n.x.slice(0, 60)}"` : `<${n.t}${n.a.id ? '#' + n.a.id : ''}${n.a.class ? '.' + n.a.class.split(' ').join('.') : ''}>`;

/* structural diff → list of { path, msg } (first `max` differences) */
export function diff(a, b, max = 25) {
  const out = [];
  const cmp = (x, y, p) => {
    if (out.length >= max) return;
    const n = Math.max(x.length, y.length);
    for (let i = 0; i < n && out.length < max; i++) {
      const u = x[i], v = y[i], here = `${p}/${u ? label(u) : v ? label(v) : '?'}[${i}]`;
      if (!u) { out.push({ path: here, msg: `extra in NEW: ${label(v)}` }); continue; }
      if (!v) { out.push({ path: here, msg: `missing in NEW: ${label(u)}` }); continue; }
      if ((u.x !== undefined) !== (v.x !== undefined)) { out.push({ path: here, msg: `node kind differs: legacy ${label(u)} vs new ${label(v)}` }); continue; }
      if (u.x !== undefined) { if (u.x !== v.x) out.push({ path: here, msg: `text differs:\n      legacy: ${JSON.stringify(u.x.slice(0, 160))}\n      new:    ${JSON.stringify(v.x.slice(0, 160))}` }); continue; }
      if (u.t !== v.t) { out.push({ path: here, msg: `tag differs: legacy <${u.t}> vs new <${v.t}>` }); continue; }
      const keys = new Set([...Object.keys(u.a), ...Object.keys(v.a)]);
      for (const k of keys) if (u.a[k] !== v.a[k]) out.push({ path: here, msg: `attr ${k}: legacy ${JSON.stringify(u.a[k])} vs new ${JSON.stringify(v.a[k])}` });
      cmp(u.c, v.c, here);
    }
  };
  cmp(a, b, '');
  return out;
}
