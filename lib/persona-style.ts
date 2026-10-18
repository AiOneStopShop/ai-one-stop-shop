import type { AccentName } from '@/components/DeskAccents';

/** Visual identity per persona on the Everyday Guide pages: a desk accent and a soft card tint. */
export const PERSONA_STYLE: Record<string, { accent: AccentName; tint: string }> = {
  sarah: { accent: 'notebook', tint: '#DCEBD9' },
  fred: { accent: 'lamp', tint: '#F6E3B4' },
  claire: { accent: 'jar', tint: '#F8D9CC' },
  steve: { accent: 'mug', tint: '#D9E4EC' },
};

export function personaStyle(slug: string) {
  return PERSONA_STYLE[slug] || { accent: 'plant' as AccentName, tint: '#F4EAD6' };
}
