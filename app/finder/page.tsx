import { getActiveAffiliateGoSlugs } from '@/lib/affiliate-links';
import { PageJsonLd } from '@/components/PageJsonLd';
import FinderClient from './FinderClient';

export default async function FinderPage() {
  const affiliates = await getActiveAffiliateGoSlugs();
  return (
    <>
      <PageJsonLd
        path="/finder"
        name="AI Tool Finder"
        description="Answer a few quick questions and get AI tools that fit your job and budget."
        type="WebApplication"
      />
      <FinderClient affiliates={affiliates} />
    </>
  );
}
