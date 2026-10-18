'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { getSiteContactEmail } from '@/lib/site-config';
import { PageIntro } from '@/components/PageIntro';

const FIELD_ERROR_TEXT = {
  name_missing: 'Please enter a tool name.',
  url_invalid: 'Please enter a valid website URL.',
  email_invalid: 'Please enter a valid email address.',
  too_long: 'That field is too long.',
  rights_required: 'You must confirm you have the rights to submit this content.',
} as const;

type FieldErrorCode = keyof typeof FIELD_ERROR_TEXT;

function formErrorText() {
  const email = getSiteContactEmail();
  return {
    too_many: 'Too many requests. Please try again later.',
    submit_failed: email
      ? `Something went wrong. Please try again or email ${email}`
      : 'Something went wrong. Please try again.',
  } as const;
}

const FIELD_LABELS: Record<string, string> = {
  toolName: 'Tool name',
  websiteUrl: 'Website URL',
  contactEmail: 'Your email',
  description: 'Why should we look at this tool?',
  rightsConfirmed: 'Rights confirmation',
};

function textForFieldCode(code: string): string | null {
  return Object.prototype.hasOwnProperty.call(FIELD_ERROR_TEXT, code)
    ? FIELD_ERROR_TEXT[code as FieldErrorCode]
    : null;
}

function validateClient(formData: {
  toolName: string;
  websiteUrl: string;
  contactEmail: string;
  description: string;
  rightsConfirmed: boolean;
}): Partial<Record<string, string>> {
  const errors: Partial<Record<string, string>> = {};

  if (!formData.toolName.trim()) {
    errors.toolName = FIELD_ERROR_TEXT.name_missing;
  } else if (formData.toolName.length > 200) {
    errors.toolName = FIELD_ERROR_TEXT.too_long;
  }

  if (!formData.websiteUrl.trim()) {
    errors.websiteUrl = FIELD_ERROR_TEXT.url_invalid;
  } else if (formData.websiteUrl.length > 500) {
    errors.websiteUrl = FIELD_ERROR_TEXT.too_long;
  } else {
    try {
      const parsed = new URL(formData.websiteUrl);
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        errors.websiteUrl = FIELD_ERROR_TEXT.url_invalid;
      }
    } catch {
      errors.websiteUrl = FIELD_ERROR_TEXT.url_invalid;
    }
  }

  if (!formData.contactEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)) {
    errors.contactEmail = FIELD_ERROR_TEXT.email_invalid;
  } else if (formData.contactEmail.length > 200) {
    errors.contactEmail = FIELD_ERROR_TEXT.too_long;
  }

  if (formData.description.length > 2000) {
    errors.description = FIELD_ERROR_TEXT.too_long;
  }

  // Only validate rights checkbox when LEGAL_V2 flag is enabled
  if (process.env.NEXT_PUBLIC_LEGAL_V2 === 'true' && !formData.rightsConfirmed) {
    errors.rightsConfirmed = FIELD_ERROR_TEXT.rights_required;
  }

  return errors;
}

