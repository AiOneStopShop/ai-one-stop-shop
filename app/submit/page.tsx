'use client';

import { useState } from 'react';
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

function textForFieldCode(code: string): string | null {
  return Object.prototype.hasOwnProperty.call(FIELD_ERROR_TEXT, code)
    ? FIELD_ERROR_TEXT[code as FieldErrorCode]
    : null;
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    setFormError('');
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
            <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
              <h2 className="heading-2 mb-2 text-green-900">✓ Submitted!</h2>
              <p className="text-green-800 mb-6">
                Thanks for the suggestion. We'll take a look and reach out if we have questions.
              </p>
              <Link href="/tools" className="btn-primary inline-block">
                Browse tools
              </Link>
            </div>
          ) : (
            <>
              {status === 'error' && formError && (
                <div
                  className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6"
                  role="alert"
                  aria-live="assertive"
                  aria-atomic="true"
                >
                  <p className="text-red-800 font-semibold mb-1">
                    Submission failed
                  </p>
                  <p className="text-red-700">{formError}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6" noValidate>
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
                  Tool name <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  id="toolName"
                  required
                  value={formData.toolName}
                  onChange={(e) => setFormData({ ...formData, toolName: e.target.value })}
                  className="w-full px-4 py-3 border border-[#5B657B] rounded-lg focus-ring"
                  placeholder="e.g., ChatGPT"
                  aria-invalid={fieldErrors.toolName ? true : undefined}
                  aria-describedby={fieldErrors.toolName ? 'toolName-error' : undefined}
                />
                {fieldErrors.toolName && (
                  <p id="toolName-error" className="text-sm text-red-700 mt-1" role="alert">
                    {fieldErrors.toolName}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="websiteUrl" className="block text-sm font-medium text-[#171C26] mb-2">
                  Website URL <span className="text-red-600">*</span>
                </label>
                <input
                  type="url"
                  id="websiteUrl"
                  required
                  value={formData.websiteUrl}
                  onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                  className="w-full px-4 py-3 border border-[#5B657B] rounded-lg focus-ring"
                  placeholder="https://..."
                  aria-invalid={fieldErrors.websiteUrl ? true : undefined}
                  aria-describedby={fieldErrors.websiteUrl ? 'websiteUrl-error' : undefined}
                />
                {fieldErrors.websiteUrl && (
                  <p id="websiteUrl-error" className="text-sm text-red-700 mt-1" role="alert">
                    {fieldErrors.websiteUrl}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="contactEmail" className="block text-sm font-medium text-[#171C26] mb-2">
                  Your email <span className="text-red-600">*</span>
                </label>
                <input
                  type="email"
                  id="contactEmail"
                  required
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                  className="w-full px-4 py-3 border border-[#5B657B] rounded-lg focus-ring"
                  placeholder="you@example.com"
                  aria-invalid={fieldErrors.contactEmail ? true : undefined}
                  aria-describedby={fieldErrors.contactEmail ? 'contactEmail-error' : undefined}
                />
                {fieldErrors.contactEmail && (
                  <p id="contactEmail-error" className="text-sm text-red-700 mt-1" role="alert">
                    {fieldErrors.contactEmail}
                  </p>
                )}
                <p className="text-sm text-[#5B657B] mt-1">
                  We'll only use this to follow up about your submission
                </p>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-[#171C26] mb-2">
                  Why should we look at this tool? (optional)
                </label>
                <textarea
                  id="description"
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 border border-[#5B657B] rounded-lg focus-ring"
                  placeholder="Tell us what this tool does..."
                  aria-invalid={fieldErrors.description ? true : undefined}
                  aria-describedby={fieldErrors.description ? 'description-error' : undefined}
                />
                {fieldErrors.description && (
                  <p id="description-error" className="text-sm text-red-700 mt-1" role="alert">
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
