/* UPI QR code as inline SVG (original payproof.js qrSvg), drawn with the vendored QR library. */
import qrcode from '@/lib/booking/qr';

export function qrPath(text) {
  const q = qrcode(0, 'M'); q.addData(text); q.make(); const n = q.getModuleCount(), m = 2; let d = '';
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (q.isDark(r, c)) d += `M${c + m} ${r + m}h1v1h-1z`;
  return { size: n + m * 2, d };
}

export default function UpiQr({ text }) {
  let q;
  try { q = qrPath(text); } catch (e) { return <p className="muted">QR unavailable — use the UPI ID below.</p>; }
  return <svg viewBox={`0 0 ${q.size} ${q.size}`} shapeRendering="crispEdges" role="img" aria-label="UPI QR code"><rect width="100%" height="100%" fill="#fff" /><path d={q.d} fill="#0f1d33" /></svg>;
}