export default function SubmitPage() {
  const [formData, setFormData] = useState({
    toolName: '',
    websiteUrl: '',
    contactEmail: '',
    description: '',
    rightsConfirmed: false,
    extra_ref: '',
  });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [formError, setFormError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<string, string>>>({});
  const errorSummaryRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (status === 'error') {
      errorSummaryRef.current?.focus();
    }
  }, [status, fieldErrors, formError]);

  useEffect(() => {
    if (status === 'success') {
      successRef.current?.focus();
    }
  }, [status]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const clientErrors = validateClient(formData);
    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors);
      setStatus('error');
      return;
    }

    setStatus('submitting');
    setFieldErrors({});

    try {
      const response = await fetch('/api/submit-tool', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok) {
        setStatus('success');
        setFormData({ toolName: '', websiteUrl: '', contactEmail: '', description: '', rightsConfirmed: false, extra_ref: '' });
        return;
      }

      const nextFieldErrors: Partial<Record<string, string>> = {};
      if (Array.isArray(data.errors)) {
        for (const item of data.errors) {
          const message = textForFieldCode(item?.code);
          if (message && item.field) {
            nextFieldErrors[item.field] = message;
          }
        }
      }

      if (Object.keys(nextFieldErrors).length > 0) {
        setFieldErrors(nextFieldErrors);
        setStatus('error');
        return;
      }

      const formCode = typeof data.error === 'string' ? data.error : '';
      const errors = formErrorText();
      setFormError(
        Object.prototype.hasOwnProperty.call(errors, formCode)
          ? errors[formCode as keyof typeof errors]
          : errors.submit_failed
      );
      setStatus('error');
    } catch {
      setFormError(formErrorText().submit_failed);
      setStatus('error');
    }
  };

  const describedBy = (field: string, extra?: string) => {
    const ids = [extra, fieldErrors[field] ? `${field}-error` : null].filter(Boolean);
    return ids.length ? ids.join(' ') : undefined;
  };

  return (
    <div className="scroll-mt-16">
      <PageIntro
        accent="magnifier"
        title="Suggest a tool"
        lead="Know an AI tool that helps people get real work done? Tell us about it. A person on our team looks at every suggestion."
        above={
          <nav aria-label="Breadcrumb">
            <ol className="flex items-center gap-2 text-sm">
              <li>
                <Link href="/" className="text-soft hover:text-green focus-ring rounded underline underline-offset-2">
                  Home
                </Link>
              </li>
              <li aria-hidden="true" className="text-soft">/</li>
              <li aria-current="page" className="text-ink font-medium">
                Submit a tool
              </li>
            </ol>
          </nav>
        }
      />

      <section className="py-10 md:py-14">
        <div className="container-max grid gap-10 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] items-start">
          <div className="min-w-0">
          {status === 'success' ? (
            <div className="card bg-leaf border-leaf-line text-center !p-8" role="status">
              <h2
                ref={successRef}
                tabIndex={-1}
                className="heading-2 mb-2 text-green focus:outline-none"
              >
                Submitted!
              </h2>
              <p className="text-green mb-6">
                Thanks for the suggestion. We'll take a look and reach out if we have questions.
              </p>
              <Link href="/tools" className="btn-primary inline-block">
                Browse tools
              </Link>
            </div>
          ) : (
            <>
              {status === 'error' && (formError || Object.keys(fieldErrors).length > 0) && (
                <div
                  ref={errorSummaryRef}
                  tabIndex={-1}
                  className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6 focus:outline-none"
                  role="alert"
                  aria-live="assertive"
                  aria-atomic="true"
                >
                  <p className="text-red-800 font-semibold mb-2">
                    {formError ? 'Submission failed' : 'Please fix the following'}
                  </p>
                  {formError && <p className="text-red-700">{formError}</p>}
                  {Object.keys(fieldErrors).length > 0 && (
                    <ul className="list-disc pl-5 text-red-700 space-y-1">
                      {Object.entries(fieldErrors).map(([field, message]) => (
                        <li key={field}>
                          <a href={`#${field}`} className="underline focus-ring rounded">
                            {FIELD_LABELS[field] || field}: {message}
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              <form onSubmit={handleSubmit} className="card space-y-6 !p-5 md:!p-7" noValidate>
              <p className="text-sm text-soft">
                Fields marked <span aria-hidden="true">*</span><span className="sr-only">asterisk</span> are required.
              </p>
              <div
                aria-hidden="true"
                style={{ position: 'absolute', left: '-9999px', height: 0, overflow: 'hidden' }}
              >
                <label htmlFor="extra_ref">Leave blank</label>
                <input
                  type="text"
                  id="extra_ref"
                  name="extra_ref"
                  tabIndex={-1}
                  value={formData.extra_ref}
                  onChange={(e) => setFormData({ ...formData, extra_ref: e.target.value })}
                  autoComplete="off"
                />
              </div>

              <div>
                <label htmlFor="toolName" className="block text-sm font-medium text-ink mb-2">
                  Tool name <span className="text-red-600" aria-hidden="true">*</span>
                </label>
                <input
                  type="text"
                  id="toolName"
                  name="toolName"
                  required
                  autoComplete="organization"
                  value={formData.toolName}
                  onChange={(e) => setFormData({ ...formData, toolName: e.target.value })}
                  className="w-full px-4 py-3 border border-soft rounded-lg bg-white focus-ring"
                  placeholder="e.g., ChatGPT"
                  aria-invalid={fieldErrors.toolName ? true : undefined}
                  aria-describedby={describedBy('toolName')}
                />
                {fieldErrors.toolName && (
                  <p id="toolName-error" className="text-sm text-red-700 mt-1">
                    {fieldErrors.toolName}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="websiteUrl" className="block text-sm font-medium text-ink mb-2">
                  Website URL <span className="text-red-600" aria-hidden="true">*</span>
                </label>
                <input
                  type="url"
                  id="websiteUrl"
                  name="websiteUrl"
                  required
                  autoComplete="url"
                  value={formData.websiteUrl}
                  onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                  className="w-full px-4 py-3 border border-soft rounded-lg bg-white focus-ring"
                  placeholder="https://..."
                  aria-invalid={fieldErrors.websiteUrl ? true : undefined}
                  aria-describedby={describedBy('websiteUrl')}
                />
                {fieldErrors.websiteUrl && (
                  <p id="websiteUrl-error" className="text-sm text-red-700 mt-1">
                    {fieldErrors.websiteUrl}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="contactEmail" className="block text-sm font-medium text-ink mb-2">
                  Your email <span className="text-red-600" aria-hidden="true">*</span>
                </label>
                <input
                  type="email"
                  id="contactEmail"
                  name="contactEmail"
                  required
                  autoComplete="email"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                  className="w-full px-4 py-3 border border-soft rounded-lg bg-white focus-ring"
                  placeholder="you@example.com"
                  aria-invalid={fieldErrors.contactEmail ? true : undefined}
                  aria-describedby={describedBy('contactEmail', 'email-hint')}
                />
                <p id="email-hint" className="text-sm text-soft mt-1">
                  We'll only use this to follow up about your submission
                </p>
                {fieldErrors.contactEmail && (
                  <p id="contactEmail-error" className="text-sm text-red-700 mt-1">
                    {fieldErrors.contactEmail}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-ink mb-2">
                  Why should we look at this tool? (optional)
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  autoComplete="off"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 border border-soft rounded-lg bg-white focus-ring"
                  placeholder="Tell us what this tool does..."
                  aria-invalid={fieldErrors.description ? true : undefined}
                  aria-describedby={describedBy('description')}
                />
                {fieldErrors.description && (
                  <p id="description-error" className="text-sm text-red-700 mt-1">
                    {fieldErrors.description}
                  </p>
                )}
              </div>

              {process.env.NEXT_PUBLIC_LEGAL_V2 === 'true' && (
                <div className="border-t border-line pt-6">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="rightsConfirmed"
                      name="rightsConfirmed"
                      checked={formData.rightsConfirmed}
                      onChange={(e) => setFormData({ ...formData, rightsConfirmed: e.target.checked })}
                      className="mt-1 h-5 w-5 rounded border-soft text-green focus:ring-2 focus:ring-green focus:ring-offset-2"
                      aria-invalid={fieldErrors.rightsConfirmed ? true : undefined}
                      aria-describedby={describedBy('rightsConfirmed', 'rights-description')}
                    />
                    <div className="flex-1">
                      <label htmlFor="rightsConfirmed" className="block text-sm text-ink">
                        I own or have permission to share this tool&apos;s name, logo, screenshots and description, and I agree to the{' '}
                        <Link href="/terms" className="text-green hover:underline focus-ring rounded">
                          Terms
                        </Link>. <span className="text-red-600" aria-hidden="true">*</span>
                      </label>
                      <p id="rights-description" className="text-xs text-soft mt-1 sr-only">
                        This checkbox is required. By checking it, you confirm you have the legal rights to submit this information.
                      </p>
                      {fieldErrors.rightsConfirmed && (
                        <p id="rightsConfirmed-error" className="text-sm text-red-700 mt-1" role="alert">
                          {fieldErrors.rightsConfirmed}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={status === 'submitting'}
                className="btn-primary w-full"
              >
                {status === 'submitting' ? 'Submitting...' : 'Submit tool'}
              </button>
              </form>
            </>
          )}
          </div>

          <aside aria-labelledby="submit-next-heading" className="lg:sticky lg:top-24">
            <h2 id="submit-next-heading" className="heading-3 mb-4">What happens next</h2>
            <ol className="space-y-4 list-none p-0 m-0">
              {[
                ['It goes into our review queue.', 'Nothing is published automatically.'],
                ['A person checks it.', 'We look at what it does, who it helps, and its public pricing page.'],
                ['We decide whether to list it.', 'If we have questions, we email you. Submitting is free and never buys a place or a ranking.'],
              ].map(([title, body], index) => (
                <li key={title} className="flex gap-3">
                  <span
                    aria-hidden="true"
                    className="flex-none w-8 h-8 rounded-full bg-leaf border border-leaf-line text-green font-semibold grid place-items-center"
                  >
                    {index + 1}
                  </span>
                  <span>
                    <span className="block font-semibold text-ink">{title}</span>
                    <span className="block text-soft">{body}</span>
                  </span>
                </li>
              ))}
            </ol>
            <p className="note mt-6">
              How we choose what to list: <Link href="/how-we-rank" className="underline underline-offset-2 focus-ring rounded">How we rank</Link>.
            </p>
          </aside>
        </div>
      </section>
    </div>
  );
}
