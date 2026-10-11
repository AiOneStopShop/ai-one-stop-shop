import type { ReactNode } from 'react';
import { getSiteContactEmail } from '@/lib/site-config';

type ContactEmailProps = {
  className?: string;
  subject?: string;
  body?: string;
  children?: ReactNode;
};

function mailtoHref(email: string, subject?: string, body?: string): string {
  const params = new URLSearchParams();
  if (subject) params.set('subject', subject);
  if (body) params.set('body', body);
  const query = params.toString();
  return query ? `mailto:${email}?${query}` : `mailto:${email}`;
}

export function ContactEmail({ className, subject, body, children }: ContactEmailProps) {
  const email = getSiteContactEmail();
  if (!email) return null;

  return (
    <a href={mailtoHref(email, subject, body)} className={className}>
      {children ?? email}
    </a>
  );
}

export function ContactEmailText({
  className,
  prefix,
  suffix,
}: {
  className?: string;
  prefix?: string;
  suffix?: string;
}) {
  const email = getSiteContactEmail();
  if (!email) return null;

  return (
    <>
      {prefix}
      <ContactEmail className={className} />
      {suffix}
    </>
  );
}
