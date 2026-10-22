/* TripPartner TV helpers (legacy video.js): video file URLs, reel categories, time format and the plain
   reel data the client components need (built on the server from the site store, or in the browser from useSite()). */
import { img, dname } from '../format';

export const VSRC = n => `/video/${n}.mp4`;
export const VPOS = n => `/video/${n}.jpg`;

/* CAN_MP4 / VPLAY: decided in the browser only (call from effects / event handlers, never during render) */
let canMp4 = null;
export function CAN_MP4() {
  if (canMp4 === null) { try { canMp4 = !!document.createElement('video').canPlayType('video/mp4; codecs="avc1.640028"'); } catch (e) { canMp4 = true; } }
  return canMp4;
}
export const VPLAY = n => (CAN_MP4() ? VSRC(n) : VSRC(n).replace('.mp4', '.webm'));

export const reducedMotion = () => { try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } };
export const fmtT = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

/* reel category filters (RCAT) */
export const RCAT_LIST = [['all', 'All'], ['india', 'India'], ['intl', 'International'], ['pilgrim', 'Pilgrimage'], ['beach', 'Beaches'], ['mountain', 'Mountains']];
const RCAT = {
  india: (r, d) => d.type === 'india',
  intl: (r, d) => d.type === 'intl',
  pilgrim: r => ['chardham', 'varanasi'].includes(r.dest),
  beach: r => ['goa', 'andaman', 'bali', 'thailand', 'kerala'].includes(r.dest),
  mountain: r => ['kashmir', 'ladakh', 'himachal', 'chardham'].includes(r.dest),
};

/* plain data for one reel: card + viewer */
export function reelData(S, r) {
  const d = S.D(r.dest) || { id: r.dest, name: r.dest, best: '', type: '' }, p = r.pkg ? S.P(r.pkg) : null;
  return {
    id: r.id, tag: r.tag, t: r.t, dest: d.id, name: d.name, short: dname(d), best: String(d.best || '').split(';')[0],
    cats: Object.keys(RCAT).filter(k => RCAT[k](r, d)),
    pkg: p ? { id: p.id, title: p.title, img: p.img, n: p.n, price: p.price } : null,
  };
}
export const reelsData = S => S.REELS.map(r => reelData(S, r));

/* showreel chapters: { id, name, img, start } */
export function showreelData(S) {
  const R = S.SHOWREEL;
  return { src: R.src, step: R.step, chapters: R.chapters.map(([id, n], i) => ({ id, name: n, img: img((S.D(id) || {}).img), start: i * R.step })) };
}
