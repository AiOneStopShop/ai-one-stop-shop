import type { Metadata } from 'next';
import Script from 'next/script';
import { DM_Sans, Inter } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CookieConsent } from '@/components/CookieConsent';

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  weight: ['400', '500', '700'],
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://aionestop.shop'),
  title: {
    default: 'AI One Stop Shop - Honest AI Tools Directory',
    template: '%s | AI One Stop Shop'
  },
  description: 'Curated AI tools directory. No fake ratings, no paid rankings.',
  keywords: ['AI tools', 'artificial intelligence', 'productivity', 'coding assistants', 'AI directory'],
  authors: [{ name: 'Kati Bartolec' }],
  creator: 'Kati Bartolec',
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
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${dmSans.variable} ${inter.variable}`}>
      <body className="min-h-screen bg-[#F9F8F5] text-[#171C26] font-inter antialiased">
        <Script src="/cookie-banner-boot.js" strategy="beforeInteractive" />
        <CookieConsent />
        <Header />
        <main id="main" tabIndex={-1} className="min-h-screen focus:outline-none">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
