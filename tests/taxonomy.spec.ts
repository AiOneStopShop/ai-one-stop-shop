import { test, expect } from '@playwright/test';
import { classifyTool, normalizeCategorySlug, TAXONOMY } from '../lib/taxonomy';

test('taxonomy has the 15 launch categories', () => {
  expect(TAXONOMY.map((category) => category.slug)).toEqual([
    'chat-assistants',
    'writing',
    'image',
    'video',
    'audio-voice',
    'music',
    'coding',
    'agents-automation',
    'research-notes',
    'email',
    'slides',
    'design',
    'marketing',
    'productivity',
    'local-open-source',
  ]);
});

test('old slugs alias to the new taxonomy', () => {
  expect(normalizeCategorySlug('content')).toBe('writing');
  expect(normalizeCategorySlug('ai-models')).toBe('local-open-source');
});

test('classification uses tags and names without inventing a single bucket', () => {
  expect(classifyTool({ name: 'ChatGPT Plus', tagline: 'Advanced AI assistant' }).primary).toBe('chat-assistants');
  expect(classifyTool({ name: 'Suno', tags: ['music', 'song-generation'] }).primary).toBe('music');
  expect(classifyTool({ name: 'Cherry Studio', tags: ['chat'] }).slugs).not.toContain('music');
  expect(classifyTool({ name: 'Runway', tags: ['video', 'text-to-video'] }).primary).toBe('video');
  expect(classifyTool({ name: 'GitHub Copilot', tagline: 'AI pair programmer' }).primary).toBe('coding');
  expect(classifyTool({ name: 'Ollama', tags: ['local-llm', 'chat'] }).primary).toBe('local-open-source');
  expect(classifyTool({ name: 'Shortwave', tags: ['email', 'gmail'] }).slugs).toContain('email');
  expect(classifyTool({ name: 'Grammarly', tagline: 'AI writing assistant' }).slugs).toEqual(
    expect.arrayContaining(['writing'])
  );
});
