export const metadata = {
  title: 'Terms of Service',
  description: 'Terms of service for AI One Stop Shop',
};

export default function TermsPage() {
  return (
    <div id="main-content" className="scroll-mt-16">
      <section className="section-spacing">
        <div className="container-max max-w-3xl">
          <h1 className="heading-1 mb-8">Terms of Service</h1>

          <div className="prose prose-lg max-w-none space-y-6 text-[#171C26]">
            <p className="text-sm text-[#5B657B]">
              Last updated: October 10, 2026
            </p>

            <div>
              <h2 className="heading-2 mb-4">Acceptance of terms</h2>
              <p>
                By using AI One Stop Shop, you agree to these terms. If you don't agree, please don't use the site.
              </p>
            </div>

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
                Some links are affiliate links. We may earn a commission if you purchase through them. This doesn't affect the price you pay.
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
              <p>
                Questions? Email hello@aionestop.shop
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
