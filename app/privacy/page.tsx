export const metadata = {
  title: 'Privacy Policy',
  description: 'Privacy policy for AI One Stop Shop',
};

export default function PrivacyPage() {
  return (
    <div id="main-content" className="scroll-mt-16">
      <section className="section-spacing">
        <div className="container-max max-w-3xl">
          <h1 className="heading-1 mb-8">Privacy Policy</h1>

          <div className="prose prose-lg max-w-none space-y-6 text-[#171C26]">
            <p className="text-sm text-[#5B657B]">
              Last updated: October 10, 2026
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <p>
                <strong>Note:</strong> This is a basic privacy policy. Consult with a legal professional before deploying to production.
              </p>
            </div>

            <div>
              <h2 className="heading-2 mb-4">What we collect</h2>
              <ul className="space-y-2">
                <li>• Email addresses (if you choose to sign up for updates)</li>
                <li>• Affiliate click data (hashed IP addresses, not raw IPs, plus timestamps and referrer information)</li>
                <li>• Basic analytics data (page views, device type)</li>
              </ul>
            </div>

            <div>
              <h2 className="heading-2 mb-4">What we don't collect</h2>
              <ul className="space-y-2">
                <li>• Raw IP addresses (we hash them immediately for affiliate tracking)</li>
                <li>• Personal information beyond email addresses</li>
                <li>• Tracking cookies for advertising</li>
              </ul>
            </div>

            <div>
              <h2 className="heading-2 mb-4">How we use your information</h2>
              <p>
                We use your email address only to send you updates if you've opted in. We use hashed click data to track affiliate link performance. We never sell your data to third parties.
              </p>
            </div>

            <div>
              <h2 className="heading-2 mb-4">Your rights</h2>
              <p>
                You can request to see, update, or delete your data at any time. Email us at hello@aionestop.shop.
              </p>
            </div>

            <div>
              <h2 className="heading-2 mb-4">Third-party services</h2>
              <p>
                We use Supabase for data storage and Vercel for hosting. Both services have their own privacy policies.
              </p>
            </div>

            <div>
              <h2 className="heading-2 mb-4">Contact</h2>
              <p>
                Questions about privacy? Email hello@aionestop.shop
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
