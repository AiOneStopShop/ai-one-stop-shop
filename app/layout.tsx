import type { Metadata } from 'next';
import { Fraunces, Source_Sans_3 } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CookieConsent } from '@/components/CookieConsent';
import { GlobalSearchShortcut } from '@/components/GlobalSearchShortcut';
import { getBrandUrl, getSiteUrl } from '@/lib/site-config';
import { SiteAnalytics } from '@/components/SiteAnalytics';
import { headers } from 'next/headers';

// Nonce CSP needs every HTML page rendered per request: a prerendered page would
// carry a stale nonce and the browser would block all of its scripts.
export const dynamic = 'force-dynamic';

const brandUrl = getBrandUrl();

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  weight: ['600', '700'],
  display: 'swap',
  preload: true,
  adjustFontFallback: true,
});

const sourceSans3 = Source_Sans_3({
  subsets: ['latin'],
  variable: '--font-source-sans',
  weight: ['400', '600', '700'],
  display: 'swap',
  preload: true,
  adjustFontFallback: true,
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: 'AI One Stop Shop - Honest AI Tools Directory',
    template: '%s | AI One Stop Shop'
  },
  description: 'Curated AI tools directory. No fake ratings, no paid rankings.',
  keywords: ['AI tools', 'artificial intelligence', 'productivity', 'coding assistants', 'AI directory'],
  authors: brandUrl ? [{ name: 'oneTomorrow', url: brandUrl }] : [{ name: 'oneTomorrow' }],
  creator: 'oneTomorrow',
  publisher: 'AI One Stop Shop',
  // Title, description and URL are left out on purpose so every page's own
  // title/description flow into og:* and twitter:* tags (Next.js inherits them).
  // Share images come from app/opengraph-image.tsx + twitter-image.tsx (PNG via
  // next/og); guides get their own in app/guides/[slug]/. X/Facebook ignore SVG.
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'AI One Stop Shop',
  },
  twitter: {
    card: 'summary_large_image',
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Per-request CSP nonce set by middleware.ts. Reading headers() makes every page
  // render per request, which nonce-based CSP requires (Next adds the nonce to its
  // own scripts automatically).
  const nonce = (await headers()).get('x-nonce') ?? undefined;

  return (
    <html lang="en" className={`${fraunces.variable} ${sourceSans3.variable}`}>
      <body className="min-h-screen bg-[#FBF4E6] text-[#22201B] font-source-sans antialiased">
        {/* Sets the banner offset class before paint. Allowed by the per-request CSP nonce
            (no 'unsafe-inline'). Same logic as public/cookie-banner-boot.js. */}
        <script
          nonce={nonce}
          dangerouslySetInnerHTML={{
            __html: "try{var c=localStorage.getItem('cookieConsent');if(c==='accepted'||c==='declined'||navigator.globalPrivacyControl===true){document.documentElement.classList.add('cookie-consent-given')}else{document.documentElement.classList.add('has-cookie-banner')}}catch(e){document.documentElement.classList.add('has-cookie-banner')}",
          }}
        />
        <CookieConsent />
        <GlobalSearchShortcut />
        <Header />
        <main id="main" tabIndex={-1} className="min-h-screen focus:outline-none">
          {children}
        </main>
        <Footer />
        <SiteAnalytics />
      </body>
    </html>
  );
}
