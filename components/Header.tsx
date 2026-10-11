'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { Menu, X, Search } from 'lucide-react';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };

    if (mobileMenuOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [mobileMenuOpen]);

  return (
    <>
      <a href="#main" className="skip-link">
        Skip to main content
      </a>
      
      <header className="sticky top-0 z-40 bg-[#F9F8F5] border-b border-[#E5E1DC]">
        <div className="container-max">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link 
              href="/" 
              className="flex items-center gap-2 focus-ring rounded-lg px-2 py-1"
              aria-label="AI One Stop Shop - Home"
            >
              <span className="text-2xl" aria-hidden="true">✨</span>
              <span className="font-dm-sans font-bold text-lg text-[#171C26]">
                AI One Stop Shop
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6" aria-label="Main navigation">
              <Link 
                href="/tools" 
                className="text-[#171C26] hover:text-[#6C39EF] transition-colors focus-ring rounded px-2 py-1"
              >
                Tools
              </Link>
              <Link 
                href="/finder" 
                className="text-[#171C26] hover:text-[#6C39EF] transition-colors focus-ring rounded px-2 py-1"
              >
                Finder
              </Link>
              <Link 
                href="/compare" 
                className="text-[#171C26] hover:text-[#6C39EF] transition-colors focus-ring rounded px-2 py-1"
              >
                Compare
              </Link>
              <Link 
                href="/our-kits" 
                className="text-[#171C26] hover:text-[#6C39EF] transition-colors focus-ring rounded px-2 py-1"
              >
                Our Kits
              </Link>
              <Link 
                href="/about" 
                className="text-[#171C26] hover:text-[#6C39EF] transition-colors focus-ring rounded px-2 py-1"
              >
                About
              </Link>
            </nav>

            {/* Mobile Menu Button */}
            <button
              ref={menuButtonRef}
              type="button"
              className="md:hidden p-2 focus-ring rounded-lg"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <nav 
            id="mobile-menu"
            className="md:hidden border-t border-[#E5E1DC] bg-[#F9F8F5]"
            aria-label="Mobile navigation"
          >
            <div className="container-max py-4 flex flex-col gap-4">
              <Link 
                href="/tools" 
                className="text-[#171C26] hover:text-[#6C39EF] transition-colors focus-ring rounded px-2 py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Tools
              </Link>
              <Link 
                href="/finder" 
                className="text-[#171C26] hover:text-[#6C39EF] transition-colors focus-ring rounded px-2 py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Finder
              </Link>
              <Link 
                href="/compare" 
                className="text-[#171C26] hover:text-[#6C39EF] transition-colors focus-ring rounded px-2 py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Compare
              </Link>
              <Link 
                href="/our-kits" 
                className="text-[#171C26] hover:text-[#6C39EF] transition-colors focus-ring rounded px-2 py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Our Kits
              </Link>
              <Link 
                href="/about" 
                className="text-[#171C26] hover:text-[#6C39EF] transition-colors focus-ring rounded px-2 py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                About
              </Link>
            </div>
          </nav>
        )}
      </header>
    </>
  );
}
