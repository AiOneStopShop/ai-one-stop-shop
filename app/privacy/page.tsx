import Link from 'next/link';
import { ContactEmailText } from '@/components/ContactEmail';
import { getSiteContactEmail, getOperatorLegalName } from '@/lib/site-config';

// Shown even if NEXT_PUBLIC_SITE_CONTACT_EMAIL is unset, so the policy always has a contact.
const FALLBACK_CONTACT_EMAIL = 'aionestopshop25@gmail.com';
import { PRICE_CHECKED_LONG } from '@/lib/site-dates';
import { PageIntro } from '@/components/PageIntro';
import { CookieSettingsButton } from '@/components/CookieSettingsButton';

export const metadata = {
  title: 'Privacy Policy',
  description: 'Privacy policy for AI One Stop Shop',
  alternates: { canonical: '/privacy' },
};

export default function PrivacyPage() {
  return (
    <div className="scroll-mt-16">
      <PageIntro
        title="Privacy Policy"
        accent="key"
        lead={<>What we collect, why, and how long we keep it. We keep it short.</>}
      />
      <section className="py-12 md:py-16">
        <div className="container-max max-w-3xl">
          <div className="guide-prose">
            <p className="text-sm text-soft">
              Last updated: October 19, 2026
            </p>

            <div>
              <h2 className="heading-2 mb-4">Who operates this site</h2>
              <p>
                AI One Stop Shop is operated by <strong>{getOperatorLegalName()}</strong>, a Washington limited liability company doing business as AI One Stop Shop. We are oneTomorrow.
              </p>
              <p className="bg-cream-2 border border-line rounded px-4 py-3 text-sm">
                <strong>Contact:</strong> Email us at{' '}
                <a href={`mailto:${getSiteContactEmail() ?? FALLBACK_CONTACT_EMAIL}`} className="text-green underline hover:no-underline">
                  {getSiteContactEmail() ?? FALLBACK_CONTACT_EMAIL}
                </a>
                .
              </p>
              {process.env.NEXT_PUBLIC_SITE_POSTAL_ADDRESS && (
                <p className="bg-cream-2 border border-line rounded px-4 py-3 text-sm whitespace-pre-line">
                  <strong>Postal address:</strong> {process.env.NEXT_PUBLIC_SITE_POSTAL_ADDRESS}
                </p>
              )}
            </div>

            <div>
              <h2 className="heading-2 mb-4">What information we collect</h2>
              
              <h3 className="heading-3 mb-3 mt-6">Tool submission form</h3>
              <p>When you submit a tool through our form, we collect:</p>
              <ul className="space-y-2">
                <li>Tool name (up to 100 characters)</li>
                <li>Website URL (up to 500 characters)</li>
                <li>Your contact email address (up to 255 characters)</li>
                <li>Optional description (up to 1,000 characters)</li>
              </ul>
              <p className="text-sm text-soft mt-2">
                This data is stored in our database until we review and approve or reject the submission.
              </p>

              <h3 className="heading-3 mb-3 mt-6">Sponsor request and intake forms</h3>
              <p>When you request or book a sponsored spot, we collect:</p>
              <ul className="space-y-2">
                <li>Company name and contact person</li>
                <li>Contact email address</li>
                <li>Tool name and URL</li>
                <li>Package requested and preferred start date</li>
                <li>Category (if applicable)</li>
                <li>Marketing blurb and logo (URL or file upload)</li>
                <li>Destination URL for the sponsored placement</li>
                <li>Your optional note about why your tool is a good fit</li>
                <li>Consent checkboxes (terms agreement, content rights)</li>
              </ul>
              <p className="text-sm text-soft mt-2">
                <strong>Retention:</strong> We keep requests we decline, or that don't go ahead, for 6 months. We keep records of paid sponsorships for 5 years because tax law requires it. Then we delete them.
              </p>

              <h3 className="heading-3 mb-3 mt-6">Sponsored placement impressions and clicks</h3>
              <p>
                When a sponsored placement is shown or clicked, we count it. We don't use cookies for this and don't store your IP address with these counts, only daily totals per placement. Like any website, our hosting and spam-protection providers briefly process your IP address to deliver pages and block abuse.
              </p>

              <h3 className="heading-3 mb-3 mt-6">Newsletter email addresses</h3>
              <p>
                If you join our newsletter list on the <Link href="/newsletter">Newsletter page</Link>, we store your email address in our database (Supabase), along with the date you joined. We use it only to send the newsletter. We keep it until you unsubscribe: reply &quot;unsubscribe&quot; to any issue or email us, and we delete it.
              </p>

              <h3 className="heading-3 mb-3 mt-6">Search queries</h3>
              <p>
                When you search the tool catalog, we record the words you searched for, how many results came back, and when. We do not store your IP address, any account or user identifier, or your browser details with it. We use these anonymous counts to see what people look for and which tools are missing from the catalog. Please don&apos;t type personal information into the search box; queries that look like an email address or a long number are discarded.
              </p>
              <p className="mt-4">
                Your recent searches are saved only in your own browser (local storage) so you can repeat them. They are never sent to us, and you can clear them from the search box at any time.
              </p>
              <p className="text-sm text-soft mt-2">
                <strong>Retention:</strong> Search query logs are automatically deleted after 90 days.
              </p>

              <h3 className="heading-3 mb-3 mt-6">Visit-link click logs</h3>
              <p>
                When you click any "Visit" link (paid or not), we log the following for tracking performance and preventing abuse:
              </p>
              <ul className="space-y-2">
                <li><strong>Hashed IP address:</strong> We hash your IP address using a secret key. Raw IP addresses are not stored.</li>
                <li><strong>Browser type (user agent):</strong> Up to 255 characters of your browser's user-agent string</li>
                <li><strong>Referrer:</strong> The page you came from (address without query details)</li>
                <li><strong>Timestamp:</strong> When you clicked the link</li>
                <li><strong>Tool and link identifiers:</strong> Which tool link you clicked</li>
              </ul>
              <p className="mt-4">
                Paid links may pass through an affiliate network (for example PartnerStack, Impact, Rewardful or Dub, depending on the program) and may add tracking codes to the address so the partner can credit the referral.
              </p>
              <p className="text-sm text-soft mt-2">
                <strong>Retention:</strong> Click logs are automatically deleted after 90 days.
              </p>
            </div>

            <div>
              <h2 className="heading-2 mb-4">What we don't collect</h2>
              <ul className="space-y-2">
                <li><strong>Raw IP addresses:</strong> We hash IPs immediately and do not store the original</li>
                <li><strong>Analytics or tracking cookies:</strong> We do not use Google Analytics, Facebook Pixel, or similar tracking services. Our only analytics is the optional, cookieless Vercel Web Analytics described below, and it stays off unless you opt in</li>
                <li><strong>Advertising data:</strong> We do not track you across websites</li>
                <li><strong>Precise location:</strong> We do not collect or store precise geolocation. If you opt in to analytics, Vercel derives an approximate country, region and city from your connection for aggregate counts</li>
              </ul>
            </div>

            <div id="cookies" className="scroll-mt-20">
              <h2 className="heading-2 mb-4">Cookies and local storage</h2>
              <p>
                We don't use advertising or tracking cookies, and visitors who browse aren't given cookies by us.
              </p>
              <p className="mt-4">
                Your browser's local storage keeps three small things on your own device: the tools you add to your compare list, your last few searches, and your analytics choice from our cookie banner. You can clear them anytime in your browser settings.
              </p>
              <p className="mt-4" id="analytics">
                <strong>Optional analytics (off unless you opt in).</strong> If you choose "Allow analytics" in our cookie banner, we load Vercel Web Analytics to count page visits. It doesn't use cookies. According to Vercel&apos;s documentation, each page view can include: the time, the page address and route (we remove search terms and other query text before it is sent), the referring page, an approximate location (country, region, city) derived from your connection, your device type, operating system and browser with versions, and the analytics script version. Vercel tells visits apart with a hash made from the incoming request, rather than a cookie, and discards it after 24 hours. We see only aggregate counts. We never load it on admin pages. If you choose "No thanks", close the banner with Escape, or make no choice, it isn&apos;t loaded at all. If your browser sends a Global Privacy Control signal, we treat it as &quot;No thanks&quot; for analytics. See <a href="https://vercel.com/docs/analytics/privacy-policy" className="text-green hover:underline" rel="noopener">Vercel&apos;s Web Analytics privacy notes</a>.
              </p>
              <p className="mt-4">
                <strong>Changing your choice:</strong> you can change it anytime with the button below (also under &quot;Cookie settings&quot; in the footer). If you switch analytics off, we stop sending page views right away. Clearing this site&apos;s data in your browser also resets your choice.
              </p>
              <p className="mt-2">
                <CookieSettingsButton />
              </p>
              <p className="mt-4">
                If you're a site admin who signs in, we use login cookies so you stay signed in. Those are needed for the admin area to work.
              </p>
              <p className="mt-4">
                When you click a "Visit" link, we record the click (a hashed, not raw, version of your IP address, your browser type, and the page you came from) so we can count visits and paid referrals and stop abuse. After you land on the tool's site, that site, and any affiliate network it uses, may set its own cookies under its own privacy policy, which we don't control.
              </p>
              <p className="mt-4">
                We delete click records after 90 days.
              </p>
            </div>

            <div>
              <h2 className="heading-2 mb-4">How we use your information</h2>
              <ul className="space-y-2">
                <li><strong>Tool submissions:</strong> To review and potentially list your submitted tool</li>
                <li><strong>Sponsor intake:</strong> To evaluate sponsorship requests, communicate with sponsors, and fulfill sponsorship placements</li>
                <li><strong>Newsletter:</strong> To send the newsletter you signed up for (unsubscribe anytime)</li>
                <li><strong>Click logs:</strong> To track affiliate link performance, prevent fraud, and earn commissions from tool makers</li>
                <li><strong>Placement metrics:</strong> To provide sponsors with end-of-term reports showing impression and click counts</li>
              </ul>
              <p className="mt-4">
                <strong>We never sell your data to third parties.</strong>
              </p>
            </div>

            <div>
              <h2 className="heading-2 mb-4">Third-party services (data processors)</h2>
              <p>We use these services to operate the site:</p>
              <ul className="space-y-2">
                <li><strong>Supabase:</strong> Database and authentication (see <a href="https://supabase.com/privacy" className="text-green hover:underline" rel="noopener">Supabase Privacy Policy</a>)</li>
                <li><strong>Vercel:</strong> Hosting and CDN (see <a href="https://vercel.com/legal/privacy-policy" className="text-green hover:underline" rel="noopener">Vercel Privacy Policy</a>)</li>
                <li><strong>Vercel Web Analytics (only if you opt in):</strong> Cookieless, aggregate page view counts. Off by default; see <a href="#analytics" className="text-green hover:underline">Optional analytics</a> for what it collects (see <a href="https://vercel.com/docs/analytics/privacy-policy" className="text-green hover:underline" rel="noopener">Vercel Analytics Privacy</a>)</li>
                <li><strong>Upstash:</strong> Blocking spam and abuse. It briefly processes your IP address when you submit a form or click a sponsored link. (see <a href="https://upstash.com/trust/privacy.pdf" className="text-green hover:underline" rel="noopener">Upstash Privacy Policy</a>)</li>
                <li><strong>Gmail (Google):</strong> Our team mailbox for inquiries and sponsor emails (see <a href="https://policies.google.com/privacy" className="text-green hover:underline" rel="noopener">Google Privacy Policy</a>)</li>
                <li><strong>Resend:</strong> Transactional email delivery (sponsor notifications) (see <a href="https://resend.com/legal/privacy-policy" className="text-green hover:underline" rel="noopener">Resend Privacy Policy</a>)</li>
              </ul>
              <p className="text-sm text-soft mt-2">
                These services may have access to data we store with them. They are bound by their own privacy policies.
              </p>
            </div>

            <div>
              <h2 className="heading-2 mb-4">Data retention</h2>
              <ul className="space-y-2">
                <li><strong>Click logs:</strong> Automatically deleted after 90 days</li>
                <li><strong>Search query logs:</strong> Automatically deleted after 90 days</li>
                <li><strong>Tool submissions:</strong> Deleted after review (approved or rejected)</li>
                <li><strong>Sponsor requests:</strong> 6 months if declined or not booked; records of paid sponsorships: 5 years (tax records), then deleted</li>
                <li><strong>Newsletter emails:</strong> Kept until you unsubscribe, then deleted</li>
              </ul>
            </div>

            <div>
              <h2 className="heading-2 mb-4">Your rights</h2>
              <p>You have the right to:</p>
              <ul className="space-y-2">
                <li>Request a copy of your data</li>
                <li>Request correction of inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Unsubscribe from emails at any time (use the unsubscribe link in any email we send)</li>
              </ul>
              {getSiteContactEmail() && (
                <p className="mt-4">
                  <ContactEmailText
                    className="text-green hover:underline"
                    prefix="To exercise these rights, email us at: "
                  />
                </p>
              )}
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
              {getSiteContactEmail() && (
                <p>
                  <ContactEmailText
                    className="text-green hover:underline"
                    prefix="Questions about this privacy policy? Email us at: "
                  />
                </p>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
