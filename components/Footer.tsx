import Link from 'next/link';
import { ContactEmail, ContactEmailText } from '@/components/ContactEmail';
import { getSiteContactEmail, isAffiliateLive } from '@/lib/site-config';

export function Footer() {
  const siteContactEmail = getSiteContactEmail();
  const affiliateLive = isAffiliateLive();

  return (
    <footer className="border-t border-line bg-cream py-9 text-[0.95rem] text-soft">
      <div className="container-max">
        {/* Disclosure */}
        <div className="mb-6 pb-6 border-b border-line">
          <p className="text-sm text-soft max-w-3xl">
            {affiliateLive
              ? "We earn money from clearly labeled sponsored ads, some paid links, and our own kits. Payments never change how we rank tools."
              : "We earn money from clearly labeled sponsored ads and our own kits. Payments never change how we rank tools."
            }{' '}
            <Link href="/disclosure" className="text-green hover:underline focus-ring rounded">
              Read our disclosure
            </Link>
          </p>
          {process.env.NEXT_PUBLIC_LEGAL_V2 === 'true' && (
            <p className="text-sm text-soft max-w-3xl mt-3">
              <strong>Terms:</strong> By submitting a tool or using this site, you agree to our{' '}
              <Link href="/terms" className="text-green hover:underline focus-ring rounded">
                Terms of Service
              </Link>
              . For copyright concerns, see our{' '}
              <Link href="/dmca" className="text-green hover:underline focus-ring rounded">
                Copyright &amp; DMCA policy
              </Link>
              .
            </p>
          )}
        </div>

        {/* Main footer row */}
        <div className="flex flex-wrap justify-between gap-4">
          <span>
            © 2026 AI One Stop Shop · A oneTomorrow venture
            {siteContactEmail && (
              <>
                {' · '}
                <ContactEmailText className="text-green hover:underline focus-ring rounded" />
              </>
            )}
          </span>
          <ul className="flex flex-wrap gap-x-5 gap-y-1 list-none m-0 p-0">
            <li>
              <Link href="/privacy" className="text-green hover:underline focus-ring rounded">
                Privacy
              </Link>
            </li>
            <li>
              <Link href="/terms" className="text-green hover:underline focus-ring rounded">
                Terms
              </Link>
            </li>
            <li>
              <Link href="/disclosure" className="text-green hover:underline focus-ring rounded">
                Disclosure
              </Link>
            </li>
            <li>
              <Link href="/advertise" className="text-green hover:underline focus-ring rounded">
                Advertise
              </Link>
            </li>
            <li>
              <Link href="/how-we-rank" className="text-green hover:underline focus-ring rounded">
                How we rank
              </Link>
            </li>
            <li>
              <Link href="/about" className="text-green hover:underline focus-ring rounded">
                About
              </Link>
            </li>
          </ul>
        </div>

        {process.env.NEXT_PUBLIC_SITE_POSTAL_ADDRESS && (
          <p className="text-xs text-soft whitespace-pre-line mt-4">
            {process.env.NEXT_PUBLIC_SITE_POSTAL_ADDRESS}
          </p>
        )}
      </div>
    </footer>
  );
}
