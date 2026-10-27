import { test, expect } from '@playwright/test';
import { GUIDES, getGuide } from '../lib/guides';
import {
  freePlanLabel,
  guideAnswer,
  guideFaq,
  guideTaskRows,
  lastReviewedIso,
  priceCheckRange,
  priceCheckRangeLabel,
  faqAnswerText,
  faqAnswerSchemaText,
  GUIDE_DISCLOSURE,
  llmsGuidesSection,
  priceFrom,
  type GuideEntry,
} from '../lib/guide-content';
import { generateFaqSchema, generateGuidePageSchema, safeJsonLd } from '../lib/json-ld';

const BASE = 'https://www.aionestop.shop';
const teachers = getGuide('best-ai-tools-for-teachers')!;

function entries(): GuideEntry[] {
  const tools: Record<string, GuideEntry['tool']> = {
    magicschool: { slug: 'magicschool', name: 'MagicSchool', tagline: null, pricing_summary: 'Free forever for teachers; Plus $12.99/mo', has_free_tier: true, last_verified_at: '2026-10-20T00:00:00Z' },
    'brisk-teaching': { slug: 'brisk-teaching', name: 'Brisk Teaching', tagline: null, pricing_summary: 'Free for teachers ($0)', has_free_tier: true, last_verified_at: '2026-10-26T14:35:02Z' },
    khanmigo: { slug: 'khanmigo', name: 'Khanmigo', tagline: null, pricing_summary: null, has_free_tier: null, last_verified_at: 'not a date' },
    grammarly: { slug: 'grammarly', name: 'Grammarly', tagline: null, pricing_summary: 'Pro $12/mo', has_free_tier: false, last_verified_at: null },
  };
  return teachers.picks.filter((p) => tools[p.slug]).map((pick) => ({ pick, tool: tools[pick.slug] }));
}

test('every guide pick has a task and teachers guide includes the classroom tools', () => {
  for (const guide of GUIDES) {
    expect(guide.topic.length).toBeGreaterThan(0);
    for (const pick of guide.picks) {
      expect(pick.task.trim().length, `${guide.slug}/${pick.slug}`).toBeGreaterThan(0);
      expect(pick.why).not.toMatch(/\$\d/); // prices come from the catalog, never the copy
    }
    expect(new Set(guide.picks.map((p) => p.slug)).size).toBe(guide.picks.length);
  }
  const slugs = teachers.picks.map((p) => p.slug);
  for (const slug of ['magicschool', 'brisk-teaching', 'eduaide', 'diffit', 'curipod']) expect(slugs).toContain(slug);
  expect(teachers.note).toMatch(/approved tools/);
});

test('answer block names the top picks and last reviewed is the newest valid date', () => {
  const list = entries();
  const answer = guideAnswer(teachers, list)!;
  expect(answer).toContain('MagicSchool');
  expect(answer).toContain('Brisk Teaching');
  expect(answer).toContain('Khanmigo');
  expect(answer).not.toContain('Grammarly');
  expect(answer).toContain('2 of the 4 picks list a free plan');
  expect(lastReviewedIso(list)).toBe('2026-10-26');
  expect(lastReviewedIso([])).toBeNull();
  expect(priceCheckRange(list)).toEqual({ oldest: '2026-10-20', newest: '2026-10-26' });
  expect(priceCheckRangeLabel(list)).toBe('Oct 20, 2026\u2013Oct 26, 2026');
  expect(guideAnswer(teachers, [])).toBeNull();
});

test('task table uses catalog prices and free-plan flags', () => {
  const rows = guideTaskRows(entries());
  expect(rows[0]).toMatchObject({ name: 'MagicSchool', freePlan: 'Yes', price: 'Free forever for teachers' });
  expect(rows.find((r) => r.slug === 'khanmigo')).toMatchObject({ freePlan: 'Not listed', price: 'See pricing page' });
  expect(rows.find((r) => r.slug === 'grammarly')).toMatchObject({ freePlan: 'No', price: 'Pro $12/mo' });
  expect(priceFrom('  ')).toBe('See pricing page');
  expect(freePlanLabel(true)).toBe('Yes');
});

