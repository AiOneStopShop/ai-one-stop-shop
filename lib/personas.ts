export type ToolkitSlot = {
  id: string;
  label: string;
  categorySlugs: string[];
  tags: string[];
  /** Raise the bar above the default so a slot needs a tag match, not only a category match. */
  minScore?: number;
};

export type PersonaGoal = {
  id: string;
  label: string;
  blurb: string;
  slot: ToolkitSlot;
  /** Used by a persona's starter stack only; not offered as a checkbox on /budget. */
  personaOnly?: boolean;
};

export type Persona = {
  slug: string;
  name: string;
  title: string;
  /** Short label for who this is, in plain words. */
  audience: string;
  whoFor: string;
  /** One line in the persona's own voice: what they want and what they won't accept. */
  voice: string;
  jobs: string[];
  categorySlugs: string[];
  tags: string[];
  defaultBudget: number;
  slotIds: string[];
  goalIds: string[];
};

export const TOOLKIT_GOALS: PersonaGoal[] = [
  {
    id: 'assistant',
    label: 'Chat assistant',
    blurb: 'A general AI assistant for questions, drafts, and research',
    slot: { id: 'assistant', label: 'Chat assistant', categorySlugs: ['chat-assistants'], tags: ['chat', 'assistant', 'chatgpt', 'claude', 'gemini'] },
  },
  {
    id: 'coding',
    label: 'Coding',
    blurb: 'Write and review code with an AI pair programmer',
    slot: { id: 'coding', label: 'Coding', categorySlugs: ['coding'], tags: ['code', 'coding', 'developer', 'copilot'] },
  },
  {
    id: 'writing',
    label: 'Writing',
    blurb: 'Draft and edit copy, posts, and documents',
    slot: { id: 'writing', label: 'Writing', categorySlugs: ['writing', 'marketing'], tags: ['writing', 'copy', 'grammar', 'content'] },
  },
  {
    id: 'design',
    label: 'Images and design',
    blurb: 'Create images, layouts, and visual drafts',
    slot: { id: 'design', label: 'Images and design', categorySlugs: ['image', 'design'], tags: ['image', 'art', 'design'] },
  },
  {
    id: 'notes',
    label: 'Notes and workspace',
    blurb: 'Keep notes, docs, and tasks in one place',
    slot: { id: 'notes', label: 'Notes and workspace', categorySlugs: ['research-notes'], tags: ['notes', 'workspace', 'knowledge', 'notion'] },
  },
  {
    id: 'video',
    label: 'Video',
    blurb: 'Edit video, podcasts, and recordings',
    slot: { id: 'video', label: 'Video', categorySlugs: ['video'], tags: ['video', 'podcast', 'recording'] },
  },
  {
    id: 'audio',
    label: 'Voice and audio',
    blurb: 'Speech, voice, and transcription',
    slot: { id: 'audio', label: 'Voice and audio', categorySlugs: ['audio-voice', 'music'], tags: ['voice', 'speech', 'audio', 'tts'] },
  },
  {
    id: 'job-search',
    label: 'Job search organizer',
    blurb: 'Track applications, follow-ups, and interview dates',
    slot: { id: 'job-search', label: 'Job search organizer', categorySlugs: ['productivity'], tags: ['task manager', 'to-do', 'lists', 'everyday'], minScore: 17 },
    personaOnly: true,
  },
  {
    id: 'slides',
    label: 'Slides and proposals',
    blurb: 'Turn notes into a proposal or pitch deck',
    slot: { id: 'slides', label: 'Slides and proposals', categorySlugs: ['slides'], tags: ['presentation', 'slides', 'deck'] },
  },
  {
    id: 'inbox',
    label: 'Email inbox',
    blurb: 'Sort email and draft replies faster',
    slot: { id: 'inbox', label: 'Email inbox', categorySlugs: ['email'], tags: ['inbox', 'email client', 'reply', 'triage'], minScore: 17 },
  },
  {
    id: 'social',
    label: 'Social posts',
    blurb: 'Plan and schedule posts across your channels',
    slot: { id: 'social', label: 'Social posts', categorySlugs: ['marketing'], tags: ['social', 'scheduling', 'posts'] },
  },
  {
    id: 'newsletter',
    label: 'Customer email',
    blurb: 'Newsletters and offers for your customers',
    slot: { id: 'newsletter', label: 'Customer email', categorySlugs: ['email'], tags: ['newsletter', 'email marketing', 'campaign', 'mailchimp'], minScore: 17 },
  },
  {
    id: 'automation',
    label: 'Automations',
    blurb: 'Connect apps so routine steps run on their own',
    slot: { id: 'automation', label: 'Automations', categorySlugs: ['agents-automation'], tags: ['automation', 'automate', 'workflow', 'integrations'] },
  },
  {
    id: 'client-visuals',
    label: 'Client visuals',
    blurb: 'Mockups, brand graphics, and layouts for client work',
    slot: { id: 'client-visuals', label: 'Client visuals', categorySlugs: ['design'], tags: ['mockup', 'brand', 'graphics', 'templates', 'collaborative'], minScore: 17 },
    personaOnly: true,
  },
  {
    id: 'short-video',
    label: 'Short videos',
    blurb: 'Quick product and shop clips with captions for social media',
    slot: { id: 'short-video', label: 'Short videos', categorySlugs: ['video'], tags: ['short-form', 'short clips', 'captions', 'easy', 'social'], minScore: 17 },
    personaOnly: true,
  },
  {
    id: 'cv-writing',
    label: 'CV and cover letters',
    blurb: 'Clearer, error-free applications in your own words',
    slot: { id: 'cv-writing', label: 'CV and cover letters', categorySlugs: ['writing'], tags: ['grammar', 'clarity', 'correctness', 'rewriting', 'tone', 'editing'], minScore: 17 },
    personaOnly: true,
  },
  {
    id: 'interview-practice',
    label: 'Interview practice',
    blurb: 'A free chat assistant to rehearse answers with',
    slot: { id: 'interview-practice', label: 'Interview practice', categorySlugs: ['chat-assistants'], tags: ['free', 'voice', 'chat', 'assistant'], minScore: 17 },
    personaOnly: true,
  },
];

