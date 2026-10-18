import Link from 'next/link';
import { ContactEmailText } from '@/components/ContactEmail';
import { getSiteContactEmail, isAffiliateLive } from '@/lib/site-config';
import { PageIntro } from '@/components/PageIntro';

export const metadata = {
  title: 'Partner with AI One Stop Shop',
  description: 'Work with us: affiliate programs, sponsored placements, and newsletter sponsorships for AI tool makers.',
  alternates: { canonical: '/partners' },
};

export default function PartnersPage() {
  return (
    <div className="scroll-mt-16">
      <PageIntro
        title="Partner with AI One Stop Shop"
        accent="mug"
        lead={<>Three ways to work with us</>}
      />
      <section className="py-12 md:py-16">
        <div className="container-max max-w-3xl">
          <div className="guide-prose">
            <div>
              <h2 className="heading-2 mb-4">Who we are</h2>
              <p>
                <strong>We are oneTomorrow.</strong> We run AI One Stop Shop, a curated directory of AI tools for people who want technology to give them more time for the work only they can do. We gather each tool's pricing and features from its own site, explain them in plain English, and keep improving our checks over time. Always confirm current pricing on the tool's site.
              </p>
              <p>
                Our readers trust us because we're upfront: <strong>money never changes our ranking.</strong> Tools that pay us are clearly labeled, and they stay separate from our editorial picks.
              </p>
            </div>

            <div className="panel-honest">
              <h2 className="heading-2 mb-4">The rule</h2>
              <p className="text-lg font-semibold mb-4">
                Payments never change how we rank tools.
              </p>
              <p className="text-lg">
                If you pay for a sponsored spot, you get a clearly labeled placement kept separate from our picks. If we link to you with a paid referral link, it's marked "Paid link" right next to it. Your tool's position in our directory is decided the same way as every other tool's, using our <Link href="/how-we-rank" className="text-white underline hover:no-underline">published ranking approach</Link>. Whether you pay us plays no part.
              </p>
            </div>

            <div>
              <h2 className="heading-2 mb-4">Three ways to work with us</h2>
              
              <div className="space-y-6">
                <div className="card">
                  <h3 className="heading-3 mb-3">1. Affiliate or partner programs</h3>
                  <p className="mb-4">
                    If you have a partner or affiliate program, we may add a referral link to your tool's page. Every paid link is clearly marked <strong className="text-orange-ink">"Paid link"</strong> right next to it, and we use <code>rel="sponsored nofollow noopener"</code> so search engines know it's a commercial relationship.
                  </p>
                  <p className="mb-4">
                    We don't promise placements, coverage, reviews or a better rank. A commission pays for referrals, not for a review or a listing, and joining your program won't change what we write. If we add a referral link, it's because your program terms work for us and our readers.
                  </p>
                  {!isAffiliateLive() ? (
                    <p className="text-sm text-soft">
                      <strong>Note:</strong> No paid links are active yet. We review each program before we add any referral code.
                    </p>
                  ) : (
                    <p className="text-sm text-soft">
                      <strong>Note:</strong> Some listings now have paid links. Each one is marked "Paid link" next to it.
                    </p>
                  )}
                </div>

                <div className="card">
                  <h3 className="heading-3 mb-3">2. Sponsored placements</h3>
                  <p className="mb-4">
                    Tool makers can pay for a labeled spot on our homepage, at the top of a category page, or in our newsletter. Every sponsored placement says <strong>Sponsored ad</strong> and sits apart from our picks.
                  </p>
                  <p>
                    Learn more:{' '}
                    <Link href="/advertise" className="text-green hover:underline focus-ring rounded font-semibold">
                      Sponsor AI One Stop Shop
                    </Link>
                  </p>
                </div>

                <div className="card">
                  <h3 className="heading-3 mb-3">3. Newsletter sponsorships</h3>
                  <p className="mb-4">
                    Once our newsletter launches, tool makers can sponsor an issue with a clearly labeled block.
                  </p>
                  <p className="text-sm text-soft italic">
                    Opening once the list launches. See{' '}
                    <Link href="/advertise" className="text-green hover:underline focus-ring rounded">
                      sponsorship options
                    </Link>
                    .
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="heading-2 mb-4">What we look for</h2>
              <ul className="space-y-2">
                <li>AI tools that help people get real work done</li>
                <li>Clear, honest pricing on your site</li>
                <li>No deceptive claims or dark patterns</li>
                <li>Not aimed at children under 13</li>
              </ul>
              <p className="mt-4">
                If your tool fits, we're happy to review it for the directory. If you want to work with us on a paid placement or referral link, tell us about your program below.
              </p>
            </div>

            <div>
              <h2 className="heading-2 mb-4">Interested in working together?</h2>
              <p className="mb-6">
                Fill out our request form and tell us what you're looking for. A person on our team reviews every reply before it goes out. We use AI to help us sort and draft, never to replace human judgment.
              </p>
              <div className="flex gap-4 flex-wrap">
                <Link href="/advertise/request?package=partner-program" className="btn-primary">
                  Request a partnership →
                </Link>
                <Link href="/submit" className="btn-secondary">
                  Submit your tool
                </Link>
              </div>
            </div>

            {getSiteContactEmail() && (
              <div className="note">
                <h2 className="heading-2 mb-3">Questions?</h2>
                <p>
                  Email{' '}
                  <ContactEmailText className="text-green hover:underline focus-ring rounded" />
                  . We're happy to explain how any of this works.
                </p>
              </div>
            )}

            <div>
              <h2 className="heading-2 mb-4">Read more</h2>
              <ul className="space-y-2">
                <li>
                  <Link href="/disclosure" className="text-green hover:underline focus-ring rounded">
                    How we make money
                  </Link>{' '}
                  – Full disclosure of revenue streams
                </li>
                <li>
                  <Link href="/how-we-rank" className="text-green hover:underline focus-ring rounded">
                    How we rank tools
                  </Link>{' '}
                  – Our editorial methodology
                </li>
                <li>
                  <Link href="/about" className="text-green hover:underline focus-ring rounded">
                    About us
                  </Link>{' '}
                  – Who we are and why we built this
                </li>
              </ul>
            </div>

            <div className="text-center text-lg text-soft italic border-t border-line pt-8">
              The best AI tools don't replace you. They give you more time for the work only you can do.
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
