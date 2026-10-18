import Link from 'next/link';
import { PageIntro } from '@/components/PageIntro';
import { ContactEmailText } from '@/components/ContactEmail';
import { getSiteContactEmail, getOperatorLegalName } from '@/lib/site-config';

export const metadata = {
  title: 'Sponsor Terms (DRAFT)',
  description: 'Draft outline of our future Sponsor Terms. Not in effect.',
  alternates: { canonical: '/sponsor-terms' },
  robots: {
    index: false,
    follow: false,
  },
};

export default function SponsorTermsPage() {
  return (
    <div className="scroll-mt-16">
      <PageIntro
        title="Sponsor Terms (DRAFT)"
        accent="notebook"
        lead="The topics our Sponsor Terms will cover. Not an offer, not a contract, and not in effect yet."
      />
      <section className="py-12 md:py-16">
        <div className="container-max max-w-3xl">
          <div className="bg-amber-50 border border-amber-400 rounded-2xl p-6 mb-10" role="note">
            <p className="text-amber-900 m-0">
              <strong>DRAFT outline. Not in effect.</strong>{' '}
              This page lists the topics our Sponsor Terms will cover. It is <strong>not an offer and not a contract</strong>, and nothing here binds you or us. We're finalizing the terms with our attorney and aren't taking paid bookings until they're published. You can still{' '}
              <Link href="/advertise/request" className="text-green hover:underline focus-ring rounded">
                request a sponsored spot
              </Link>
              .
            </p>
          </div>

          <div className="guide-prose">
            <p className="text-sm text-soft">
              Last updated: October 17, 2026 (DRAFT)
            </p>

            <p className="text-sm italic text-soft">
              Planned topics only. The final wording may differ.
            </p>

            <div>
              <h2 className="heading-2 mb-4">1. Scope of Agreement</h2>
              <p className="text-soft italic">
                [To be completed: Defines the sponsorship relationship, packages available, and what each package includes. References the advertise page for current pricing.]
              </p>
            </div>

            <div>
              <h2 className="heading-2 mb-4">2. Payment and Pricing</h2>
              <p className="text-soft italic">
                [To be completed: One-time payment terms, no auto-renewal, sales tax application, founding sponsor pricing lock (up to 3 renewals), payment processor (Stripe).]
              </p>
            </div>

            <div>
              <h2 className="heading-2 mb-4">3. Refund Policy</h2>
              <p className="text-soft italic">
                [To be completed: Full refund if declined by us or sponsor cancels before go-live; no refund for elapsed time after go-live; pro-rata refund if we remove placement for non-breach reasons; day-for-day extension for downtime over 24 hours in total; no refund for breach (misleading claims, unlawful content, etc.).]
              </p>
            </div>

            <div>
              <h2 className="heading-2 mb-4">4. Content Restrictions</h2>
              <p className="text-soft italic">
                [To be completed: Prohibited content (tools targeting children under 13, adult content, illegal activity, get-rich-quick schemes, malware, misleading claims); right to decline any sponsorship; editorial independence clause (verbatim from plan §2.4).]
              </p>
            </div>

            <div>
              <h2 className="heading-2 mb-4">5. Intellectual Property and Asset License</h2>
              <p className="text-soft italic">
                [To be completed: Sponsor grants limited license to use logo, blurb, and company name for the placement; sponsor warrants they own or have rights to the assets; we may edit blurb for clarity/honesty; license terminates at end of term; sponsor retains all IP.]
              </p>
            </div>

            <div>
              <h2 className="heading-2 mb-4">6. Editorial Independence and Labeling</h2>
              <p className="text-soft italic">
                [To be completed: FTC-compliant "Sponsored ad" labeling; sponsored placements never affect rankings, reviews, or "best of" lists; we may review sponsor's tool separately under same criteria as all other tools; outbound links use rel="sponsored noopener".]
              </p>
            </div>

            <div>
              <h2 className="heading-2 mb-4">7. Reporting and Metrics</h2>
              <p className="text-soft italic">
                [To be completed: End-of-term report with first-party impression and click counts; no guarantees of traffic, clicks, or conversions; no cookies or third-party tracking; counts are best-effort.]
              </p>
            </div>

            <div>
              <h2 className="heading-2 mb-4">8. Term and Removal</h2>
              <p className="text-soft italic">
                [To be completed: Placement runs from agreed start date to end date (typically 30 days); we may remove placement immediately for breach; removal for breach = no refund; no auto-renewal.]
              </p>
            </div>

            <div>
              <h2 className="heading-2 mb-4">9. Limitation of Liability</h2>
              <p className="text-soft italic">
                [To be completed: Liability cap, disclaimer of warranties, no guarantees of results. Legal counsel to review and right-size.]
              </p>
            </div>

            <div>
              <h2 className="heading-2 mb-4">10. Governing Law and Disputes</h2>
              <p className="text-soft italic">
                [To be completed: Washington State law; operator: {getOperatorLegalName()}, a Washington limited liability company, doing business as AI One Stop Shop; dispute resolution.]
              </p>
            </div>

            <div>
              <h2 className="heading-2 mb-4">11. Contact and Changes to Terms</h2>
              <p className="text-soft italic">
                [To be completed: Contact email; notice period for material changes to these terms for existing sponsors.]
              </p>
            </div>

            {getSiteContactEmail() && (
              <div className="note">
                <h2 className="heading-3 mb-3">Questions about these terms?</h2>
                <p>
                  Email{' '}
                  <ContactEmailText className="text-green hover:underline focus-ring rounded" />
                </p>
              </div>
            )}

            <div className="bg-amber-50 border border-amber-400 rounded-lg p-6 mt-12">
              <p className="font-semibold text-amber-900 mb-2">
                Legal review required before first sponsorship sale
              </p>
              <p className="text-sm text-amber-900">
                Items flagged for counsel review: liability cap (§9), all refund/removal terms (§3, §8), content restrictions (§4), asset license scope (§5), Washington law applicability (§10).
              </p>
            </div>

            <p className="text-center mt-12">
              <Link href="/advertise" className="btn-primary">
                View sponsorship options
              </Link>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
