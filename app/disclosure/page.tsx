import Link from 'next/link';

export const metadata = {
  title: 'Disclosure - How We Make Money',
  description: 'Learn how AI One Stop Shop makes money and how we keep our recommendations honest.',
};

export default function DisclosurePage() {
  return (
    <div id="main-content" className="scroll-mt-16">
      <section className="section-spacing">
        <div className="container-max max-w-3xl">
          <h1 className="heading-1 mb-8">How we make money</h1>

          <p className="text-lead text-[#5B657B] mb-12">
            In plain English
          </p>

          <div className="prose prose-lg max-w-none space-y-8 text-[#171C26]">
            <div>
              <h2 className="heading-2 mb-4">The short version</h2>
              <p className="text-lg">
                I want you to know exactly how this site pays for itself, so you can judge my advice for yourself.
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="heading-3 mb-3">1. Affiliate links</h3>
                <p>
                  Some "Visit" buttons are affiliate links. If you click one and later buy or subscribe, the tool maker may pay me a commission. You pay the same price either way.
                </p>
                <p>
                  Every affiliate link is marked <strong className="text-[#C62810]">"Paid link"</strong> right next to it.
                </p>
              </div>

              <div>
                <h3 className="heading-3 mb-3">2. Sponsored spots</h3>
                <p>
                  Tool makers may pay to be shown in a spot marked <strong className="badge-sponsored">Sponsored</strong>. Sponsored spots are always labeled, kept apart from my ranked picks, and never dressed up as a review.
                </p>
              </div>

              <div>
                <h3 className="heading-3 mb-3">3. My own products</h3>
                <p>
                  I also make my own DIY packs and kits (like ApproveGate). When I mention one of my own projects, I say so right there. They're kept in a{' '}
                  <Link href="/our-kits" className="text-[#6C39EF] hover:underline focus-ring rounded">
                    separate section
                  </Link>{' '}
                  and never part of the ranked directory.
                </p>
              </div>
            </div>

            <div className="bg-[#4A2D86] text-white rounded-lg p-8 my-8">
              <h3 className="heading-3 mb-4">What payments never buy</h3>
              <ul className="space-y-2 text-lg">
                <li>✓ A higher rank</li>
                <li>✓ A better write-up</li>
                <li>✓ Removing honest criticism</li>
              </ul>
              <p className="mt-4">
                If a tool maker asks for that, the answer is no.
              </p>
            </div>

            <div>
              <h3 className="heading-3 mb-3">What I don't do</h3>
              <ul className="space-y-2">
                <li>• I don't accept free products in exchange for a positive review</li>
                <li>• I don't hide affiliate relationships</li>
                <li>• I don't use fake urgency ("only 3 spots left")</li>
                <li>• I don't make up ratings or review counts</li>
              </ul>
            </div>

            <div>
              <h3 className="heading-3 mb-3">Conflict of interest: my own tools</h3>
              <p>
                ApproveGate and HumanHold are products I made. When I mention them, I disclose that they're mine. They're never ranked inside the main directory or included in "best of" lists.
              </p>
            </div>

            <div className="bg-[#F3EFFF] border border-[#6C39EF] rounded-lg p-6">
              <h3 className="heading-3 mb-3">Questions?</h3>
              <p>
                Email me at{' '}
                <a
                  href="mailto:hello@aionestop.shop"
                  className="text-[#6C39EF] hover:underline focus-ring rounded"
                >
                  hello@aionestop.shop
                </a>
                . I'm happy to explain anything about how this works.
              </p>
            </div>

            <div className="mt-12">
              <p className="text-sm text-[#5B657B]">
                Last updated: October 10, 2026
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
