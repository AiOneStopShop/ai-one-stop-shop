// Sends internal notification emails through Resend's REST API.
//
// Env:
// - RESEND_API_KEY (required to send; server-side only, never logged)
// - RESEND_FROM (optional): sender, e.g. "AI One Stop Shop <notifications@aionestop.shop>"
//   or "onboarding@resend.dev" while the aionestop.shop domain is unverified in Resend.
//   Falls back to DEFAULT_NOTIFICATION_FROM.
//
// A failed send never throws. It returns a result and logs Resend's status, error
// name and message (no key, no recipient, no body) so the reason shows up in the
// Vercel function log. Common failures:
// - 401 restricted_api_key / invalid key
// - 403 validation_error "The <domain> domain is not verified": verify it at resend.com/domains,
//   or set RESEND_FROM to an address on a verified domain
// - 422 invalid from/to
// - 429 rate limit

export const DEFAULT_NOTIFICATION_FROM = 'notifications@aionestop.shop';

export function getNotificationFrom(): string {
  const from = process.env.RESEND_FROM?.trim();
  return from ? from : DEFAULT_NOTIFICATION_FROM;
}

/** Domain of a from value like "Name <a@b.c>" or "a@b.c"; safe to log. */
function fromDomain(from: string): string {
  const match = from.match(/@([^>\s]+)>?\s*$/);
  return match ? match[1] : 'unknown';
}

export type NotificationEmail = {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
  /** Short label for logs, e.g. "sponsor-request". */
  context: string;
};

export type NotificationResult =
  | { sent: true; id?: string }
  | { sent: false; reason: 'not_configured' | 'resend_error' | 'network_error'; status?: number; message?: string };

export async function sendNotificationEmail(email: NotificationEmail): Promise<NotificationResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || !email.to) {
    console.warn(
      `[notify-email:${email.context}] skipped: ${!apiKey ? 'RESEND_API_KEY' : 'recipient (NEXT_PUBLIC_SITE_CONTACT_EMAIL)'} not set`
    );
    return { sent: false, reason: 'not_configured' };
  }

  const from = getNotificationFrom();
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [email.to],
        ...(email.replyTo ? { reply_to: email.replyTo } : {}),
        subject: email.subject,
        html: email.html,
      }),
    });

    const text = await res.text();
    let data: { id?: string; name?: string; message?: string } = {};
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { message: text.slice(0, 300) };
    }

    if (!res.ok) {
      console.error(
        `[notify-email:${email.context}] Resend send failed: status=${res.status} name=${data.name ?? 'unknown'} ` +
          `message="${data.message ?? 'no message'}" from_domain=${fromDomain(from)}`
      );
      return { sent: false, reason: 'resend_error', status: res.status, message: data.message };
    }

    console.info(`[notify-email:${email.context}] sent: id=${data.id ?? 'unknown'} from_domain=${fromDomain(from)}`);
    return { sent: true, id: data.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[notify-email:${email.context}] network error calling Resend: ${message}`);
    return { sent: false, reason: 'network_error', message };
  }
}
