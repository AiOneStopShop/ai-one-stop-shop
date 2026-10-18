// Builds the internal notification email for /api/sponsor/request.
// Pure (no env reads), so it can be unit-tested.

export const SPONSOR_REQUEST_PACKAGE_LABELS: Record<string, string> = {
  'featured-tool': 'Featured Tool ($39)',
  'category-spotlight': 'Category Spotlight ($69)',
  'newsletter': 'Newsletter Sponsor ($29)',
  'founding-bundle': 'Founding Bundle ($99)',
  'partner-program': 'Partner Program',
};

export type SponsorRequestEmailInput = {
  companyName: string;
  contactName: string;
  email: string;
  toolName: string;
  toolUrl: string;
  package: string;
  message?: string | null;
  submittedAt: string;
  siteUrl: string;
};

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/** Strip CR/LF so user input can't break the subject header line. */
function oneLine(text: string): string {
  return text.replace(/[\r\n]+/g, ' ').trim();
}

export function buildSponsorRequestEmail(input: SponsorRequestEmailInput): {
  subject: string;
  html: string;
  text: string;
} {
  const isPartner = input.package === 'partner-program';
  const kind = isPartner ? 'partner' : 'sponsor';
  const heading = isPartner ? 'New Partner Request' : 'New Sponsor Request';
  const packageLabel = SPONSOR_REQUEST_PACKAGE_LABELS[input.package] || input.package;
  const adminUrl = `${input.siteUrl.replace(/\/$/, '')}/admin/sponsors`;

  const subject = `New ${kind} request: ${oneLine(input.toolName)} (${packageLabel})`;

  const html = `
          <h2>${heading}</h2>
          <p><strong>Company:</strong> ${escapeHtml(input.companyName)}</p>
          <p><strong>Contact:</strong> ${escapeHtml(input.contactName)}</p>
          <p><strong>Email:</strong> ${escapeHtml(input.email)}</p>
          <p><strong>Tool:</strong> ${escapeHtml(input.toolName)}</p>
          <p><strong>URL:</strong> <a href="${escapeHtml(input.toolUrl)}">${escapeHtml(input.toolUrl)}</a></p>
          <p><strong>Package:</strong> ${escapeHtml(packageLabel)}</p>
          ${input.message ? `<p><strong>Message:</strong><br>${escapeHtml(input.message).replace(/\n/g, '<br>')}</p>` : ''}
          <hr>
          <p><small>Submitted at ${escapeHtml(input.submittedAt)}</small></p>
          <p><small>Review in admin: <a href="${escapeHtml(adminUrl)}">${escapeHtml(adminUrl)}</a></small></p>
        `;

  const lines = [
    heading,
    '',
    `Company: ${input.companyName}`,
    `Contact: ${input.contactName}`,
    `Email: ${input.email}`,
    `Tool: ${input.toolName}`,
    `URL: ${input.toolUrl}`,
    `Package: ${packageLabel}`,
  ];
  if (input.message) {
    lines.push('', 'Message:', input.message);
  }
  lines.push('', '---', `Submitted at ${input.submittedAt}`, `Review in admin: ${adminUrl}`);

  return { subject, html, text: lines.join('\n') };
}
