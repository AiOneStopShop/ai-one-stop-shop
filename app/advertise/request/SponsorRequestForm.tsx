'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const packages = [
  { value: 'featured-tool', label: 'Featured Tool ($39)', price: '$39' },
  { value: 'category-spotlight', label: 'Category Spotlight ($69)', price: '$69' },
  { value: 'newsletter', label: 'Newsletter Sponsor ($29)', price: '$29', disabled: true },
  { value: 'founding-bundle', label: 'Founding Bundle ($99)', price: '$99' },
  { value: 'partner-program', label: 'Partner Program', price: 'Contact' },
];

interface SponsorRequestFormProps {
  preselectedPackage?: string;
}

export function SponsorRequestForm({ preselectedPackage = '' }: SponsorRequestFormProps) {
  const router = useRouter();

  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    email: '',
    toolName: '',
    toolUrl: '',
    package: preselectedPackage,
    message: '',
    honeypot: '',
  });

  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const errorSummaryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (validationErrors.length > 0 && errorSummaryRef.current) {
      errorSummaryRef.current.focus();
    }
  }, [validationErrors]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setValidationErrors([]); // Clear validation errors on change
  };

  const validateForm = (): string[] => {
    const errors: string[] = [];
    if (!formData.companyName.trim()) errors.push('Company name is required');
    if (!formData.contactName.trim()) errors.push('Your name is required');
    if (!formData.email.trim()) errors.push('Email is required');
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.push('Email must be valid');
    if (!formData.toolName.trim()) errors.push('Tool name is required');
    if (!formData.toolUrl.trim()) errors.push('Tool website URL is required');
    if (!formData.package) errors.push('Please select a sponsorship package');
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Honeypot check
    if (formData.honeypot) {
      return;
    }

    // Validate form
    const errors = validateForm();
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    setStatus('submitting');
    setErrorMessage('');
    setValidationErrors([]);

    try {
      const response = await fetch('/api/sponsor/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 429) {
          setErrorMessage('Too many requests. Please try again in 15 minutes.');
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
            <Link href="/advertise" className="text-green hover:underline focus-ring rounded mb-4 inline-block">
              ← Back to sponsorship options
            </Link>
            <h1 className="heading-1 mb-4">Request a sponsored spot</h1>
            <p className="text-lg text-soft">
              Tell us about your tool. We'll review your request (usually within 2 business days) and email you next steps.
            </p>
          </div>

          {/* Validation Error Summary */}
          {validationErrors.length > 0 && (
            <div
              ref={errorSummaryRef}
              role="alert"
              aria-live="polite"
              tabIndex={-1}
              className="rounded-lg border border-red-300 bg-red-50 p-4 mb-6"
            >
              <h2 className="text-sm font-semibold text-red-800 mb-2">
                {validationErrors.length === 1 ? 'Please correct the following error:' : `Please correct the following ${validationErrors.length} errors:`}
              </h2>
              <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                {validationErrors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}

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
                className="w-full px-4 py-3 border border-soft rounded-lg focus-ring"
                disabled={status === 'submitting'}
                aria-invalid={validationErrors.some(e => e.includes('Company name'))}
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
                className="w-full px-4 py-3 border border-soft rounded-lg focus-ring"
                disabled={status === 'submitting'}
                aria-invalid={validationErrors.some(e => e.includes('Your name'))}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email <span className="text-red-600">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                maxLength={100}
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-soft rounded-lg focus-ring"
                disabled={status === 'submitting'}
                aria-invalid={validationErrors.some(e => e.includes('Email'))}
              />
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
                maxLength={200}
                value={formData.toolName}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-soft rounded-lg focus-ring"
                disabled={status === 'submitting'}
                aria-invalid={validationErrors.some(e => e.includes('Tool name'))}
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
                value={formData.toolUrl}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-soft rounded-lg focus-ring"
                placeholder="https://"
                disabled={status === 'submitting'}
                aria-invalid={validationErrors.some(e => e.includes('Tool website URL'))}
              />
            </div>

            {/* Package Selection */}
            <div>
              <label htmlFor="package" className="block text-sm font-medium mb-2">
                Sponsorship package <span className="text-red-600">*</span>
              </label>
              <select
                id="package"
                name="package"
                required
                value={formData.package}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-soft rounded-lg focus-ring"
                disabled={status === 'submitting'}
                aria-invalid={validationErrors.some(e => e.includes('package'))}
              >
                <option value="">Select a package</option>
                {packages.map((pkg) => (
                  <option key={pkg.value} value={pkg.value} disabled={pkg.disabled}>
                    {pkg.label} {pkg.disabled ? '(Opening once the list launches)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Message */}
            <div>
              <label htmlFor="message" className="block text-sm font-medium mb-2">
                Additional details (optional)
              </label>
              <textarea
                id="message"
                name="message"
                rows={4}
                maxLength={1000}
                value={formData.message}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-soft rounded-lg focus-ring resize-none"
                placeholder="Any special requests, preferred dates, or questions?"
                disabled={status === 'submitting'}
              />
            </div>

            {/* Honeypot: hidden from people and assistive tech, labelled for audits */}
            <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', width: '1px', height: '1px', overflow: 'hidden' }}>
              <label htmlFor="sponsor-hp-website">Leave this field empty</label>
              <input
                type="text"
                id="sponsor-hp-website"
                name="honeypot"
                value={formData.honeypot}
                onChange={handleChange}
                tabIndex={-1}
                autoComplete="off"
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

            <p className="text-sm text-soft text-center">
              Requesting a spot is free and doesn't commit you to anything. We'll use these details only to review your request and reply to you. See our{' '}
              <Link href="/privacy" className="text-green hover:underline focus-ring rounded">
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
