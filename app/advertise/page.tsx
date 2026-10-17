import Link from 'next/link';
import { ContactEmailText } from '@/components/ContactEmail';
import { getSiteContactEmail } from '@/lib/site-config';

export const metadata = {
  title: 'Sponsor AI One Stop Shop',
  description: 'Put your AI tool in front of people choosing tools to work smarter. Clearly labeled sponsored spots on an honest, curated directory. Founding sponsor pricing.',
  alternates: { canonical: '/advertise' },
};

const packages = [
  {
    name: 'Featured Tool',
    price: '$39',
    duration: '30 days',
    description: 'A "Sponsored ad" card in our homepage sponsored row and at the top of your category page, plus a "Sponsored ad" badge on your tool page.',
    package: 'featured-tool',
  },
  {
    name: 'Category Spotlight',
    price: '$69',
    duration: '30 days',
    description: 'The only sponsor in one category: a labeled block at the top of the category page with your logo, a short blurb and one link. Includes Featured Tool in that category.',
    package: 'category-spotlight',
  },
  {
    name: 'Newsletter Sponsor',
    price: '$29',
    duration: 'per issue',
    description: 'One labeled sponsor block (up to 60 words and one link) in "One Task, One Tool," our tool-tips newsletter. Opening once the list launches.',
    package: 'newsletter',
    isDisabled: true,
  },
  {
    name: 'Founding Bundle',
    price: '$99',
    duration: '30 days',
    description: 'Featured Tool + Category Spotlight + 2 newsletter slots. Limited to 5.',
    package: 'founding-bundle',
  },
];

