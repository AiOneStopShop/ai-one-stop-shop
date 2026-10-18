import type { Metadata } from 'next';
import { Fraunces, Source_Sans_3 } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CookieConsent } from '@/components/CookieConsent';
import { getBrandUrl, getSiteUrl } from '@/lib/site-config';
import { Analytics } from '@vercel/analytics/react';

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
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'AI One Stop Shop',
    title: 'AI One Stop Shop - Honest AI Tools Directory',
    description: 'Curated AI tools directory. No fake ratings, no paid rankings.',
    images: [{ url: '/og-image.svg', width: 1200, height: 630, alt: 'AI One Stop Shop' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI One Stop Shop',
    description: 'Curated AI tools directory. No fake ratings, no paid rankings.',
    images: ['/og-image.svg'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${fraunces.variable} ${sourceSans3.variable}`}>
      <body className="min-h-screen bg-[#FBF4E6] text-[#22201B] font-source-sans antialiased">
        <script
          dangerouslySetInnerHTML={{
            __html: "try{if(localStorage.getItem('cookieConsent')){document.documentElement.classList.add('cookie-consent-given')}else{document.documentElement.classList.add('has-cookie-banner')}}catch(e){document.documentElement.classList.add('has-cookie-banner')}",
          }}
        />
        <CookieConsent />
        <Header />
        <main id="main" tabIndex={-1} className="min-h-screen focus:outline-none">
          {children}
        </main>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
