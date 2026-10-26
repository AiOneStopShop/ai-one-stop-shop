/**
 * Answer-engine friendly content for audience guides, built only from data we
 * store: the guide's own picks (task + why) and each tool's catalog fields
 * (name, pricing_summary, has_free_tier, last_verified_at).
 *
 * No stats, ratings, rankings, user counts or "we tested" claims are generated here.
 */
import type { Guide, GuideFaq, GuidePick } from '@/lib/guides';

export type GuideCatalogTool = {
  slug: string;
  name: string;
  tagline: string | null;
  pricing_summary: string | null;
  has_free_tier: boolean | null;
  last_verified_at: string | null;
};

export type GuideEntry = { pick: GuidePick; tool: GuideCatalogTool };

/** How many picks the "In short" answer names. */
export const TOP_PICK_COUNT = 3;

export function joinNames(names: string[]): string {
  if (names.length === 0) return '';
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
}

function lowerFirst(text: string): string {
  return text ? text.charAt(0).toLowerCase() + text.slice(1) : text;
}

function parseDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** Newest last-checked price date among the picks (ISO yyyy-mm-dd), or null. */
export function lastReviewedIso(entries: GuideEntry[]): string | null {
  let newest: Date | null = null;
  for (const { tool } of entries) {
    const date = parseDate(tool.last_verified_at);
    if (date && (!newest || date > newest)) newest = date;
  }
  return newest ? newest.toISOString().slice(0, 10) : null;
}

export function formatGuideDate(value: string | null | undefined): string | null {
  const date = parseDate(value);
  if (!date) return null;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
}

/** Short price for the task table: the first plan in the catalog summary (text before the first ";"). */
export function priceFrom(summary: string | null): string {
  const first = (summary || '').split(';')[0].trim();
  return first || 'See pricing page';
}

export function freePlanLabel(hasFree: boolean | null): 'Yes' | 'No' | 'Not listed' {
  if (hasFree === true) return 'Yes';
  if (hasFree === false) return 'No';
  return 'Not listed';
}

export type TaskRow = { task: string; slug: string; name: string; freePlan: string; price: string };

export function guideTaskRows(entries: GuideEntry[]): TaskRow[] {
  return entries.map(({ pick, tool }) => ({
    task: pick.task,
    slug: tool.slug,
    name: tool.name,
    freePlan: freePlanLabel(tool.has_free_tier),
    price: priceFrom(tool.pricing_summary),
  }));
}

/** One-paragraph direct answer naming the top picks. */
export function guideAnswer(guide: Guide, entries: GuideEntry[]): string | null {
  const top = entries.slice(0, TOP_PICK_COUNT);
  if (top.length === 0) return null;
  const named = joinNames(top.map(({ pick, tool }) => `${tool.name} (${lowerFirst(pick.task)})`));
  const freeCount = entries.filter(({ tool }) => tool.has_free_tier === true).length;
  const freeLine =
    freeCount === 0
      ? ''
      : freeCount === entries.length
        ? entries.length === 1
          ? ' It lists a free plan on its pricing page.'
          : entries.length === 2
            ? ' Both list a free plan on their pricing page.'
            : ` All ${entries.length} picks list a free plan on their pricing page.`
        : ` ${freeCount} of the ${entries.length} picks list a free plan on their pricing page.`;
  return `The ${guide.topic} we suggest starting with are ${named}.${freeLine}`;
}

/** 3-5 FAQ entries built only from stored facts plus the guide's own general advice. */
export function guideFaq(guide: Guide, entries: GuideEntry[]): GuideFaq[] {
  if (entries.length === 0) return [];
  const faq: GuideFaq[] = [];
  const top = entries.slice(0, TOP_PICK_COUNT);

  faq.push({
    question: `Which ${guide.topic} do you suggest?`,
    answer: `We suggest starting with ${joinNames(
      top.map(({ pick, tool }) => `${tool.name} for ${lowerFirst(pick.task)}`)
    )}. This guide lists ${entries.length} picks in total, each a published tool in our catalog.`,
  });

  const free = entries.filter(({ tool }) => tool.has_free_tier === true).map(({ tool }) => tool.name);
  faq.push({
    question: 'Which of these tools have a free plan?',
    answer:
      free.length > 0
        ? `According to each tool\u2019s pricing page, ${joinNames(free)} ${free.length === 1 ? 'has' : 'have'} a free plan. Free plans usually have limits, so check what is included.`
        : 'None of the picks in this guide list a free plan on their pricing page right now. Check each tool\u2019s pricing page for trials.',
  });

  const reviewed = formatGuideDate(lastReviewedIso(entries));
  const priced = top.filter(({ tool }) => tool.pricing_summary);
  if (priced.length > 0) {
    faq.push({
      question: `How much do ${joinNames(priced.map(({ tool }) => tool.name))} cost?`,
      answer: `${priced.map(({ tool }) => `${tool.name}: ${tool.pricing_summary!.trim().replace(/\.$/, '')}.`).join(' ')} Prices come from each tool\u2019s pricing page${
        reviewed ? `, last checked ${reviewed}` : ''
      }, and they can change, so check before you buy.`,
    });
  }

  faq.push({
    question: 'How did you choose these tools?',
    answer:
      'Every pick is a published tool in our catalog, picked editorially for the jobs listed in this guide. No tool paid to be on this list, and money never changes our ranking.',
  });

  for (const extra of guide.extraFaq || []) {
    if (faq.length >= 5) break;
    faq.push(extra);
  }
  return faq.slice(0, 5);
}

/** "Guides" section for /llms.txt, generated from the guide data. */
export function llmsGuidesSection(guides: Guide[], siteUrl: string): string {
  const base = siteUrl.replace(/\/+$/, '');
  const lines = [
    '## Guides',
    '',
    `- All guides (best AI tools by audience and budget): ${base}/guides`,
    ...guides.map((guide) => `- ${guide.title}: ${base}/guides/${guide.slug} - ${guide.metaDescription}`),
  ];
  return lines.join('\n');
}
