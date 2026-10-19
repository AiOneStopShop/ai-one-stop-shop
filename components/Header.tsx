'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { Menu, X } from 'lucide-react';

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
      <nav aria-label="Skip links">
        <a href="#main" className="skip-link">
          Skip to main content
        </a>
      </nav>
      
      <header className="sticky top-0 z-40 bg-cream border-b border-line">
        <div className="container-max">
          <div className="flex items-center justify-between min-h-[68px]">
            {/* Logo */}
            <Link 
              href="/" 
              className="flex items-center focus-ring rounded-lg px-2 py-1"
              aria-label="AI One Stop Shop - Home"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo-wordmark-light.svg"
                alt="AI One Stop Shop"
                width={200}
                height={40}
                className="h-9 w-auto md:h-10"
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
              <Link 
                href="/tools" 
                className="text-ink hover:bg-cream-2 transition-colors focus-ring rounded-full px-3 py-2 inline-flex items-center min-h-[44px]"
              >
                Tools
              </Link>
              <Link 
                href="/categories" 
                className="text-ink hover:bg-cream-2 transition-colors focus-ring rounded-full px-3 py-2 inline-flex items-center min-h-[44px]"
              >
                Categories
              </Link>
              <Link 
                href="/personas" 
                className="text-ink hover:bg-cream-2 transition-colors focus-ring rounded-full px-3 py-2 inline-flex items-center min-h-[44px]"
              >
                Personas
              </Link>
              <Link 
                href="/budget" 
                className="text-ink hover:bg-cream-2 transition-colors focus-ring rounded-full px-3 py-2 inline-flex items-center min-h-[44px]"
              >
                Budget
              </Link>
              <Link 
                href="/compare" 
                className="text-ink hover:bg-cream-2 transition-colors focus-ring rounded-full px-3 py-2 inline-flex items-center min-h-[44px]"
              >
                Compare
              </Link>
              <Link 
                href="/finder" 
                className="text-ink hover:bg-cream-2 transition-colors focus-ring rounded-full px-3 py-2 inline-flex items-center min-h-[44px]"
              >
                Finder
              </Link>
              <Link 
                href="/about" 
                className="text-ink hover:bg-cream-2 transition-colors focus-ring rounded-full px-3 py-2 inline-flex items-center min-h-[44px]"
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
            className="md:hidden border-t border-line bg-cream"
            aria-label="Mobile navigation"
          >
            <div className="container-max py-4 flex flex-col gap-4">
              <Link 
                href="/tools" 
                className="text-ink hover:bg-cream-2 transition-colors focus-ring rounded px-3 py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Tools
              </Link>
              <Link 
                href="/categories" 
                className="text-ink hover:bg-cream-2 transition-colors focus-ring rounded px-3 py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Categories
              </Link>
              <Link 
                href="/personas" 
                className="text-ink hover:bg-cream-2 transition-colors focus-ring rounded px-3 py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Personas
              </Link>
              <Link 
                href="/budget" 
                className="text-ink hover:bg-cream-2 transition-colors focus-ring rounded px-3 py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Budget
              </Link>
              <Link 
                href="/compare" 
                className="text-ink hover:bg-cream-2 transition-colors focus-ring rounded px-3 py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Compare
              </Link>
              <Link 
                href="/finder" 
                className="text-ink hover:bg-cream-2 transition-colors focus-ring rounded px-3 py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Finder
              </Link>
              <Link 
                href="/about" 
                className="text-ink hover:bg-cream-2 transition-colors focus-ring rounded px-3 py-2"
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