export default function AdvertisePage() {
  return (
    <div className="scroll-mt-16">
      <section className="section-spacing">
        <div className="container-max max-w-4xl">
          <h1 className="heading-1 mb-6">Sponsor AI One Stop Shop</h1>
          
          <p className="text-lead text-[#171C26] mb-12">
            Put your AI tool in front of people choosing tools to work smarter. Clearly labeled sponsored spots on an honest, curated directory. Founding sponsor pricing.
          </p>

          <div className="prose prose-lg max-w-none space-y-12">
            {/* Introduction */}
            <div className="space-y-4">
              <p>
                <strong>We are oneTomorrow.</strong> We run AI One Stop Shop, a free, curated directory of AI tools for people who want technology to give them more time for the work only they can do. No fake ratings. No paid rankings. Just honest notes on what each tool is for, what it costs, and who it fits.
              </p>
              <p>
                If you make an AI tool that genuinely helps people, a sponsored spot puts you in front of readers who are actively choosing tools.
              </p>
            </div>

            {/* How sponsorship works */}
            <div>
              <h2 className="heading-2 mb-4">How sponsorship works here</h2>
              <div className="bg-[#F3EFFF] border-2 border-[#6C39EF] rounded-xl p-6 mb-6">
                <p className="text-lg font-semibold mb-2">
                  Money buys a labeled spot, never our opinion.
                </p>
                <p>
                  Every sponsored placement says <strong>Sponsored ad</strong> right on it and sits apart from our picks. Sponsors can't buy a higher rank, a better write-up, a place in "best of" lists, or the removal of honest criticism. If your tool is also in our directory, we review it exactly like every other tool.
                </p>
              </div>
              <p>
                We'd rather be upfront: <strong>we're a new site.</strong> Our audience is still small and growing, so we don't promise traffic, clicks or sales. What we do promise is a clearly labeled, well-placed spot for the full term, honest first-party numbers at the end, and a real person to talk to.
              </p>
            </div>

            {/* Founding sponsor pricing */}
            <div>
              <h2 className="heading-2 mb-6">Founding sponsor pricing</h2>
              <p className="mb-6">
                We're opening <strong>5 founding sponsor spots</strong> at launch prices. Founding sponsors keep their price for up to 3 renewals.
              </p>

              <div className="space-y-4 not-prose">
                {packages.map((pkg) => {
                  return (
                    <div key={pkg.name} className="card">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="heading-3 mb-2">{pkg.name}</h3>
                          <p className="text-[#5B657B] mb-4">{pkg.description}</p>
                        </div>
                        <div className="flex flex-col items-start md:items-end gap-2 md:text-right">
                          <div>
                            <span className="text-2xl font-bold text-[#171C26]">{pkg.price}</span>
                            {pkg.duration && (
                              <span className="text-[#5B657B] ml-2">· {pkg.duration}</span>
                            )}
                          </div>
                          {pkg.isDisabled ? (
                            <span className="text-sm text-[#5B657B] italic mt-2">
                              Opening once the list launches
                            </span>
                          ) : (
                            <Link
                              href={`/advertise/request?package=${pkg.package}`}
                              className="btn-primary mt-2"
                            >
                              Request a spot
                            </Link>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-[#5B657B] mt-4">
                        one-time · {pkg.duration} · no auto-renewal · plus sales tax where it applies
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* What you'll get */}
            <div>
              <h2 className="heading-2 mb-4">What you'll get at the end</h2>
              <p>
                A short report with the numbers we measure ourselves: how many times your sponsored spot was shown, and how many people clicked through. We don't use tracking cookies or third-party ad pixels, so these are simple, honest counts.
              </p>
            </div>

            {/* Who we say yes to */}
            <div>
              <h2 className="heading-2 mb-4">Who we say yes to</h2>
              <p>
                Tools that help people get real work done, with clear pricing and no deceptive claims. We say no to tools aimed at children, adult content, get-rich-quick schemes, or anything that's unsafe or misleading. We may decline any sponsorship that isn't a good fit for our readers. If we do, you get a full refund.
              </p>
            </div>

            {/* How to book */}
            <div>
              <h2 className="heading-2 mb-4">How to book</h2>
              <ol className="space-y-3 list-decimal list-inside">
                <li><strong>Request a spot.</strong> Tell us about your tool and the package you'd like.</li>
                <li><strong>We check fit</strong> (usually within 2 business days) and email you a secure payment link (Stripe).</li>
                <li><strong>Send your assets:</strong> logo, a short blurb and your link.</li>
                <li><strong>You go live</strong> on the start date we agree on.</li>
              </ol>
              <div className="mt-6">
                <Link href="/advertise/request" className="btn-primary">
                  Request a sponsored spot →
                </Link>
              </div>
            </div>

            {/* Refunds */}
            <div>
              <h2 className="heading-2 mb-4">Refunds and terms</h2>
              <p className="mb-4">
                For full refund terms, removal policies, and all other conditions, see our{' '}
                <Link href="/sponsor-terms" className="text-[#6C39EF] hover:underline focus-ring rounded font-semibold">
                  Sponsor Terms
                </Link>
                .
              </p>
              <p className="text-sm text-[#5B657B]">
                Also see:{' '}
                <Link href="/disclosure" className="text-[#6C39EF] hover:underline focus-ring rounded">
                  How we make money
                </Link>
                {' · '}
                <Link href="/how-we-rank" className="text-[#6C39EF] hover:underline focus-ring rounded">
                  How we rank
                </Link>
              </p>
            </div>

            {/* Questions */}
            {getSiteContactEmail() && (
              <div className="bg-[#F3EFFF] border border-[#6C39EF] rounded-lg p-6">
                <h2 className="heading-2 mb-3">Questions?</h2>
                <p>
                  Email{' '}
                  <ContactEmailText className="text-[#6C39EF] hover:underline focus-ring rounded" />
                  . A real person reads every message.
                </p>
              </div>
            )}

            {/* Footer quote */}
            <div className="text-center text-lg text-[#5B657B] italic border-t border-[#E5E1DC] pt-8">
              The best AI tools don't replace you. They give you more time for the work only you can do.
            </div>

            <div className="mt-12">
              <p className="text-sm text-[#5B657B]">
                Last updated: October 17, 2026
                <br />
                <strong>Note:</strong> Copy pending legal review.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
