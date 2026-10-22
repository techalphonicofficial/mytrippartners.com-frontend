/* 404 page (original notFound(), app.js) — shown for notFound() calls and unknown URLs (status 404) */
import Link from 'next/link';

export default function NotFound() {
  return <section className="sec"><div className="wrap empty"><h2>Page not found</h2><p style={{ margin: '10px 0 18px' }}>The page you&apos;re looking for isn&apos;t here.</p><Link className="btn btn-o" href="/">Go to homepage</Link></div></section>;
}
