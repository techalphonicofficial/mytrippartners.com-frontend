/* TripPartner website (Next.js). The Express backend serves /api and /admin; they are proxied here so the
   whole site runs on one origin (cookies, CORS-free API calls from the browser). */
const BACKEND = (process.env.BACKEND_URL || 'http://127.0.0.1:8080').replace(/\/$/, '');

/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,          /* canonical URLs end with "/" (same as the previous site) */
  poweredByHeader: false,
  allowedDevOrigins: ['127.0.0.1', 'localhost'],  /* local development + the fidelity tools' headless browser */
  images: { unoptimized: true },
  skipTrailingSlashRedirect: true,  /* pages get their trailing slash in proxy.js; API calls are never redirected */
  async rewrites() {
    return {
      /* before pages: the catch-all page route ([...slug]) would otherwise answer these with a 404 */
      beforeFiles: [
        /* the API lives on the backend, except this app's own /api/revalidate and /api/seo-pages */
        { source: '/api/:path((?!revalidate/?$|seo-pages/?$).*)', destination: `${BACKEND}/api/:path` },
        /* the dashboard */
        { source: '/admin', destination: `${BACKEND}/admin/` },
        { source: '/admin/:path*', destination: `${BACKEND}/admin/:path*` },
      ],
      afterFiles: [],
      fallback: [],
    };
  },
  async headers() {
    return [{ source: '/:path*', headers: [{ key: 'X-Content-Type-Options', value: 'nosniff' }, { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' }, { key: 'X-Frame-Options', value: 'SAMEORIGIN' }] }];
  },
};

export default nextConfig;
