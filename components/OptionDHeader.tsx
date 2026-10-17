'use client'

import { useState } from 'react'
import { Bars3Icon, XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'

const navigation = [
  { name: 'How it works', href: '#how' },
  { name: 'Explore', href: '/tools' },
]

export default function OptionDHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="bg-cream border-b border-line sticky top-0 z-50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between h-16 sm:h-[68px]">
          {/* Logo */}
          <a 
            href="/" 
            className="font-serif font-bold text-xl sm:text-[1.3rem] text-green hover:text-green-light transition-colors"
          >
            AI One Stop Shop
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Main">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="inline-flex items-center min-h-[44px] px-3 text-ink hover:bg-cream-dark rounded-full transition-colors"
              >
                {item.name}
              </a>
            ))}
            <button
              type="button"
              aria-label="Search tools"
              className="inline-flex items-center justify-center w-11 h-11 rounded-full hover:bg-cream-dark transition-colors"
            >
              <MagnifyingGlassIcon className="w-5 h-5 text-ink" />
            </button>
          </nav>

          {/* Mobile menu button */}
          <button
            type="button"
            className="md:hidden text-ink"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <XMarkIcon className="h-6 w-6" />
            ) : (
              <Bars3Icon className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="block px-3 py-2 text-ink hover:bg-cream-dark rounded-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </a>
            ))}
          </div>
        )}
      </div>
    </header>
  )
}
