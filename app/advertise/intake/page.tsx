'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

const packages = [
  { value: 'featured_tool', label: 'Featured Tool ($39)' },
  { value: 'category_spotlight', label: 'Category Spotlight ($69)' },
  { value: 'newsletter', label: 'Newsletter Sponsor ($29)', disabled: true },
  { value: 'founding_bundle', label: 'Founding Bundle ($99)' },
];

const categories = [
  'Writing & Content',
  'Code & Development',
  'Image Generation',
  'Video',
  'Audio & Voice',
  'Chat & Assistants',
  'Research & Data',
  'Productivity',
  'Marketing & SEO',
  'Customer Support',
  'HR & Recruiting',
  'Sales',
  'Design',
  'Education',
  'Legal',
  'Other',
];

function IntakeFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    email: '',
    toolName: '',
    toolUrl: '',
    package: searchParams.get('package') || '',
    preferredStartDate: '',
    categorySlug: '',
    blurb: '',
    logoUrl: '',
    logoFile: null as File | null,
    destinationUrl: '',
    targetsChildren: false,
    agreedToTerms: false,
    agreedToRights: false,
    honeypot: '',
  });

  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (200KB max)
      if (file.size > 200 * 1024) {
        setErrorMessage('Logo file must be under 200KB');
        setStatus('error');
        e.target.value = '';
        return;
      }

      // Validate file type
      const validTypes = ['image/png', 'image/svg+xml'];
      if (!validTypes.includes(file.type)) {
        setErrorMessage('Logo must be PNG or SVG');
        setStatus('error');
        e.target.value = '';
        return;
      }

      setFormData((prev) => ({ ...prev, logoFile: file }));
      setErrorMessage('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Honeypot check
    if (formData.honeypot) {
      return;
    }

    // Validate required checkboxes
    if (!formData.agreedToTerms || !formData.agreedToRights) {
      setErrorMessage('You must agree to both checkboxes to continue.');
      setStatus('error');
      return;
    }

    // Validate under-13 targeting
    if (formData.targetsChildren) {
      setErrorMessage('We cannot accept sponsorships for tools targeting children under 13.');
      setStatus('error');
      return;
    }

    setStatus('submitting');
    setErrorMessage('');

    try {
      const submitData = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'logoFile' && value instanceof File) {
          submitData.append(key, value);
        } else if (typeof value === 'boolean') {
          submitData.append(key, value.toString());
        } else if (value) {
          submitData.append(key, value.toString());
        }
      });

      const response = await fetch('/api/sponsor/intake', {
        method: 'POST',
        body: submitData,
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
            <h1 className="heading-1 mb-4">Sponsorship intake form</h1>
            <p className="text-lg text-[#5B657B]">
              Provide your assets and details for your sponsored placement.
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
                Contact name <span className="text-red-600">*</span>
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

            {/* Package & Dates */}
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

            <div>
              <label htmlFor="preferredStartDate" className="block text-sm font-medium mb-2">
                Preferred start date <span className="text-red-600">*</span>
              </label>
              <input
                type="date"
                id="preferredStartDate"
                name="preferredStartDate"
                required
                value={formData.preferredStartDate}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 border border-[#5B657B] rounded-lg focus-ring"
                disabled={status === 'submitting'}
              />
            </div>

            {/* Category (for spotlight) */}
            {(formData.package === 'category_spotlight' || formData.package === 'founding_bundle') && (
              <div>
                <label htmlFor="categorySlug" className="block text-sm font-medium mb-2">
                  Category <span className="text-red-600">*</span>
                </label>
                <select
                  id="categorySlug"
                  name="categorySlug"
                  required
                  value={formData.categorySlug}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-[#5B657B] rounded-lg focus-ring bg-white"
                  disabled={status === 'submitting'}
                >
                  <option value="">Select a category...</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-')}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Marketing Content */}
            <div>
              <label htmlFor="blurb" className="block text-sm font-medium mb-2">
                Marketing blurb (40 words max) <span className="text-red-600">*</span>
              </label>
              <textarea
                id="blurb"
                name="blurb"
                required
                rows={3}
                maxLength={240}
                value={formData.blurb}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-[#5B657B] rounded-lg focus-ring"
                placeholder="Describe your tool in plain English. We may edit for clarity."
                disabled={status === 'submitting'}
              />
              <p className="text-sm text-[#5B657B] mt-1">
                {formData.blurb.split(/\s+/).filter(Boolean).length}/40 words
              </p>
            </div>

            {/* Logo */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Logo
              </label>
              <div className="space-y-3">
                <div>
                  <label htmlFor="logoUrl" className="block text-xs text-[#5B657B] mb-1">
                    Logo URL (optional)
                  </label>
                  <input
                    type="url"
                    id="logoUrl"
                    name="logoUrl"
                    maxLength={500}
                    placeholder="https://example.com/logo.png"
                    value={formData.logoUrl}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-[#5B657B] rounded-lg focus-ring"
                    disabled={status === 'submitting'}
                  />
                </div>
                <div className="text-center text-sm text-[#5B657B]">or</div>
                <div>
                  <label htmlFor="logoFile" className="block text-xs text-[#5B657B] mb-1">
                    Upload logo file (PNG or SVG, max 200KB)
                  </label>
                  <input
                    type="file"
                    id="logoFile"
                    name="logoFile"
                    accept=".png,.svg,image/png,image/svg+xml"
                    onChange={handleFileChange}
                    className="w-full px-4 py-3 border border-[#5B657B] rounded-lg focus-ring"
                    disabled={status === 'submitting'}
                  />
                </div>
              </div>
            </div>

            {/* Destination URL */}
            <div>
              <label htmlFor="destinationUrl" className="block text-sm font-medium mb-2">
                Destination URL <span className="text-red-600">*</span>
              </label>
              <input
                type="url"
                id="destinationUrl"
                name="destinationUrl"
                required
                maxLength={500}
                placeholder="https://yourtool.com/signup"
                value={formData.destinationUrl}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-[#5B657B] rounded-lg focus-ring"
                disabled={status === 'submitting'}
              />
              <p className="text-sm text-[#5B657B] mt-1">Where should the sponsored link go?</p>
            </div>

            {/* Under-13 question */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  name="targetsChildren"
                  checked={formData.targetsChildren}
                  onChange={handleChange}
                  className="mt-1"
                  disabled={status === 'submitting'}
                />
                <span className="text-sm">
                  <strong>My tool is designed for or marketed to children under 13</strong>
                  <br />
                  <span className="text-[#5B657B]">
                    (If checked, we cannot accept your sponsorship)
                  </span>
                </span>
              </label>
            </div>

            {/* Consent Checkboxes */}
            <div className="space-y-3">
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  name="agreedToTerms"
                  required
                  checked={formData.agreedToTerms}
                  onChange={handleChange}
                  className="mt-1"
                  disabled={status === 'submitting'}
                />
                <span className="text-sm">
                  I agree to the{' '}
                  <Link href="/sponsor-terms" className="text-[#6C39EF] hover:underline focus-ring rounded" target="_blank">
                    Sponsor Terms
                  </Link>{' '}
                  <span className="text-red-600">*</span>
                </span>
              </label>

              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  name="agreedToRights"
                  required
                  checked={formData.agreedToRights}
                  onChange={handleChange}
                  className="mt-1"
                  disabled={status === 'submitting'}
                />
                <span className="text-sm">
                  I have the rights to the logo and text I submit{' '}
                  <span className="text-red-600">*</span>
                </span>
              </label>
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
              {status === 'submitting' ? 'Submitting...' : 'Submit intake form'}
            </button>

            <p className="text-sm text-[#5B657B] text-center">
              We'll review your submission and be in touch within 2 business days.
            </p>
          </form>
        </div>
      </section>
    </div>
  );
}

export default function AdvertiseIntakePage() {
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
      <IntakeFormContent />
    </Suspense>
  );
}
