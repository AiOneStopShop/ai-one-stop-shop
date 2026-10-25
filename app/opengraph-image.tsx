import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from '@/lib/og-image';

export const alt = 'AI One Stop Shop: AI that fits your life. And your budget.';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return renderOgImage({
    title: 'AI that fits your life. And your budget.',
    subtitle: 'Start with your situation and find a useful first step with AI. Free to use, no account needed.',
  });
}
