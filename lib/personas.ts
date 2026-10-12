export type ToolkitSlot = {
  id: string;
  label: string;
  categorySlugs: string[];
  tags: string[];
};

export type PersonaGoal = {
  id: string;
  label: string;
  blurb: string;
  slot: ToolkitSlot;
};

export type Persona = {
  slug: string;
  name: string;
  title: string;
  whoFor: string;
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
    slot: { id: 'assistant', label: 'Chat assistant', categorySlugs: ['productivity', 'ai-models'], tags: ['chat', 'assistant', 'chatgpt', 'claude', 'gemini'] },
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
    slot: { id: 'writing', label: 'Writing', categorySlugs: ['content', 'marketing'], tags: ['writing', 'copy', 'grammar', 'content'] },
  },
  {
    id: 'design',
    label: 'Images and design',
    blurb: 'Create images, layouts, and visual drafts',
    slot: { id: 'design', label: 'Images and design', categorySlugs: ['design'], tags: ['image', 'art', 'design'] },
  },
  {
    id: 'notes',
    label: 'Notes and workspace',
    blurb: 'Keep notes, docs, and tasks in one place',
    slot: { id: 'notes', label: 'Notes and workspace', categorySlugs: ['productivity'], tags: ['notes', 'workspace', 'knowledge', 'notion'] },
  },
  {
    id: 'video',
    label: 'Video',
    blurb: 'Edit video, podcasts, and recordings',
    slot: { id: 'video', label: 'Video', categorySlugs: ['content'], tags: ['video', 'podcast', 'recording'] },
  },
  {
    id: 'audio',
    label: 'Voice and audio',
    blurb: 'Speech, voice, and transcription',
    slot: { id: 'audio', label: 'Voice and audio', categorySlugs: ['ai-models', 'content'], tags: ['voice', 'speech', 'audio', 'tts'] },
  },
];

export const PERSONAS: Persona[] = [
  {
    slug: 'sarah',
    name: 'Sarah',
    title: 'Builder shipping with AI',
    whoFor: 'Developers and technical operators who want current coding tools and a capable assistant in one stack.',
    jobs: [
      'Write and review code with an AI pair programmer',
      'Keep a general assistant for design and debugging questions',
      'Try models and APIs when a local tool is not enough',
      'Ship UI and full-stack drafts from a prompt',
    ],
    categorySlugs: ['coding', 'productivity', 'ai-models'],
    tags: ['code', 'coding', 'assistant', 'developer'],
    defaultBudget: 50,
    slotIds: ['coding', 'assistant', 'notes'],
    goalIds: ['coding', 'assistant', 'notes'],
  },
  {
    slug: 'fred',
    name: 'Fred',
    title: 'Freelancer with a simple creative stack',
    whoFor: 'Independent writers, designers, and makers who want easy tools for copy, images, and everyday work.',
    jobs: [
      'Draft and polish client copy',
      'Create images and layouts',
      'Keep notes and deliverables in one workspace',
      'Stay on a modest monthly budget',
    ],
    categorySlugs: ['content', 'design', 'productivity'],
    tags: ['writing', 'image', 'design', 'notes'],
    defaultBudget: 20,
    slotIds: ['writing', 'design', 'notes'],
    goalIds: ['writing', 'design', 'notes'],
  },
  {
    slug: 'claire',
    name: 'Claire',
    title: 'Team lead keeping writing and docs together',
    whoFor: 'Teams that want a shared assistant, clear writing, and a workspace everyone can use.',
    jobs: [
      'Write with a consistent voice',
      'Keep a shared knowledge base',
      'Analyze documents and long context',
      'Give the team one reliable assistant',
    ],
    categorySlugs: ['content', 'productivity'],
    tags: ['writing', 'assistant', 'knowledge', 'workspace'],
    defaultBudget: 50,
    slotIds: ['assistant', 'writing', 'notes'],
    goalIds: ['assistant', 'writing', 'notes'],
  },
  {
    slug: 'steve',
    name: 'Steve',
    title: 'Founder assembling a first stack',
    whoFor: 'Founders choosing a small set of tools they can grow with: build, write, and keep work in one place.',
    jobs: [
      'Ship a first product or landing page',
      'Write customer and launch copy',
      'Keep a workspace for notes and tasks',
      'Add voice or video only when needed',
    ],
    categorySlugs: ['coding', 'marketing', 'productivity'],
    tags: ['coding', 'copy', 'workspace'],
    defaultBudget: 50,
    slotIds: ['coding', 'writing', 'notes'],
    goalIds: ['coding', 'writing', 'notes'],
  },
];

const GOAL_BY_ID = new Map(TOOLKIT_GOALS.map((goal) => [goal.id, goal]));
const PERSONA_BY_SLUG = new Map(PERSONAS.map((persona) => [persona.slug, persona]));

export function getPersona(slug: string | null | undefined): Persona | null {
  if (!slug) return null;
  return PERSONA_BY_SLUG.get(slug) || null;
}

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
