'use client'

import { motion } from 'framer-motion'
import { ArrowRightIcon, SparklesIcon, RocketLaunchIcon } from '@heroicons/react/24/outline'

export default function Hero() {
  return (
    <section className="relative overflow-hidden gradient-bg">
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
                         <div className="inline-flex items-center px-4 py-2 rounded-full bg-ai-100 dark:bg-ai-900/20 text-ai-700 dark:text-ai-300 text-sm font-medium mb-6">
               <SparklesIcon className="w-4 h-4 mr-2" />
               The Ultimate AI Tools & Knowledge Hub
             </div>
             
             <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
               Discover, Learn, and
               <span className="brand-gradient"> Master AI</span>
             </h1>
            
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8 text-balance">
              Your one-stop destination for the best AI tools, expert knowledge, and a thriving community. 
              From beginners to experts, find everything you need to succeed in the AI revolution.
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <button className="btn-primary flex items-center group">
              Explore AI Tools
              <ArrowRightIcon className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
            
            <button className="btn-secondary flex items-center">
              <RocketLaunchIcon className="w-4 h-4 mr-2" />
              Join Community
            </button>
          </motion.div>
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8"
        >
                     <div className="text-center">
             <div className="w-16 h-16 bg-ai-100 dark:bg-ai-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
               <SparklesIcon className="w-8 h-8 text-brand-purple" />
             </div>
             <h3 className="text-xl font-semibold mb-2">500+ AI Tools</h3>
             <p className="text-gray-600 dark:text-gray-400">Curated collection of the best AI tools</p>
           </div>
           
           <div className="text-center">
             <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
               <RocketLaunchIcon className="w-8 h-8 text-brand-blue" />
             </div>
             <h3 className="text-xl font-semibold mb-2">Expert Knowledge</h3>
             <p className="text-gray-600 dark:text-gray-400">Learn from industry experts</p>
           </div>
           
           <div className="text-center">
             <div className="w-16 h-16 bg-accent-100 dark:bg-accent-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
               <svg className="w-8 h-8 text-brand-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
               </svg>
             </div>
             <h3 className="text-xl font-semibold mb-2">Active Community</h3>
             <p className="text-gray-600 dark:text-gray-400">Connect with AI enthusiasts</p>
           </div>
        </motion.div>
      </div>
    </section>
  )
}