test('FAQ has 3-5 entries that only restate stored facts, and valid FAQPage JSON-LD', () => {
  const faq = guideFaq(teachers, entries());
  expect(faq.length).toBeGreaterThanOrEqual(3);
  expect(faq.length).toBeLessThanOrEqual(5);
  const text = faq.map((f) => `${f.question} ${f.answer}`).join(' ');
  expect(text).toContain('Free forever for teachers; Plus $12.99/mo');
  expect(text).toContain('last checked between Oct 20, 2026 and Oct 26, 2026');
  expect(text).toContain('when we last checked');
  expect(text).toContain(GUIDE_DISCLOSURE);
  expect(text).not.toMatch(/never/i);
  expect(text).toMatch(/student names/);
  expect(text).not.toMatch(/we tested|users|rated|\d+(\.\d+)? stars|#1/i);

  const schema = generateFaqSchema(faq);
  const parsed = JSON.parse(safeJsonLd(schema));
  expect(parsed['@type']).toBe('FAQPage');
  expect(parsed.mainEntity).toHaveLength(faq.length);
  for (const q of parsed.mainEntity) {
    expect(q['@type']).toBe('Question');
    expect(q.acceptedAnswer['@type']).toBe('Answer');
    expect(q.acceptedAnswer.text.length).toBeGreaterThan(0);
  }
  expect(guideFaq(teachers, [])).toEqual([]);
});

test('guide page schema carries dateModified only when known', () => {
  const withDate = generateGuidePageSchema({ slug: teachers.slug, title: teachers.title, description: 'd', dateModified: '2026-10-26' });
  expect(withDate).toMatchObject({ '@type': 'CollectionPage', dateModified: '2026-10-26' });
  expect(withDate.url).toMatch(/\/guides\/best-ai-tools-for-teachers$/);
  const without = generateGuidePageSchema({ slug: teachers.slug, title: teachers.title, description: 'd', dateModified: null });
  expect('dateModified' in without).toBe(false);
});

test('llms.txt guides section lists the index and every guide', () => {
  const section = llmsGuidesSection(GUIDES, `${BASE}/`);
  expect(section.startsWith('## Guides')).toBe(true);
  expect(section).toContain(`${BASE}/guides\n`);
  for (const guide of GUIDES) {
    expect(section).toContain(`- ${guide.title}: ${BASE}/guides/${guide.slug} - ${guide.metaDescription}`);
  }
  const extra = llmsGuidesSection([...GUIDES, { ...GUIDES[0], slug: 'future-guide', title: 'Future guide' }], BASE);
  expect(extra).toContain(`- Future guide: ${BASE}/guides/future-guide`);
});

test('FAQ JSON-LD answer text equals the visible FAQ text', () => {
  const faq = guideFaq(teachers, entries());
  const parsed = JSON.parse(safeJsonLd(generateFaqSchema(faq.map((f) => ({ question: f.question, answer: faqAnswerSchemaText(f, BASE) })))));
  faq.forEach((item, i) => {
    expect(parsed.mainEntity[i].name).toBe(item.question);
    const stripped = parsed.mainEntity[i].acceptedAnswer.text.replace(/<[^>]+>/g, '');
    expect(stripped).toBe(faqAnswerText(item));
  });
  const how = parsed.mainEntity.find((q: { name: string }) => q.name === 'How did you choose these tools?');
  expect(how.acceptedAnswer.text).toContain(`<a href="${BASE}/disclosure">How we make money</a>`);
});

test('guide copy has no unverified claims flagged in legal review', () => {
  const copy = teachers.picks.map((p) => p.why).join(' ');
  expect(copy).not.toMatch(/small team of working teachers|ready to print|Weekly/);
});

test('visible guide FAQ matches FAQPage JSON-LD on the rendered page', async ({ page }) => {
  test.skip(!process.env.PLAYWRIGHT_BASE_URL, 'needs a running server');
  await page.goto('/guides/best-ai-tools-for-teachers');
  const visible = (await page.getByTestId('guide-faq').locator('[data-testid="guide-faq-answer"]').allTextContents()).map((t) => t.trim());
  const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
  const faqLd = blocks.map((b) => JSON.parse(b)).find((b) => b['@type'] === 'FAQPage');
  expect(faqLd.mainEntity.map((q: any) => q.acceptedAnswer.text.replace(/<[^>]+>/g, ''))).toEqual(visible);
});
