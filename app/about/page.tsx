'use client'

import { motion } from 'framer-motion'
import OptionDHeader from '@/components/OptionDHeader'
import Footer from '@/components/Footer'

export default function AboutPage() {
  return (
    <>
      <OptionDHeader />
      
      <main className="bg-cream min-h-screen">
        <div className="max-w-3xl mx-auto px-6 sm:px-8 py-12 sm:py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="font-serif font-bold text-green text-4xl sm:text-5xl md:text-6xl leading-tight mb-8">
              About AI One Stop Shop
            </h1>

            <div className="space-y-6 text-lg leading-relaxed text-ink">
              <p>
                We are <strong>oneTomorrow</strong>, and we built AI One Stop Shop to help people who are new to AI find their footing.
              </p>

              <p>
                The best AI tools don&apos;t replace you. They give you more time for the work only you can do. But knowing where to start — and what fits your budget — shouldn&apos;t require wading through hype, fake ratings, or hidden costs.
              </p>

              <h2 className="font-serif font-bold text-green text-2xl sm:text-3xl mt-10 mb-4">
                What we do
              </h2>

              <p>
                We curate a small, honest catalog of AI tools. Every tool listing shows:
              </p>

              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Real pricing, as listed on the vendor&apos;s site</li>
                <li>The date we last checked it</li>
                <li>Whether a free plan exists</li>
                <li>What it&apos;s actually good for</li>
              </ul>

              <p>
                No inflated ratings. No made-up user counts. No tools we make appearing in ranked lists.
              </p>

              <h2 className="font-serif font-bold text-green text-2xl sm:text-3xl mt-10 mb-4">
                How we keep it honest
              </h2>

              <p>
                Some links on this site are affiliate links. If you sign up for a tool through one of our links, the tool maker may pay us a commission. You pay the same price, and it never changes the ranking order.
              </p>

              <p>
                Payments fund the site&apos;s operation, but they don&apos;t buy placement. Our editorial picks are based on value for beginners, ease of use, and honest pricing.
              </p>

              <p>
                Read our full <a href="/disclosure" className="text-green-light underline hover:text-green">disclosure policy</a> and learn <a href="/how-we-rank" className="text-green-light underline hover:text-green">how we rank tools</a>.
              </p>

              <h2 className="font-serif font-bold text-green text-2xl sm:text-3xl mt-10 mb-4">
                Get in touch
              </h2>

              <p>
                Questions, suggestions, or tool submissions? Email us at{' '}
                <a 
                  href="mailto:aionestopshop25@gmail.com" 
                  className="text-green-light underline hover:text-green font-semibold"
                >
                  aionestopshop25@gmail.com
                </a>
              </p>

              <p className="text-soft text-base mt-8 pt-8 border-t border-line">
                AI One Stop Shop is a oneTomorrow venture.
              </p>
            </div>
          </motion.div>
        </div>
      </main>
      
      <Footer />
    </>
  )
}
