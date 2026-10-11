import Link from 'next/link';
import { BrandName } from '@/components/BrandName';
import { ContactEmail } from '@/components/ContactEmail';
import { getSiteContactEmail } from '@/lib/site-config';

export function Footer() {
  return (
    <footer className="bg-[#171C26] text-white py-12 mt-24">
      <div className="container-max">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* About */}
          <div>
            <p className="font-dm-sans font-semibold text-lg mb-4">
              AI One Stop Shop
            </p>
            <p className="text-sm text-gray-300 mb-4">
              Curated AI tools directory. No fake ratings, no paid rankings.
            </p>
            {process.env.NEXT_PUBLIC_SITE_POSTAL_ADDRESS && (
              <p className="text-xs text-gray-400 whitespace-pre-line">
                {process.env.NEXT_PUBLIC_SITE_POSTAL_ADDRESS}
              </p>
            )}
          </div>

          {/* Tools */}
          <div>
            <p className="font-dm-sans font-semibold text-base mb-4">
              Discover
            </p>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/tools" 
                  className="text-sm text-gray-300 hover:text-white transition-colors focus-ring rounded"
                >
                  All Tools
                </Link>
              </li>
              <li>
                <Link 
                  href="/our-kits" 
                  className="text-sm text-gray-300 hover:text-white transition-colors focus-ring rounded"
                >
                  Our Kits
                </Link>
              </li>
              <li>
                <Link 
                  href="/submit" 
                  className="text-sm text-gray-300 hover:text-white transition-colors focus-ring rounded"
                >
                  Submit a Tool
                </Link>
              </li>
            </ul>
          </div>

          {/* Trust */}
          <div>
            <p className="font-dm-sans font-semibold text-base mb-4">
              Trust
            </p>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/how-we-rank" 
                  className="text-sm text-gray-300 hover:text-white transition-colors focus-ring rounded"
                >
                  How We Rank
                </Link>
              </li>
              <li>
                <Link 
                  href="/disclosure" 
                  className="text-sm text-gray-300 hover:text-white transition-colors focus-ring rounded"
                >
                  Disclosure
                </Link>
              </li>
              <li>
                <Link 
                  href="/about" 
                  className="text-sm text-gray-300 hover:text-white transition-colors focus-ring rounded"
                >
                  About
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <p className="font-dm-sans font-semibold text-base mb-4">
              Legal
            </p>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/privacy" 
                  className="text-sm text-gray-300 hover:text-white transition-colors focus-ring rounded"
                >
                  Privacy
                </Link>
              </li>
              <li>
                <Link 
                  href="/terms" 
                  className="text-sm text-gray-300 hover:text-white transition-colors focus-ring rounded"
                >
                  Terms
                </Link>
              </li>
              {getSiteContactEmail() && (
                <li>
                  <ContactEmail className="text-sm text-gray-300 hover:text-white transition-colors focus-ring rounded">
                    Contact
                  </ContactEmail>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Disclosure */}
        <div className="border-t border-gray-700 pt-8 mb-8">
          <p className="text-sm text-gray-400 max-w-3xl">
            Some links here are paid (affiliate) links. If you sign up through one, we may earn a commission at no extra cost to you. Payments never change how we rank tools.{' '}
            <Link href="/disclosure" className="text-white hover:underline focus-ring rounded">
              Read our disclosure
            </Link>
          </p>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-700 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-400">
          <p>© 2026 AI One Stop Shop · Made in Washington State</p>
          <p className="text-xs">
            <BrandName className="hover:text-white transition-colors focus-ring rounded">
              A oneTomorrow venture
            </BrandName>
          </p>
        </div>
      </div>
    </footer>
  );
}
