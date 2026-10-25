import { GUIDES, getGuide } from '@/lib/guides';
import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from '@/lib/og-image';

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = 'AI One Stop Shop guide';

export function generateStaticParams() {
  return GUIDES.map((guide) => ({ slug: guide.slug }));
}

export default async function Image(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  const guide = getGuide(slug);
  return renderOgImage({
    eyebrow: guide ? `Guide · ${guide.audience}` : 'Guide',
    title: guide?.title ?? 'AI One Stop Shop guides',
    subtitle: guide?.question,
  });
}
