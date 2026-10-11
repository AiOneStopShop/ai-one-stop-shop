'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

const FIELD_ERROR_TEXT = {
  name_missing: 'Please enter a tool name.',
  url_invalid: 'Please enter a valid website URL.',
  email_invalid: 'Please enter a valid email address.',
  too_long: 'That field is too long.',
} as const;

type FieldErrorCode = keyof typeof FIELD_ERROR_TEXT;

const FORM_ERROR_TEXT = {
  too_many: 'Too many requests. Please try again later.',
  submit_failed: 'Something went wrong. Please try again or email hello@aionestop.shop',
} as const;

const FIELD_LABELS: Record<string, string> = {
  toolName: 'Tool name',
  websiteUrl: 'Website URL',
  contactEmail: 'Your email',
  description: 'Why should we look at this tool?',
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

  return errors;
}

export default function SubmitPage() {
  const [formData, setFormData] = useState({
    toolName: '',
    websiteUrl: '',
    contactEmail: '',
    description: '',
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
        setFormData({ toolName: '', websiteUrl: '', contactEmail: '', description: '', extra_ref: '' });
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
      setFormError(
        Object.prototype.hasOwnProperty.call(FORM_ERROR_TEXT, formCode)
          ? FORM_ERROR_TEXT[formCode as keyof typeof FORM_ERROR_TEXT]
          : FORM_ERROR_TEXT.submit_failed
      );
      setStatus('error');
    } catch {
      setFormError(FORM_ERROR_TEXT.submit_failed);
      setStatus('error');
    }
  };

  const describedBy = (field: string, extra?: string) => {
    const ids = [extra, fieldErrors[field] ? `${field}-error` : null].filter(Boolean);
    return ids.length ? ids.join(' ') : undefined;
  };

  return (
    <div className="scroll-mt-16">
      <section className="section-spacing">
        <div className="container-max max-w-2xl">
          <nav aria-label="Breadcrumb" className="mb-8">
            <ol className="flex items-center gap-2 text-sm">
              <li>
                <Link href="/" className="text-[#5B657B] hover:text-[#6C39EF] focus-ring rounded">
                  Home
                </Link>
              </li>
              <li aria-hidden="true" className="text-[#5B657B]">/</li>
              <li aria-current="page" className="text-[#171C26] font-medium">
                Submit a Tool
              </li>
            </ol>
          </nav>

          <h1 className="heading-1 mb-4">Submit a Tool</h1>
          <p className="text-lead mb-8 text-[#5B657B]">
            Know an AI tool we should look at? Submit it here.
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <p className="text-sm text-[#171C26]">
              <strong>What happens next:</strong> Your submission goes into our review queue. A person will check it out and decide whether to add it. We don't auto-publish submissions.
            </p>
          </div>

          {status === 'success' ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center" role="status">
              <h2
                ref={successRef}
                tabIndex={-1}
                className="heading-2 mb-2 text-green-900 focus:outline-none"
              >
                Submitted!
              </h2>
              <p className="text-green-800 mb-6">
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

              <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              <p className="text-sm text-[#5B657B]">
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
                <label htmlFor="toolName" className="block text-sm font-medium text-[#171C26] mb-2">
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
                  className="w-full px-4 py-3 border border-[#5B657B] rounded-lg focus-ring"
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
                <label htmlFor="websiteUrl" className="block text-sm font-medium text-[#171C26] mb-2">
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
                  className="w-full px-4 py-3 border border-[#5B657B] rounded-lg focus-ring"
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
                <label htmlFor="contactEmail" className="block text-sm font-medium text-[#171C26] mb-2">
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
                  className="w-full px-4 py-3 border border-[#5B657B] rounded-lg focus-ring"
                  placeholder="you@example.com"
                  aria-invalid={fieldErrors.contactEmail ? true : undefined}
                  aria-describedby={describedBy('contactEmail', 'email-hint')}
                />
                <p id="email-hint" className="text-sm text-[#5B657B] mt-1">
                  We'll only use this to follow up about your submission
                </p>
                {fieldErrors.contactEmail && (
                  <p id="contactEmail-error" className="text-sm text-red-700 mt-1">
                    {fieldErrors.contactEmail}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-[#171C26] mb-2">
                  Why should we look at this tool? (optional)
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  autoComplete="off"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 border border-[#5B657B] rounded-lg focus-ring"
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
      </section>
    </div>
  );
}
