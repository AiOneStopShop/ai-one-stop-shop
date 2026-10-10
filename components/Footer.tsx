import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-[#171C26] text-white py-12 mt-24">
      <div className="container-max">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* About */}
          <div>
            <h3 className="font-dm-sans font-semibold text-lg mb-4">
              AI One Stop Shop
            </h3>
            <p className="text-sm text-gray-300 mb-4">
              Honest help choosing AI tools, from people who've tried them.
            </p>
          </div>

          {/* Tools */}
          <div>
            <h3 className="font-dm-sans font-semibold text-base mb-4">
              Discover
            </h3>
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
            <h3 className="font-dm-sans font-semibold text-base mb-4">
              Trust
            </h3>
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
            <h3 className="font-dm-sans font-semibold text-base mb-4">
              Legal
            </h3>
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
              <li>
                <a 
                  href="mailto:hello@aionestop.shop" 
                  className="text-sm text-gray-300 hover:text-white transition-colors focus-ring rounded"
                >
                  Contact
                </a>
              </li>
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
            <a 
              href="https://onetomorrow.online" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-white transition-colors focus-ring rounded"
            >
              A oneTomorrow venture
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
