import { supabase } from '@/lib/supabase';
import { PRICE_CHECKED_ISO, PRICE_CHECKED_LABEL } from '@/lib/site-dates';
import { getOperatorLegalName, isAffiliateLive } from '@/lib/site-config';

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

AI One Stop Shop is run by ${getOperatorLegalName()} (we are oneTomorrow) from Washington State. Tools are curated and ranked editorially.

## How we earn money

${isAffiliateLive() 
  ? `We earn money from clearly labeled sponsored ads, our own kits (marked 'Made by us'), and some paid (affiliate) links. Every affiliate link is marked 'Paid link' right next to it. Sponsored placements are labeled 'Sponsored ad' and are never part of our ranked order. A sponsor's normal directory listing is ranked the same way as any other tool's. Money never changes our ranking.`
  : `We earn money from clearly labeled sponsored ads and our own kits (marked 'Made by us'). Sponsored placements are labeled 'Sponsored ad' and are never part of our ranked order. A sponsor's normal directory listing is ranked the same way as any other tool's. Money never changes our ranking.`
}

## What you can find here

- ${count || 0} curated AI tools across chat, writing, image, video, audio, music, coding, agents, research, email, slides, design, marketing, productivity, and local models
- Pricing information (price checked ${PRICE_CHECKED_LABEL})
- Editorial picks and explanations of who each tool is best for
- Personas with live starter toolkits: ${siteUrl}/personas
- Budget calculator (toolkit builder): ${siteUrl}/budget
- No fake ratings or review counts

## Machine-readable catalog

- Full catalog: ${siteUrl}/api/v1/tools
- Categories: ${siteUrl}/api/v1/categories
- OpenAPI spec: ${siteUrl}/openapi.json (planned)

GET /api/v1/tools returns public fields only: name, slug, tagline, description, category, pricing_model, has_free_tier, pricing_summary, website_url, logo_url, go_url, paid_link, disclosure, and updated_at. Search with ?q= (normalized lowercase). Responses are cached for 5 minutes (stale-while-revalidate 10 minutes).

## More information

- How we rank tools: ${siteUrl}/how-we-rank
- Disclosure (how we make money): ${siteUrl}/disclosure
- About: ${siteUrl}/about
- Partner with us: ${siteUrl}/partners
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
