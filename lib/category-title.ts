// Natural, search-friendly headings for category pages.
// "Best Voice dictation AI Tools" read awkwardly; these read like a person wrote them.
const CATEGORY_TITLES: Record<string, string> = {
  'chat-assistants': 'Best AI chat assistants',
  writing: 'Best AI writing tools',
  image: 'Best AI image generators and editors',
  video: 'Best AI video tools',
  'audio-voice': 'Best AI audio and voice tools',
  music: 'Best AI music tools',
  coding: 'Best AI coding tools',
  'agents-automation': 'Best AI agents and automation tools',
  'research-notes': 'Best AI research and note-taking tools',
  email: 'Best AI email tools',
  slides: 'Best AI slide and presentation makers',
  design: 'Best AI design tools',
  marketing: 'Best AI marketing tools',
  productivity: 'Best AI productivity tools',
  'local-open-source': 'Best local and open-source AI tools',
  skills: 'Best AI skill packs and MCP integrations',
  'study-learning': 'Best AI study and learning tools',
  'voice-dictation': 'Best AI voice dictation tools',
  'meeting-notetakers': 'Best AI meeting notetakers',
};

export function categoryTitle(category: { slug: string; name: string }): string {
  return CATEGORY_TITLES[category.slug] || `Best AI tools for ${category.name.toLowerCase()}`;
}
