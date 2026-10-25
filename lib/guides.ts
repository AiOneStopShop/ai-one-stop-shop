/**
 * Audience guides ("best AI tools for <audience>").
 *
 * Picks and reasons are editorial; prices are NOT hardcoded here. Each guide page
 * reads pricing_summary and last_verified_at live from the catalog, and a pick
 * that is no longer published is simply left out. Reasons describe what a tool
 * does, never its price, so they stay true when prices change.
 */
export type GuidePick = { slug: string; why: string };
export type Guide = {
  slug: string;
  audience: string;
  title: string;
  question: string;
  metaDescription: string;
  problem: string[];
  picks: GuidePick[];
  related: { href: string; label: string }[];
};

export const GUIDES: Guide[] = [
  {
    slug: 'best-ai-tools-for-teachers',
    audience: 'Teachers',
    title: 'Best AI tools for teachers',
    question: 'Which AI tools actually save teachers time?',
    metaDescription:
      'AI tools that help teachers plan lessons, run interactive classes and give feedback, with real prices from each tool\u2019s pricing page.',
    problem: [
      'Planning, grading, parent emails and slides eat the hours you wanted for students. Teachers keep asking the same thing: which AI tools are worth the setup, and which ones are free for teachers?',
      'We are oneTomorrow. These picks are from our catalog, each with the price listed on its own pricing page, so you can try the free ones first.',
    ],
    picks: [
      { slug: 'khanmigo', why: 'Built by Khan Academy for classrooms. It helps draft lesson plans, rubrics and exit tickets, and its pricing page lists it as free for teachers.' },
      { slug: 'gemini-notebook', why: 'Upload your own readings or notes and ask questions grounded in them, or turn them into study guides for your class.' },
      { slug: 'google-gemini', why: 'A general helper for drafting parent emails, explaining a topic three ways, or brainstorming activities. Many schools already use Google accounts.' },
      { slug: 'ahaslides', why: 'Live polls, quizzes and word clouds that students answer from their phones, with education plans listed.' },
      { slug: 'mentimeter', why: 'Another strong option for live questions and quizzes during class, with a free plan to start.' },
      { slug: 'canva-ai', why: 'Worksheets, posters and slides from templates, with AI help for the text and images.' },
      { slug: 'napkin-ai', why: 'Turns a paragraph of text into a clear diagram or visual you can drop into slides.' },
      { slug: 'grammarly', why: 'Polishes newsletters, announcements and feedback comments before they go out.' },
    ],
    related: [
      { href: '/category/slides', label: 'All slide and presentation tools' },
      { href: '/budget', label: 'Plan a monthly budget' },
    ],
  },
  {
    slug: 'best-ai-tools-for-small-business',
    audience: 'Small business',
    title: 'Best AI tools for small business',
    question: 'What AI tools should a small business start with?',
    metaDescription:
      'A starter set of AI tools for small business owners: writing, design, email marketing, social posts and meeting notes, with real prices.',
    problem: [
      'When you run a small business, you are also the marketer, the designer and the note-taker. The common question is where to start without signing up for ten subscriptions.',
      'We are oneTomorrow. Here is a short starter set from our catalog. Most have a free plan, so you can see what helps before you pay.',
    ],
    picks: [
      { slug: 'chatgpt-plus', why: 'One general helper for drafting emails, product descriptions, FAQs and first-pass plans.' },
      { slug: 'canva-ai', why: 'Social posts, flyers and simple brand graphics from templates, with AI help for text and images.' },
      { slug: 'adobe-express', why: 'A free-to-start alternative for quick graphics and short videos, with generative credits on paid plans.' },
      { slug: 'brevo', why: 'Email marketing and newsletters with a free plan, so you can start an email list early.' },
      { slug: 'buffer', why: 'Schedule social posts ahead of time; the free plan covers a few channels.' },
      { slug: 'hubspot-campaign-assistant', why: 'Drafts campaign copy like ads and emails, and is listed as free to use.' },
      { slug: 'fathom', why: 'Records and summarizes calls, so you can listen to the customer instead of taking notes.' },
      { slug: 'reclaim-ai', why: 'Protects time on your calendar for focused work around meetings.' },
    ],
    related: [
      { href: '/personas/claire', label: 'Starter toolkit for small business owners' },
      { href: '/category/marketing', label: 'All marketing tools' },
    ],
  },
  {
    slug: 'best-ai-tools-for-writers',
    audience: 'Writers',
    title: 'Best AI tools for writers',
    question: 'Which AI writing tools help without taking over your voice?',
    metaDescription:
      'AI tools for writers: editing, rewriting, drafting and fiction help, with real prices from each tool\u2019s pricing page.',
    problem: [
      'Writers want help with the hard parts, like editing, getting unstuck and tightening a draft, while keeping the words their own.',
      'We are oneTomorrow. These picks are grouped from editing help to drafting help, each with its listed price.',
    ],
    picks: [
      { slug: 'grammarly', why: 'Catches grammar, clarity and tone issues as you type, in most apps you already write in.' },
      { slug: 'prowritingaid', why: 'Deeper style reports, like pacing, repetition and sentence variety, which long-form writers often want.' },
      { slug: 'wordtune', why: 'Offers several rewrites of a sentence so you can pick the one that sounds like you.' },
      { slug: 'outwrite', why: 'A lighter editor with a free plan for grammar and rephrasing.' },
      { slug: 'claude-pro', why: 'A general helper that is good at feedback on long drafts and talking through structure.' },
      { slug: 'sudowrite', why: 'Built for fiction: brainstorming, describing scenes and continuing a draft in your style.' },
      { slug: 'novelcrafter', why: 'Plans and organizes a novel, like characters, outlines and a story bible, with optional AI help.' },
    ],
    related: [
      { href: '/category/writing', label: 'All writing tools' },
      { href: '/compare', label: 'Compare two writing tools' },
    ],
  },
  {
    slug: 'best-ai-tools-for-students',
    audience: 'Students',
    title: 'Best AI tools for students',
    question: 'Which AI tools help students learn, not just finish homework?',
    metaDescription:
      'AI tools that help students study, research with sources and write better, many with free plans. Real prices listed.',
    problem: [
      'Students ask which AI tools are allowed, which are free, and which actually help them understand the material. Always check your school\u2019s rules first.',
      'We are oneTomorrow. These picks focus on learning: studying your own notes, finding real sources and improving your own writing.',
    ],
    picks: [
      { slug: 'gemini-notebook', why: 'Upload class notes or readings and get summaries, study guides and answers grounded in those sources.' },
      { slug: 'khanmigo', why: 'A tutor from Khan Academy that guides you to the answer instead of just giving it.' },
      { slug: 'perplexity', why: 'Answers with links to its sources, so you can check them and cite the originals.' },
      { slug: 'consensus', why: 'Searches research papers and shows what studies found, useful for essays and lab reports.' },
      { slug: 'google-gemini', why: 'Explains hard topics step by step and makes practice questions, with a free plan.' },
      { slug: 'otter-ai', why: 'Transcribes lectures so you can search and review them later (ask permission to record).' },
      { slug: 'paperpal', why: 'Academic writing feedback on grammar and clarity, with a free plan.' },
      { slug: 'jenni-ai', why: 'Helps outline and cite research writing, with a free plan to try.' },
    ],
    related: [
      { href: '/guides/free-ai-tools', label: 'Free AI tools' },
      { href: '/category/research-notes', label: 'All research and notes tools' },
    ],
  },
  {
    slug: 'ai-tools-under-20-a-month',
    audience: '$20 a month or less',
    title: 'AI tools for $20 a month or less',
    question: 'Which AI tools are worth paying for on a $20 budget?',
    metaDescription:
      'Paid AI tools with a plan at $20 a month or less, with the real prices from each tool\u2019s pricing page, plus a budget planner.',
    problem: [
      'Most people asking about AI tools have one question: if I pay for one thing, what should it be? Usually the budget is about $20 a month.',
      'We are oneTomorrow. Every pick below has a plan at $20 a month or less on its pricing page. Prices change, so each one shows what we last checked. Want to mix several? Use the budget planner.',
    ],
    picks: [
      { slug: 'chatgpt-plus', why: 'One general helper for writing, questions, images and more. Good if you only pay for one tool.' },
      { slug: 'claude-pro', why: 'A general helper many people prefer for long documents, writing feedback and careful reasoning.' },
      { slug: 'google-gemini', why: 'Paid tiers add more use of Google\u2019s models and work inside Google apps; a lower-cost tier is listed too.' },
      { slug: 'perplexity', why: 'Research with sources. The paid plan adds more in-depth searches.' },
      { slug: 'canva-ai', why: 'Design for social posts, slides and flyers, with AI help built in.' },
      { slug: 'notion-ai', why: 'AI inside your notes and docs: summaries, drafts and answers from your own workspace.' },
      { slug: 'grammarly', why: 'Better writing everywhere you type, from emails to reports.' },
      { slug: 'otter-ai', why: 'Meeting and lecture transcripts with summaries; the yearly plan is much cheaper per month.' },
    ],
    related: [
      { href: '/budget', label: 'Build a stack to your budget' },
      { href: '/pricing', label: 'How we show pricing' },
    ],
  },
  {
    slug: 'free-ai-tools',
    audience: 'Free',
    title: 'Free AI tools that are actually useful',
    question: 'Which AI tools can you use for free, without a trial that runs out?',
    metaDescription:
      'AI tools you can use for $0: free chat assistants, note tools, meeting notes and open-source apps. Limits noted, real pricing listed.',
    problem: [
      'Plenty of "free" AI tools are really a short trial. People want to know what they can keep using at $0.',
      'We are oneTomorrow. Each pick below has a free plan or is free to use, according to its pricing page. Free plans usually have limits, which we note where we know them.',
    ],
    picks: [
      { slug: 'google-gemini', why: 'A capable general helper on the free plan, for questions, writing and planning.' },
      { slug: 'gemini-notebook', why: 'Free to use: ask questions about your own documents and get answers grounded in them.' },
      { slug: 'microsoft-copilot', why: 'Free chat and image help from Microsoft, built into Windows and Edge.' },
      { slug: 'duck-ai', why: 'Private AI chat from DuckDuckGo, free and without an account.' },
      { slug: 'huggingchat', why: 'Free chat with open models from Hugging Face, with fair-use limits.' },
      { slug: 'fathom', why: 'A free plan with unlimited call recordings and transcripts.' },
      { slug: 'hubspot-campaign-assistant', why: 'Free help drafting marketing copy for ads, emails and landing pages.' },
      { slug: 'ollama', why: 'Free and open source: run AI models on your own computer. Your hardware does the work.' },
      { slug: 'jan', why: 'A free, open-source desktop chat app that can run models offline.' },
    ],
    related: [
      { href: '/tools?free=1', label: 'Browse every tool with a free plan' },
      { href: '/guides/ai-tools-under-20-a-month', label: 'AI tools for $20 a month or less' },
    ],
  },
];

export const BANNED_SLUG_PATTERN = /(monica|musicgpt|chatllm)/i;

export function getGuide(slug: string): Guide | undefined {
  return GUIDES.find((guide) => guide.slug === slug);
}
