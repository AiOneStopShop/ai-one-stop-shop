import type { Metadata } from 'next';
import { Suspense } from 'react';
import { SponsorRequestForm } from './SponsorRequestForm';

export const metadata: Metadata = {
  title: 'Advertise with Us - AI One Stop Shop',
  description: 'Reach a quality audience of builders, founders, and tech buyers with sponsored placements on AI One Stop Shop.',
};

<<<<<<< HEAD
const VALID_PACKAGES = [
  'featured-tool',
  'category-spotlight',
  'newsletter',
  'founding-bundle',
=======
const packages = [
  { value: 'featured-tool', label: 'Featured Tool ($39)', price: '$39' },
  { value: 'category-spotlight', label: 'Category Spotlight ($69)', price: '$69' },
  { value: 'newsletter', label: 'Newsletter Sponsor ($29)', price: '$29', disabled: true },
  { value: 'founding-bundle', label: 'Founding Bundle ($99)', price: '$99' },
  { value: 'partner-program', label: 'Affiliate / partner program (free to discuss)', price: 'Free' },
>>>>>>> afb0e9b (Apply Lexi legal review fixes A1-A12 and B1-B7 for PR #8)
];

export default async function AdvertiseRequestPage({
  searchParams,
}: {
  searchParams: Promise<{ package?: string }>;
}) {
  const params = await searchParams;
  const pkg = params.package || '';
  const preselectedPackage = VALID_PACKAGES.includes(pkg) ? pkg : '';

  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-3xl px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">Request Sponsorship</h1>
          <p className="text-gray-600 mb-8">
            Loading form...
          </p>
        </div>
      }
    >
      <SponsorRequestForm preselectedPackage={preselectedPackage} />
    </Suspense>
  );
}