export const PERSONAS: Persona[] = [
  {
    slug: 'sarah',
    name: 'Sarah',
    title: 'Job seeker getting back to work',
    audience: 'Looking for work',
    whoFor: 'People applying for jobs or changing careers who want help with CVs, cover letters, and interview practice, mostly on free plans.',
    voice: 'I want my applications to sound like me on a good day, and I can’t spend much while I look.',
    jobs: [
      'Polish a CV and cover letter so they read clearly',
      'Practise interview answers out loud with a chat assistant',
      'Keep track of applications, follow-ups, and interview dates',
      'Stay on free plans, or close to it',
    ],
    categorySlugs: ['writing', 'chat-assistants', 'productivity'],
    tags: ['writing', 'grammar', 'assistant', 'tasks'],
    defaultBudget: 20,
    slotIds: ['cv-writing', 'interview-practice', 'job-search'],
    goalIds: ['cv-writing', 'interview-practice', 'job-search'],
  },
  {
    slug: 'fred',
    name: 'Fred',
    title: 'Freelancer winning and running client work',
    audience: 'Working for yourself',
    whoFor: 'Independent designers, photographers, and makers who need to look professional to clients: visuals, proposals, and a tidy inbox.',
    voice: 'Clients judge me on the first proposal and how fast I reply. I want both to look sharp without hiring help.',
    jobs: [
      'Make visuals and mockups for client work',
      'Turn a rough idea into a proposal or pitch deck',
      'Sort client email and draft replies faster',
      'Keep tools to a modest monthly budget',
    ],
    categorySlugs: ['design', 'slides', 'email'],
    tags: ['design', 'presentation', 'inbox'],
    defaultBudget: 30,
    slotIds: ['client-visuals', 'slides', 'inbox'],
    goalIds: ['client-visuals', 'slides', 'inbox'],
  },
  {
    slug: 'claire',
    name: 'Claire',
    title: 'Small business owner bringing in customers',
    audience: 'Running a small business',
    whoFor: 'Shop, café, and local service owners who want to stay visible: regular social posts, a customer email, and short videos.',
    voice: 'I run the shop all day. Marketing has to fit into an hour a week and still bring people through the door.',
    jobs: [
      'Plan and schedule a week of social posts in one sitting',
      'Send a simple newsletter or offer to regular customers',
      'Cut short videos of products or the shop for social media',
      'Start on free plans and upgrade only when one pays for itself',
    ],
    categorySlugs: ['marketing', 'email', 'video'],
    tags: ['social', 'newsletter', 'video'],
    defaultBudget: 0,
    slotIds: ['social', 'newsletter', 'short-video'],
    goalIds: ['social', 'newsletter', 'short-video'],
  },
  {
    slug: 'steve',
    name: 'Steve',
    title: 'Builder shipping a first product',
    audience: 'Building something',
    whoFor: 'Founders and hobby builders who write code and want an AI pair programmer, automations between apps, and one place for notes.',
    voice: 'I’m happy to read code and fix it myself. I want help that speeds me up, not a black box that ships for me.',
    jobs: [
      'Write and review code with an AI pair programmer',
      'Connect apps so routine steps run on their own',
      'Keep specs, decisions, and to-dos in one workspace',
      'Start free and pay only once something is working',
    ],
    categorySlugs: ['coding', 'agents-automation', 'research-notes'],
    tags: ['code', 'automation', 'notes'],
    defaultBudget: 50,
    slotIds: ['coding', 'automation', 'notes'],
    goalIds: ['coding', 'automation', 'notes'],
  },
];

const GOAL_BY_ID = new Map(TOOLKIT_GOALS.map((goal) => [goal.id, goal]));
const PERSONA_BY_SLUG = new Map(PERSONAS.map((persona) => [persona.slug, persona]));

export function getPersona(slug: string | null | undefined): Persona | null {
  if (!slug) return null;
  return PERSONA_BY_SLUG.get(slug) || null;
}

export const BUDGET_FORM_GOALS = TOOLKIT_GOALS.filter((goal) => !goal.personaOnly);

export function getGoal(id: string | null | undefined): PersonaGoal | null {
  if (!id) return null;
  return GOAL_BY_ID.get(id) || null;
}

export function slotsForSelection(personaSlug: string | null, goalIds: string[], mustHaveIds: string[]): ToolkitSlot[] {
  const slots = new Map<string, ToolkitSlot>();
  const persona = getPersona(personaSlug);
  const requested = [...(persona?.slotIds || []), ...goalIds, ...mustHaveIds];
  if (requested.length === 0) {
    requested.push('assistant', 'writing', 'notes');
  }
  for (const id of requested) {
    const goal = getGoal(id);
    if (goal) slots.set(goal.slot.id, goal.slot);
  }
  return Array.from(slots.values());
}
