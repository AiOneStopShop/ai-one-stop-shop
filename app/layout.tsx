import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AI One Stop Shop - Your Ultimate AI Tools & Knowledge Hub',
  description: 'Discover the best AI tools, learn from expert knowledge, and join a thriving AI community. Your one-stop destination for everything AI.',
  keywords: 'AI tools, artificial intelligence, machine learning, AI community, AI knowledge, AI resources',
  authors: [{ name: 'AI One Stop Shop' }],
  openGraph: {
    title: 'AI One Stop Shop - Your Ultimate AI Tools & Knowledge Hub',
    description: 'Discover the best AI tools, learn from expert knowledge, and join a thriving AI community.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI One Stop Shop - Your Ultimate AI Tools & Knowledge Hub',
    description: 'Discover the best AI tools, learn from expert knowledge, and join a thriving AI community.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} antialiased`}>
        {children}
      </body>
    </html>
  )
}

