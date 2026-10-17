'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

const packages = [
  { value: 'featured-tool', label: 'Featured Tool ($39)', price: '$39' },
  { value: 'category-spotlight', label: 'Category Spotlight ($69)', price: '$69' },
  { value: 'newsletter', label: 'Newsletter Sponsor ($29)', price: '$29', disabled: true },
  { value: 'founding-bundle', label: 'Founding Bundle ($99)', price: '$99' },
];

function RequestFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultPackage = searchParams.get('package') || '';

  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    email: '',
    toolName: '',
    toolUrl: '',
    package: defaultPackage,
    message: '',
    honeypot: '',
  });

  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Honeypot check
    if (formData.honeypot) {
      return;
    }

    setStatus('submitting');
    setErrorMessage('');

    try {
      const response = await fetch('/api/sponsor/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 429) {
          setErrorMessage('Too many requests. Please try again in an hour.');
        } else {
          setErrorMessage(result.error || 'Something went wrong. Please try again.');
        }
        setStatus('error');
        return;
      }

      setStatus('success');
      router.push('/advertise/thanks');
    } catch (err) {
      setErrorMessage('Network error. Please check your connection and try again.');
      setStatus('error');
    }
  };

  return (
    <div className="scroll-mt-16">
      <section className="section-spacing">
        <div className="container-max max-w-2xl">
          <div className="mb-8">
            <Link href="/advertise" className="text-[#6C39EF] hover:underline focus-ring rounded mb-4 inline-block">
              ← Back to sponsorship options
            </Link>
            <h1 className="heading-1 mb-4">Request a sponsored spot</h1>
            <p className="text-lg text-[#5B657B]">
              Tell us about your tool. We'll review your request (usually within 2 business days) and email you next steps.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="card space-y-6">
            {/* Company Info */}
            <div>
              <label htmlFor="companyName" className="block text-sm font-medium mb-2">
                Company name <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                id="companyName"
                name="companyName"
                required
                maxLength={100}
                value={formData.companyName}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-[#5B657B] rounded-lg focus-ring"
                disabled={status === 'submitting'}
              />
            </div>

            <div>
              <label htmlFor="contactName" className="block text-sm font-medium mb-2">
                Your name <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                id="contactName"
                name="contactName"
                required
                maxLength={100}
                value={formData.contactName}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-[#5B657B] rounded-lg focus-ring"
                disabled={status === 'submitting'}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email address <span className="text-red-600">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                maxLength={255}
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-[#5B657B] rounded-lg focus-ring"
                disabled={status === 'submitting'}
              />
              <p className="text-sm text-[#5B657B] mt-1">We'll use this to reply about your request.</p>
            </div>

            {/* Tool Info */}
            <div>
              <label htmlFor="toolName" className="block text-sm font-medium mb-2">
                Tool name <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                id="toolName"
                name="toolName"
                required
                maxLength={100}
                value={formData.toolName}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-[#5B657B] rounded-lg focus-ring"
                disabled={status === 'submitting'}
              />
            </div>

            <div>
              <label htmlFor="toolUrl" className="block text-sm font-medium mb-2">
                Tool website URL <span className="text-red-600">*</span>
              </label>
              <input
                type="url"
                id="toolUrl"
                name="toolUrl"
                required
                maxLength={500}
                placeholder="https://"
                value={formData.toolUrl}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-[#5B657B] rounded-lg focus-ring"
                disabled={status === 'submitting'}
              />
            </div>

            {/* Package Selection */}
            <div>
              <label htmlFor="package" className="block text-sm font-medium mb-2">
                Package <span className="text-red-600">*</span>
              </label>
              <select
                id="package"
                name="package"
                required
                value={formData.package}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-[#5B657B] rounded-lg focus-ring bg-white"
                disabled={status === 'submitting'}
              >
                <option value="">Select a package...</option>
                {packages.map((pkg) => (
                  <option key={pkg.value} value={pkg.value} disabled={pkg.disabled}>
                    {pkg.label} {pkg.disabled ? '(Opening soon)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Message */}
            <div>
              <label htmlFor="message" className="block text-sm font-medium mb-2">
                Tell us briefly why your tool is a good fit (optional)
              </label>
              <textarea
                id="message"
                name="message"
                rows={4}
                maxLength={500}
                value={formData.message}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-[#5B657B] rounded-lg focus-ring"
                placeholder="Who uses your tool? What makes it helpful?"
                disabled={status === 'submitting'}
              />
              <p className="text-sm text-[#5B657B] mt-1">{formData.message.length}/500 characters</p>
            </div>

            {/* Honeypot */}
            <div style={{ position: 'absolute', left: '-9999px' }} aria-hidden="true">
              <label htmlFor="honeypot">Leave this field empty</label>
              <input
                type="text"
                id="honeypot"
                name="honeypot"
                tabIndex={-1}
                value={formData.honeypot}
                onChange={handleChange}
              />
            </div>

            {/* Error Message */}
            {status === 'error' && errorMessage && (
              <div className="bg-red-50 border border-red-200 text-red-900 rounded-lg p-4" role="alert">
                <p className="font-semibold">Error</p>
                <p>{errorMessage}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={status === 'submitting'}
              className="btn-primary w-full"
            >
              {status === 'submitting' ? 'Submitting...' : 'Submit request'}
            </button>

            <p className="text-sm text-[#5B657B] text-center">
              Requesting a spot is free and doesn't commit you to anything. We'll use these details only to review your request and reply to you. See our{' '}
              <Link href="/privacy" className="text-[#6C39EF] hover:underline focus-ring rounded">
                Privacy page
              </Link>
              .
            </p>
          </form>
        </div>
      </section>
    </div>
  );
}

export default function AdvertiseRequestPage() {
  return (
    <Suspense fallback={
      <div className="scroll-mt-16">
        <section className="section-spacing">
          <div className="container-max max-w-2xl">
            <div className="card p-12 text-center">
              <p className="text-[#5B657B]">Loading...</p>
            </div>
          </div>
        </section>
      </div>
    }>
      <RequestFormContent />
    </Suspense>
  );
}
