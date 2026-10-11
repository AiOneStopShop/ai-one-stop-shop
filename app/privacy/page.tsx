export const metadata = {
  title: 'Privacy Policy',
  description: 'Privacy policy for AI One Stop Shop',
  alternates: { canonical: '/privacy' },
};

export default function PrivacyPage() {
  return (
    <div className="scroll-mt-16">
      <section className="section-spacing">
        <div className="container-max max-w-3xl">
          <h1 className="heading-1 mb-8">Privacy Policy</h1>

          <div className="prose prose-lg max-w-none space-y-6 text-[#171C26]">
            <p className="text-sm text-[#5B657B]">
              Last updated: October 10, 2026
            </p>

            <div>
              <h2 className="heading-2 mb-4">Who operates this site</h2>
              <p>
                AI One Stop Shop is operated by <strong>oneTomorrow</strong>, located in Washington State, United States.
              </p>
              {process.env.NEXT_PUBLIC_SITE_POSTAL_ADDRESS ? (
                <p className="bg-blue-50 border border-blue-200 rounded px-4 py-3 text-sm whitespace-pre-line">
                  <strong>Contact:</strong> {process.env.NEXT_PUBLIC_SITE_POSTAL_ADDRESS}
                </p>
              ) : (
                <p className="bg-yellow-50 border border-yellow-200 rounded px-4 py-3 text-sm">
                  <strong>Contact:</strong> Contact information will be added before any marketing emails are sent.
                </p>
              )}
            </div>

            <div>
              <h2 className="heading-2 mb-4">What information we collect</h2>
              
              <h3 className="heading-3 mb-3 mt-6">Tool submission form</h3>
              <p>When you submit a tool through our form, we collect:</p>
              <ul className="space-y-2">
                <li>• Tool name (up to 100 characters)</li>
                <li>• Website URL (up to 500 characters)</li>
                <li>• Your contact email address (up to 255 characters)</li>
                <li>• Optional description (up to 1,000 characters)</li>
              </ul>
              <p className="text-sm text-[#5B657B] mt-2">
                This data is stored in our database until we review and approve or reject the submission.
              </p>

              <h3 className="heading-3 mb-3 mt-6">Waitlist email addresses</h3>
              <p>
                If you sign up for our waitlist or newsletter, we store your email address in our database (Supabase). We keep these addresses until you unsubscribe.
              </p>

              <h3 className="heading-3 mb-3 mt-6">Affiliate click logs</h3>
              <p>
                When you click an affiliate link (marked as "Paid link"), we log the following for commission tracking and fraud prevention:
              </p>
              <ul className="space-y-2">
                <li>• <strong>Hashed IP address:</strong> We hash your IP address using a secret key. Raw IP addresses are not stored.</li>
                <li>• <strong>Browser type (user agent):</strong> Up to 255 characters of your browser's user-agent string</li>
                <li>• <strong>Referrer:</strong> The page you came from (our site's path only, not external URLs)</li>
                <li>• <strong>Timestamp:</strong> When you clicked the link</li>
                <li>• <strong>Tool and link identifiers:</strong> Which tool and affiliate link you clicked</li>
              </ul>
              <p className="text-sm text-[#5B657B] mt-2">
                <strong>Retention:</strong> Click logs are automatically deleted after 90 days.
              </p>
            </div>

            <div>
              <h2 className="heading-2 mb-4">What we don't collect</h2>
              <ul className="space-y-2">
                <li>• <strong>Raw IP addresses:</strong> We hash IPs immediately and do not store the original</li>
                <li>• <strong>Analytics or tracking cookies:</strong> We do not use Google Analytics, Facebook Pixel, or similar tracking services</li>
                <li>• <strong>Advertising data:</strong> We do not track you across websites</li>
                <li>• <strong>Precise location:</strong> We do not collect or store geolocation data</li>
              </ul>
            </div>

            <div>
              <h2 className="heading-2 mb-4">Cookies and local storage</h2>
              <p>
                Our site uses a small number of cookies for essential functions:
              </p>
              <ul className="space-y-2">
                <li>• <strong>Authentication cookies:</strong> If you log in to the admin area, Supabase sets session cookies to keep you logged in</li>
                <li>• <strong>Cookie consent:</strong> We store your cookie consent choice in local storage</li>
              </ul>
              <p className="mt-4">
                <strong>Partner cookies:</strong> When you click through to a partner site (tool maker or affiliate), that site may set its own cookies. We do not control those cookies. See their privacy policies for details.
              </p>
            </div>

            <div>
              <h2 className="heading-2 mb-4">How we use your information</h2>
              <ul className="space-y-2">
                <li>• <strong>Tool submissions:</strong> To review and potentially list your submitted tool</li>
                <li>• <strong>Waitlist emails:</strong> To send updates about new tools and site improvements (you can unsubscribe anytime)</li>
                <li>• <strong>Click logs:</strong> To track affiliate link performance, prevent fraud, and earn commissions from tool makers</li>
              </ul>
              <p className="mt-4">
                <strong>We never sell your data to third parties.</strong>
              </p>
            </div>

            <div>
              <h2 className="heading-2 mb-4">Third-party services</h2>
              <p>We use these services to operate the site:</p>
              <ul className="space-y-2">
                <li>• <strong>Supabase:</strong> Database and authentication (see <a href="https://supabase.com/privacy" className="text-[#6C39EF] hover:underline" rel="noopener">Supabase Privacy Policy</a>)</li>
                <li>• <strong>Vercel:</strong> Hosting and CDN (see <a href="https://vercel.com/legal/privacy-policy" className="text-[#6C39EF] hover:underline" rel="noopener">Vercel Privacy Policy</a>)</li>
              </ul>
              <p className="text-sm text-[#5B657B] mt-2">
                These services may have access to data we store with them. They are bound by their own privacy policies.
              </p>
            </div>

            <div>
              <h2 className="heading-2 mb-4">Data retention</h2>
              <ul className="space-y-2">
                <li>• <strong>Click logs:</strong> Automatically deleted after 90 days</li>
                <li>• <strong>Tool submissions:</strong> Deleted after review (approved or rejected)</li>
                <li>• <strong>Waitlist emails:</strong> Kept until you unsubscribe</li>
              </ul>
            </div>

            <div>
              <h2 className="heading-2 mb-4">Your rights</h2>
              <p>You have the right to:</p>
              <ul className="space-y-2">
                <li>• Request a copy of your data</li>
                <li>• Request correction of inaccurate data</li>
                <li>• Request deletion of your data</li>
                <li>• Unsubscribe from emails at any time (use the unsubscribe link in any email we send)</li>
              </ul>
              <p className="mt-4">
                To exercise these rights, email us at: <a href="mailto:hello@aionestop.shop" className="text-[#6C39EF] hover:underline">hello@aionestop.shop</a>
              </p>
            </div>

            <div>
              <h2 className="heading-2 mb-4">Children under 13</h2>
              <p>
                This site is not intended for children under 13. We do not knowingly collect information from children under 13. If you believe we have collected information from a child under 13, please contact us immediately and we will delete it.
              </p>
            </div>

            <div>
              <h2 className="heading-2 mb-4">Changes to this policy</h2>
              <p>
                We may update this policy from time to time. The "Last updated" date at the top will change when we do. Continued use of the site after changes means you accept the updated policy.
              </p>
            </div>

            <div>
              <h2 className="heading-2 mb-4">Contact us</h2>
              <p>
                Questions about this privacy policy? Email us at: <a href="mailto:hello@aionestop.shop" className="text-[#6C39EF] hover:underline">hello@aionestop.shop</a>
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
