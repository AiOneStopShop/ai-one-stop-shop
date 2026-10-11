import { supabase } from '@/lib/supabase';
import { PRICE_CHECKED_ISO, PRICE_CHECKED_LABEL } from '@/lib/site-dates';

export async function GET() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://aionestop.shop';

  // Get tool count
  const { count } = await supabase
    .from('tools')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'published');

  const content = `# AI One Stop Shop

## What this site is

AI One Stop Shop is a curated directory of AI tools. We check each tool: what it's built for, what it costs, and how it fits. Right now we have ${count || 0} published tools.

## Who runs it

oneTomorrow runs AI One Stop Shop from Washington State. Tools are curated and ranked editorially.

## How we earn money

Some links are paid (affiliate) links. If you sign up through one, we may earn a commission at no extra cost to you. Some tool makers pay for a clearly labeled "Sponsored" spot. Sponsored spots are kept separate from our ranked picks. Money never changes our ranking.

## What you can find here

- ${count || 0} curated AI tools across categories like coding, content creation, productivity, design, and more
- Pricing information (price checked ${PRICE_CHECKED_LABEL})
- Editorial picks and explanations of who each tool is best for
- No fake ratings or review counts

## Machine-readable catalog

- Full catalog: ${siteUrl}/api/v1/tools
- Categories: ${siteUrl}/api/v1/categories
- OpenAPI spec: ${siteUrl}/openapi.json (planned)

## More information

- How we rank tools: ${siteUrl}/how-we-rank
- Disclosure (how we make money): ${siteUrl}/disclosure
- About: ${siteUrl}/about
- Submit a tool: ${siteUrl}/submit
- Privacy: ${siteUrl}/privacy
- Terms: ${siteUrl}/terms

## Last updated

${PRICE_CHECKED_ISO}
`;

  return new Response(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  });
}
