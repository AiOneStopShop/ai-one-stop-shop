import Link from 'next/link';
import { ContactEmailText } from '@/components/ContactEmail';
import { getSiteContactEmail } from '@/lib/site-config';

export const metadata = {
  title: 'Thank You - AI One Stop Shop',
  description: 'Next steps for your sponsorship request',
  alternates: { canonical: '/advertise/thanks' },
};

export default function AdvertiseThanksPage() {
  return (
    <div className="scroll-mt-16">
      <section className="section-spacing">
        <div className="container-max max-w-2xl text-center">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 mb-6">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="heading-1 mb-4">Thank you!</h1>
            <p className="text-xl text-soft">
              We received your sponsorship request.
            </p>
          </div>

          <div className="card text-left space-y-4">
            <h2 className="heading-2 mb-4">What happens next</h2>
            
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-card text-green flex items-center justify-center font-bold">
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
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-card text-green flex items-center justify-center font-bold">
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
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-card text-green flex items-center justify-center font-bold">
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
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-card text-green flex items-center justify-center font-bold">
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
            <div className="mt-8 text-center text-soft">
              <p>
                Questions in the meantime?{' '}
                <ContactEmailText className="text-green hover:underline focus-ring rounded" />
              </p>
            </div>
          )}

          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
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
