import { ContactEmailText } from '@/components/ContactEmail';
import { getSiteContactEmail } from '@/lib/site-config';
import { LEGAL_DMCA_UPDATED } from '@/lib/site-dates';
import { notFound } from 'next/navigation';
import { PageIntro } from '@/components/PageIntro';

export const metadata = {
  title: 'Copyright & DMCA',
  description: 'Copyright policy and DMCA notice procedures for AI One Stop Shop',
  alternates: { canonical: '/dmca' },
};

// Check if all required DMCA env vars are present
function getDmcaAgentInfo() {
  if (process.env.NEXT_PUBLIC_LEGAL_V2 !== 'true') {
    return null;
  }

  const name = process.env.DMCA_AGENT_NAME;
  const address = process.env.DMCA_AGENT_ADDRESS;
  const email = process.env.DMCA_AGENT_EMAIL;
  const phone = process.env.DMCA_AGENT_PHONE;

  // If any required var is missing in production, return null to trigger 404
  if (process.env.NODE_ENV === 'production') {
    if (!name || !address || !email || !phone) {
      console.warn(
        'DMCA page hidden: missing required environment variables (DMCA_AGENT_NAME, DMCA_AGENT_ADDRESS, DMCA_AGENT_EMAIL, DMCA_AGENT_PHONE)'
      );
      return null;
    }
  }

  return { name, address, email, phone };
}

export default function DmcaPage() {
  const agentInfo = getDmcaAgentInfo();

  // If feature flag is off or required env vars are missing, return 404
  if (!agentInfo) {
    notFound();
  }

  return (
    <div className="scroll-mt-16">
      <PageIntro
        title={<>Copyright &amp; DMCA</>}
        accent="envelope"
        lead={<>How to tell us about content you believe uses your work without permission.</>}
      />
      <section className="py-12 md:py-16">
        <div className="container-max max-w-3xl">
          <div className="guide-prose">
            <p className="text-sm text-soft">
              Last updated: {LEGAL_DMCA_UPDATED}
            </p>

            <div>
              <h2 className="heading-2 mb-4">Our Policy</h2>
              <p>
                We are oneTomorrow. We respect the intellectual property rights of others and expect our users to do the same. This page explains how to notify us if you believe content on AI One Stop Shop infringes your copyright, and how we handle such claims under the Digital Millennium Copyright Act (DMCA).
              </p>
            </div>

            <div>
              <h2 className="heading-2 mb-4">Filing a DMCA Notice</h2>
              <p>
                If you believe that content on our site infringes your copyright, you may send a written notice to our designated copyright agent with the following information required by 17 U.S.C. § 512(c)(3):
              </p>
              <p className="mt-4">
                We may share a copy of your notice, including your contact details, with the person who posted the material.
              </p>
              <ol className="list-decimal pl-6 space-y-2 mt-4">
                <li>
                  <strong>Identification of the copyrighted work</strong> you claim has been infringed. If multiple works are covered by a single notification, you may provide a representative list.
                </li>
                <li>
                  <strong>Identification of the infringing material</strong> and information sufficient to let us locate it on the site (such as a URL or page description).
                </li>
                <li>
                  <strong>Your contact information</strong>, including your address, telephone number, and email address.
                </li>
                <li>
                  <strong>A statement</strong> that you have a good faith belief that the disputed use is not authorized by the copyright owner, its agent, or the law.
                </li>
                <li>
                  <strong>A statement</strong> that the information in your notice is accurate, and under penalty of perjury, that you are authorized to act on behalf of the copyright owner.
                </li>
                <li>
                  <strong>Your physical or electronic signature</strong>.
                </li>
              </ol>
            </div>

            <div>
              <h2 className="heading-2 mb-4">Designated Agent Contact Information</h2>
              <div className="bg-cream-2 border border-line rounded-lg p-6">
                {agentInfo.name && agentInfo.address && agentInfo.email && agentInfo.phone ? (
                  <>
                    <p className="font-medium mb-2">{agentInfo.name}</p>
                    <p className="text-sm whitespace-pre-line mb-2">{agentInfo.address}</p>
                    <p className="text-sm mb-2">
                      Email: <a href={`mailto:${agentInfo.email}`} className="text-green hover:underline">{agentInfo.email}</a>
                    </p>
                    <p className="text-sm">Phone: {agentInfo.phone}</p>
                  </>
                ) : (
                  <p className="text-sm text-red-700">TODO(Lexi): Agent contact information pending configuration.</p>
                )}
              </div>
            </div>

            <div>
              <h2 className="heading-2 mb-4">Counter-Notice</h2>
              <p>
                If you believe your content was removed or disabled by mistake or misidentification, you may file a counter-notice with our designated agent containing the following information required by 17 U.S.C. § 512(g):
              </p>
              <ol className="list-decimal pl-6 space-y-2 mt-4">
                <li>
                  <strong>Your physical or electronic signature</strong>.
                </li>
                <li>
                  <strong>Identification of the material</strong> that was removed or disabled, and where it appeared before removal.
                </li>
                <li>
                  <strong>A statement under penalty of perjury</strong> that you have a good faith belief the material was removed or disabled as a result of mistake or misidentification.
                </li>
                <li>
                  <strong>Your name, address, and telephone number</strong>, and a statement that you consent to the jurisdiction of the federal district court for the judicial district in which your address is located (or, if your address is outside the United States, any judicial district in which we may be found), and that you will accept service of process from the person who provided the original DMCA notice or an agent of that person.
                </li>
              </ol>
              <p className="mt-4">
                Upon receiving a valid counter-notice, we will forward it to the party who submitted the original claim. If that party does not notify us within 10 business days that they have filed a court action to restrain the allegedly infringing activity, we may restore the removed content in 10 to 14 business days after we receive the counter-notice.
              </p>
            </div>

            <div>
              <h2 className="heading-2 mb-4">Repeat Infringer Policy</h2>
              <p>
                In appropriate circumstances, we will terminate the accounts or access of users who are repeat infringers of copyright.
              </p>
            </div>

            <div>
              <h2 className="heading-2 mb-4">Disclaimer</h2>
              <p>
                This page provides information about our DMCA procedures. It is not legal advice. If you have questions about copyright law, the DMCA process, or your specific situation, please consult a qualified attorney. Misrepresentations in a DMCA notice or counter-notice may result in liability for damages, costs, and attorneys&apos; fees under 17 U.S.C. § 512(f).
              </p>
            </div>

            <div>
              <h2 className="heading-2 mb-4">Contact</h2>
              {getSiteContactEmail() && (
                <p>
                  For non-copyright questions, <ContactEmailText prefix="" />.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
