'use client'

import { motion } from 'framer-motion'

export default function HonestySection() {
  return (
    <section className="bg-green text-white py-16 sm:py-20" aria-label="How we keep this honest">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-8 lg:gap-12 items-center">
          <motion.blockquote
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="font-serif text-3xl sm:text-4xl md:text-5xl leading-tight"
          >
            The best AI tools don&apos;t replace you. They give you more time for the work only you can do.
          </motion.blockquote>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="space-y-4 text-base sm:text-lg text-gray-200"
          >
            <p>
              We list 20 AI tools today, with real prices and the date we last checked them. No fake ratings, no made-up numbers.
            </p>
            <p>
              Some links are paid links. If you sign up through one, the tool maker may pay us. You pay the same, and it never changes the order.{' '}
              <a href="/how-we-rank" className="underline hover:text-white transition-colors">
                How we rank
              </a>
              {' · '}
              <a href="/disclosure" className="underline hover:text-white transition-colors">
                Our disclosure
              </a>
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
