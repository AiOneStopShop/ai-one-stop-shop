'use client'

import { motion } from 'framer-motion'
import { EnvelopeIcon, SparklesIcon } from '@heroicons/react/24/outline'

export default function Newsletter() {
  return (
    <section className="py-20 bg-gradient-to-r from-brand-purple to-brand-blue">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="flex items-center justify-center mb-6">
            <SparklesIcon className="w-8 h-8 text-white mr-3" />
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Stay Ahead of AI Trends
            </h2>
          </div>
          
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Get the latest AI tool updates, expert insights, and community highlights delivered to your inbox every week
          </p>

          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <div className="relative flex-1">
              <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                placeholder="Enter your email address"
                className="w-full pl-10 pr-4 py-3 rounded-lg border-0 focus:ring-2 focus:ring-white/20 focus:outline-none text-gray-900"
              />
            </div>
            <button className="bg-white text-brand-purple font-medium py-3 px-6 rounded-lg hover:bg-gray-100 transition-colors whitespace-nowrap">
              Subscribe
            </button>
          </div>

          <p className="text-sm text-white/70 mt-4">
            Join 50,000+ AI enthusiasts. No spam, unsubscribe anytime.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
