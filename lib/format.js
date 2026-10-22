/* Formatting helpers (same output as the original website). Safe on server and client. */

export const img = n => `/img/${n}.jpg`;
export const inr = n => '₹' + Number(n).toLocaleString('en-IN');
export const dname = d => d.short || d.name;
export const waLink = (CONFIG, txt) => `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(txt)}`;
export const telHref = phone => `tel:${String(phone).replace(/\s/g, '')}`;
export const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const fmtDate = s => new Date(s + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
export const wkday = s => new Date(s + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'short' });
export const todayISO = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
export const canon = (CONFIG, path) => `https://${CONFIG.domain}${path}`;
/* class list helper: cx('a', cond && 'b') → "a b" */
export const cx = (...a) => a.filter(Boolean).join(' ');
