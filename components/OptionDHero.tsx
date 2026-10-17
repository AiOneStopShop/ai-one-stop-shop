'use client'

import { motion } from 'framer-motion'
import DeskIllustration from './DeskIllustration'
import { ChevronRightIcon } from '@heroicons/react/24/outline'

export default function OptionDHero() {
  return (
    <section className="bg-cream py-12 sm:py-16 md:py-20">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left column: Headline and CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="font-serif font-bold text-green text-[2.9rem] sm:text-5xl md:text-6xl lg:text-7xl leading-[1.05] tracking-tight mb-6">
              AI that fits your life. And your budget.
            </h1>
            
            {/* Orange swoosh */}
            <svg 
              className="w-32 sm:w-36 h-3 mb-6" 
              viewBox="0 0 140 14" 
              aria-hidden="true"
            >
              <path 
                d="M3 10c30-7 75-9 134-4" 
                fill="none" 
                stroke="#E2562B" 
                strokeWidth="4" 
                strokeLinecap="round"
              />
            </svg>

            <p className="font-body text-lg sm:text-xl text-ink leading-relaxed mb-8 max-w-lg">
              New to AI? Start with your situation. We&apos;ll help you find a useful first step, and you stay in charge of every choice.
            </p>

            <a
              href="#brings"
              className="inline-flex items-center gap-3 bg-green hover:bg-green-light text-white font-bold text-lg px-7 py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              Find my starting point 
              <ChevronRightIcon className="w-5 h-5" />
            </a>

            <p className="mt-4 text-soft text-sm">
              Free to use. No account needed.
            </p>
          </motion.div>

          {/* Right column: Illustration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-full max-w-xl mx-auto lg:max-w-none"
          >
            <DeskIllustration />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
