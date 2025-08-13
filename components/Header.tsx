'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Bars3Icon, XMarkIcon, SparklesIcon } from '@heroicons/react/24/outline'

const navigation = [
  { name: 'Tools', href: '/tools' },
  { name: 'AI Agents', href: '/agents' },
  { name: 'Toolkit Builder', href: '/toolkit' },
  { name: 'Knowledge', href: '/knowledge' },
  { name: 'Community', href: '/community' },
  { name: 'About', href: '/about' },
]

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="bg-white/80 dark:bg-dark-900/80 backdrop-blur-md border-b border-gray-200 dark:border-dark-700 sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="Top">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <a href="/" className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-br from-brand-purple to-brand-blue rounded-full flex items-center justify-center mr-3">
                <SparklesIcon className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  AIOneStop
                </span>
                <span className="text-xs text-brand-orange font-medium -mt-1">
                  shop
                </span>
              </div>
            </a>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-gray-700 dark:text-gray-300 hover:text-brand-purple dark:hover:text-brand-purple font-medium transition-colors"
              >
                {item.name}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <button className="btn-secondary">
              Sign In
            </button>
            <button className="btn-primary">
              Get Started
            </button>
          </div>

          <div className="md:hidden">
            <button
              type="button"
              className="text-gray-700 dark:text-gray-300 hover:text-ai-600 dark:hover:text-ai-400"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? (
                <XMarkIcon className="h-6 w-6" aria-hidden="true" />
              ) : (
                <Bars3Icon className="h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden"
          >
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white dark:bg-dark-900 border-t border-gray-200 dark:border-dark-700">
              {navigation.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-ai-600 dark:hover:text-ai-400 font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </a>
              ))}
              <div className="pt-4 space-y-2">
                <button className="w-full btn-secondary">
                  Sign In
                </button>
                <button className="w-full btn-primary">
                  Get Started
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </nav>
    </header>
  )
}
