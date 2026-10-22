/* Root layout: page chrome (header, drawer, footer, bottom nav, floating buttons) around every page.
   Content comes from the backend (lib/site.js); global UI services from UIProvider. */
import './globals.css';
import { getSite } from '@/lib/site';
import { waLink } from '@/lib/format';
import UIProvider from '@/components/providers/UIProvider';
import Header from '@/components/layout/Header';
import { Drawer, Footer } from '@/components/layout/Chrome';
import { BottomNav, Fab, SiteEffects, ReadingProgress } from '@/components/layout/ChromeClient';
import GlobalFeatures from '@/components/features/GlobalFeatures';
import ThemeScript from '@/components/layout/ThemeScript';

export async function generateMetadata() {
  const S = await getSite();
  const D = 'https://' + S.CONFIG.domain;
  return {
    metadataBase: new URL(D),
    title: { default: 'TripPartner', template: '%s | TripPartner' },
    description: 'TripPartner — holiday packages, pilgrimage yatras, group tours and international trips. Explore · Plan · Travel · Together.',
    keywords: 'tour packages, holiday packages, Char Dham Yatra, Kashmir tour, Kerala tour, Bali honeymoon, Thailand tour, group tours, TripPartner',
    icons: { icon: '/img/favicon.png' },
    openGraph: { type: 'website', siteName: 'TripPartner', title: 'TripPartner — Holidays, Yatras & Group Tours', description: 'Holiday packages across India and abroad, planned by one travel expert. Explore · Plan · Travel · Together.', url: D + '/', images: [`${D}/img/group-lake.jpg`] },
    twitter: { card: 'summary_large_image' },
    robots: { index: true, follow: true, 'max-image-preview': 'large' },
  };
}

export const viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover' };

/* applies the saved light/dark choice before the first paint (no flash) */
export default async function RootLayout({ children }) {
  const S = await getSite();
  const C = S.CONFIG;
  const org = { '@context': 'https://schema.org', '@type': 'TravelAgency', name: 'TripPartner', url: `https://${C.domain}/`, slogan: 'Explore · Plan · Travel · Together', email: C.email, address: { '@type': 'PostalAddress', addressLocality: 'Noida', addressRegion: 'Uttar Pradesh', addressCountry: 'IN' }, areaServed: 'IN' };
  return (
    <html lang="en-IN" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <ThemeScript />
        <link rel="preconnect" href="https://fonts.googleapis.com" /><link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,600;12..96,700;12..96,800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Caveat:wght@600;700&family=Anton&family=Cinzel:wght@700;900&display=swap" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(org).replace(/</g, '\\u003c') }} />
      </head>
      <body>
        {C.announcement ? <div id="tp-ann" className="tp-ann" role="status">{C.announcement}</div> : null}
        <UIProvider>
          <a className="skip" href="#app">Skip to main content</a>
          <header className="site-head" id="head"><Header S={S} /><ReadingProgress /></header>
          <Drawer S={S} />
          <main id="app" tabIndex={-1}>{children}</main>
          <footer className="foot" id="foot"><Footer S={S} /></footer>
          <Fab waHref={waLink(C, 'Hi TripPartner, I want to plan a trip.')} />
          <nav className="bnav" id="bnav" aria-label="Quick navigation"><BottomNav /></nav>
          <GlobalFeatures CONFIG={C} />
          <SiteEffects />
        </UIProvider>
      </body>
    </html>
  );
}
