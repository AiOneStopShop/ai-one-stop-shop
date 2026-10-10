'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function SubmitPage() {
  const [formData, setFormData] = useState({
    toolName: '',
    websiteUrl: '',
    contactEmail: '',
    description: '',
  });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');

    try {
      const response = await fetch('/api/submit-tool', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setStatus('success');
        setFormData({ toolName: '', websiteUrl: '', contactEmail: '', description: '' });
      } else {
        setStatus('error');
      }
    } catch (error) {
      setStatus('error');
    }
  };

  return (
    <div id="main-content" className="scroll-mt-16">
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
            Know an AI tool we should review? Submit it here. We review every submission, though it may take time.
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
            <form onSubmit={handleSubmit} className="space-y-6">
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
                />
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
                />
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
                />
                <p className="text-sm text-[#5B657B] mt-1">
                  We'll only use this to follow up about your submission
                </p>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-[#171C26] mb-2">
                  Why should we review this tool? (optional)
                </label>
                <textarea
                  id="description"
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 border border-[#5B657B] rounded-lg focus-ring"
                  placeholder="Tell us what makes this tool interesting..."
                />
              </div>

              {status === 'error' && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-800">
                    Something went wrong. Please try again or email us at hello@aionestop.shop
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={status === 'submitting'}
                className="btn-primary w-full"
              >
                {status === 'submitting' ? 'Submitting...' : 'Submit tool'}
              </button>

              <p className="text-xs text-[#5B657B] text-center">
                By submitting, you confirm you have a legitimate interest in this tool being reviewed.
              </p>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
