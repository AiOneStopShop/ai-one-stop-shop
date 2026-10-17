import { getActiveAffiliateGoSlugs } from '@/lib/affiliate-links';
import FinderClient from './FinderClient';

export default async function FinderPage() {
  const affiliates = await getActiveAffiliateGoSlugs();
  return <FinderClient affiliates={affiliates} />;
}
