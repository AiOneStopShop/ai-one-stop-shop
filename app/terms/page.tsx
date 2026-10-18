import { ContactEmailText } from '@/components/ContactEmail';
import { getSiteContactEmail } from '@/lib/site-config';
import { PRICE_CHECKED_LONG } from '@/lib/site-dates';
import { PageIntro } from '@/components/PageIntro';

export const metadata = {
  title: 'Terms of Service',
  description: 'Terms of service for AI One Stop Shop',
  alternates: { canonical: '/terms' },
};

export default function TermsPage() {
  return (
    <div className="scroll-mt-16">
      <PageIntro
        title="Terms of Service"
        accent="notebook"
        lead={<>The plain rules for using this site and submitting a tool.</>}
      />
      <section className="py-12 md:py-16">
        <div className="container-max max-w-3xl">
          <div className="guide-prose">
            <p className="text-sm text-soft">
              Last updated: {PRICE_CHECKED_LONG}
            </p>

            <div>
              <h2 className="heading-2 mb-4">Acceptance of terms</h2>
              <p>
                By using AI One Stop Shop, you agree to these terms. If you don't agree, please don't use the site.
              </p>
            </div>

            {process.env.NEXT_PUBLIC_LEGAL_V2 === 'true' && (
              <div>
                <h2 className="heading-2 mb-4">Eligibility</h2>
                <p>
                  You must be at least 13 to use this site. You must be 18 or older (or the age of majority where you live) to buy anything here. This site isn&apos;t directed to children under 13.
                </p>
              </div>
            )}

            <div>
              <h2 className="heading-2 mb-4">What this site provides</h2>
              <p>
                AI One Stop Shop is an informational directory. We provide information and links to third-party tools. We are not the seller or maker of the tools listed here, and we're not responsible for those tools or their makers.
              </p>
            </div>

            <div>
              <h2 className="heading-2 mb-4">Accuracy of information</h2>
              <p>
                We work to keep information accurate and up to date, but tools change frequently. Always verify pricing and features on the tool maker's own site before purchasing.
              </p>
            </div>

            <div>
              <h2 className="heading-2 mb-4">Affiliate relationships</h2>
              <p>
                Some links may be paid (affiliate) links. If you buy through one, we may earn a commission. We don't add any fee; prices are set by the tool maker.
              </p>
            </div>

            <div>
              <h2 className="heading-2 mb-4">No warranties</h2>
              <p>
                This site is provided "as is" without warranties of any kind. We're not liable for any damages from using this site or the tools we link to.
              </p>
            </div>

            <div>
              <h2 className="heading-2 mb-4">Changes to terms</h2>
              <p>
                We may update these terms. We'll post the updated version here with a new "last updated" date.
              </p>
            </div>

            <div>
              <h2 className="heading-2 mb-4">Contact</h2>
              {getSiteContactEmail() && (
                <p>
                  <ContactEmailText prefix="Questions? Email " />
                </p>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
