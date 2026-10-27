import Link from 'next/link';
import { ContactEmail } from '@/components/ContactEmail';
import { CookieSettingsButton } from '@/components/CookieSettingsButton';
import { consentBannerNeeded } from '@/lib/cookie-consent';
import { getSiteContactEmail, isAffiliateLive } from '@/lib/site-config';

type FooterLink = { href: string; label: string };

const GROUPS: { title: string; links: FooterLink[] }[] = [
  {
    title: 'Find tools',
    links: [
      { href: '/tools', label: 'AI tools' },
      { href: '/categories', label: 'Categories' },
      { href: '/finder', label: 'Tool finder' },
      { href: '/personas', label: 'Toolkits by role' },
      { href: '/guides', label: 'Guides' },
      { href: '/budget', label: 'Budget planner' },
    ],
  },
  {
    title: 'How we work',
    links: [
      { href: '/how-we-rank', label: 'How we rank' },
      { href: '/disclosure', label: 'Disclosure' },
      { href: '/our-kits', label: 'Our kits' },
      { href: '/about', label: 'About' },
      { href: '/newsletter', label: 'Newsletter' },
    ],
  },
  {
    title: 'Work with us',
    links: [
      { href: '/submit', label: 'Submit a tool' },
      { href: '/partners', label: 'Partners' },
      { href: '/advertise', label: 'Advertise' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { href: '/privacy', label: 'Privacy' },
      { href: '/terms', label: 'Terms' },
      ...(process.env.NEXT_PUBLIC_LEGAL_V2 === 'true' ? [{ href: '/dmca', label: 'Copyright & DMCA' }] : []),
    ],
  },
];

const linkClass = 'text-green underline decoration-line decoration-1 underline-offset-4 hover:decoration-green focus-ring rounded';

export function Footer() {
  const siteContactEmail = getSiteContactEmail();
  const affiliateLive = isAffiliateLive();

  return (
    <footer className="border-t border-line bg-cream-2/60 pt-12 pb-10 text-[0.95rem] text-soft">
      <div className="container-max">
        <nav aria-label="Footer" className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-8 pb-10">
          {GROUPS.map((group) => (
            <div key={group.title}>
              <p className="font-fraunces font-bold text-green text-lg mb-3">{group.title}</p>
              <ul className="space-y-2 list-none m-0 p-0">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className={linkClass}>
                      {link.label}
                    </Link>
                  </li>
                ))}
                {group.title === 'Legal' && consentBannerNeeded() && (
                  <li>
                    <CookieSettingsButton className={`${linkClass} text-left`}>Cookie settings</CookieSettingsButton>
                  </li>
                )}
                {group.title === 'Work with us' && siteContactEmail && (
                  <li>
                    <ContactEmail className={linkClass}>Contact</ContactEmail>
                  </li>
                )}
              </ul>
            </div>
          ))}
        </nav>

        <div className="border-t border-line pt-6 space-y-3">
          <p className="text-sm text-soft max-w-3xl">
            {affiliateLive
              ? 'We earn money from clearly labeled sponsored ads, some paid links, and our own kits. Payments never change how we rank tools.'
              : 'We earn money from clearly labeled sponsored ads and our own kits. Payments never change how we rank tools.'}{' '}
            <Link href="/disclosure" className="text-green underline underline-offset-2 focus-ring rounded">
              Read our disclosure
            </Link>
          </p>
          {process.env.NEXT_PUBLIC_LEGAL_V2 === 'true' && (
            <p className="text-sm text-soft max-w-3xl">
              <strong>Terms:</strong> By submitting a tool or using this site, you agree to our{' '}
              <Link href="/terms" className="text-green underline underline-offset-2 focus-ring rounded">
                Terms of Service
              </Link>
              . For copyright concerns, see our{' '}
              <Link href="/dmca" className="text-green underline underline-offset-2 focus-ring rounded">
                Copyright &amp; DMCA policy
              </Link>
              .
            </p>
          )}
          <p className="text-sm m-0">
            © 2026 AI One Stop Shop · A oneTomorrow venture
            {siteContactEmail && (
              <>
                {' · '}
                <ContactEmail className="text-green underline underline-offset-2 focus-ring rounded" />
              </>
            )}
          </p>
          {process.env.NEXT_PUBLIC_SITE_POSTAL_ADDRESS && (
            <p className="text-xs text-soft whitespace-pre-line">{process.env.NEXT_PUBLIC_SITE_POSTAL_ADDRESS}</p>
          )}
        </div>
      </div>
    </footer>
  );
}
