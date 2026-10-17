import type { Metadata } from 'next'
import { Fraunces, Inter } from 'next/font/google'
import './globals.css'

const fraunces = Fraunces({ 
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
  axes: ['opsz'],
})

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'AI One Stop Shop - AI That Fits Your Life and Budget',
  description: 'New to AI? Start with your situation. We help you find a useful first step, and you stay in charge of every choice. Honest pricing, no fake ratings.',
  keywords: 'AI tools, artificial intelligence, beginner friendly, budget AI tools, honest AI reviews',
  authors: [{ name: 'oneTomorrow' }],
  creator: 'oneTomorrow',
  openGraph: {
    title: 'AI One Stop Shop - AI That Fits Your Life and Budget',
    description: 'New to AI? Start with your situation. We help you find a useful first step, within your budget.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI One Stop Shop - AI That Fits Your Life and Budget',
    description: 'New to AI? Start with your situation. We help you find a useful first step, within your budget.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'AI One Stop Shop',
    description: 'Honest, budget-friendly AI tool recommendations for beginners',
    url: 'https://aionestop.shop',
    publisher: {
      '@type': 'Organization',
      name: 'oneTomorrow',
      email: 'aionestopshop25@gmail.com',
    },
  }

  return (
    <html lang="en" className={`scroll-smooth ${fraunces.variable} ${inter.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Source+Sans+3:wght@400;600;700&display=swap" rel="stylesheet" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${inter.className} antialiased`}>
        {children}
      </body>
    </html>
  )
}

