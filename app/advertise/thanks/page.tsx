import Link from 'next/link';
import { PageIntro } from '@/components/PageIntro';
import { ContactEmailText } from '@/components/ContactEmail';
import { getSiteContactEmail } from '@/lib/site-config';

export const metadata = {
  title: 'Thank you',
  description: 'Next steps for your sponsorship request',
  alternates: { canonical: '/advertise/thanks' },
  robots: { index: false, follow: true },
};

export default async function AdvertiseThanksPage({
  searchParams,
}: {
  searchParams: Promise<{ source?: string }>;
}) {
  const { source } = await searchParams;
  const fromStripe = source === 'stripe';
  return (
    <div className="scroll-mt-16">
      <PageIntro
        title="Thank you!"
        accent="mug"
        lead={fromStripe
          ? 'If you just paid through Stripe, Stripe emails your receipt. We will email you to confirm your start date.'
          : 'We received your sponsorship request.'}
      />
      <section className="py-10 md:py-14">
        <div className="container-max max-w-2xl">
          <div className="card text-left space-y-4">
            <h2 className="heading-2 mb-4">What happens next</h2>
            
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-leaf text-green flex items-center justify-center font-bold font-fraunces">
                  1
                </div>
                <div>
                  <h3 className="font-semibold mb-1">We'll review your request</h3>
                  <p className="text-soft">
                    Usually within 2 business days, we'll check whether your tool is a good fit for our readers.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-leaf text-green flex items-center justify-center font-bold font-fraunces">
                  2
                </div>
                <div>
                  <h3 className="font-semibold mb-1">We'll reply by email</h3>
                  <p className="text-soft">
                    We'll tell you whether your tool is a fit and what happens next.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-leaf text-green flex items-center justify-center font-bold font-fraunces">
                  3
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Send your assets</h3>
                  <p className="text-soft">
                    When booking opens, we'll send you a form for your logo, blurb and link.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-leaf text-green flex items-center justify-center font-bold font-fraunces">
                  4
                </div>
                <div>
                  <h3 className="font-semibold mb-1">You go live</h3>
                  <p className="text-soft">
                    On the start date we agree on, your sponsored spot goes live for the full term.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {getSiteContactEmail() && (
            <div className="mt-8 text-soft">
              <p>
                Questions in the meantime?{' '}
                <ContactEmailText className="text-green hover:underline focus-ring rounded" />
              </p>
            </div>
          )}

          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <Link href="/" className="btn-primary">
              Back to home
            </Link>
            <Link href="/advertise" className="btn-secondary">
              View sponsorship options
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
