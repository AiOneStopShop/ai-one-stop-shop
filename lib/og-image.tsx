import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';

// Share-image renderer (Open Graph + Twitter/X cards). Mirrors the live site's
// "Everyday Guide" design: cream paper, deep-green Fraunces headings, orange
// swoosh, Source Sans body copy, and the green/orange ring logo mark.
export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = 'image/png';

const C = {
  cream: '#FBF4E6',
  cream2: '#F4EAD6',
  green: '#1E3B2C',
  ink: '#22201B',
  soft: '#5A5348',
  line: '#E2D6BF',
  orange: '#E2562B',
  orangeInk: '#B8360F',
  leaf: '#DCEBD9',
};

async function loadFonts() {
  const dir = join(process.cwd(), 'assets/fonts');
  const [fraunces, sans, sansBold] = await Promise.all([
    readFile(join(dir, 'Fraunces-SemiBold.ttf')),
    readFile(join(dir, 'SourceSans3-Regular.ttf')),
    readFile(join(dir, 'SourceSans3-SemiBold.ttf')),
  ]);
  return [
    { name: 'Fraunces', data: fraunces, weight: 600 as const, style: 'normal' as const },
    { name: 'Source Sans', data: sans, weight: 400 as const, style: 'normal' as const },
    { name: 'Source Sans', data: sansBold, weight: 600 as const, style: 'normal' as const },
  ];
}

function LogoMark({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40">
      <path d="M28.64 8.51A15 15 0 1 1 11.50 7.01" fill="none" stroke={C.green} strokeWidth="5.6" strokeLinecap="round" />
      <path d="M15.09 23.28A5.1 5.1 0 1 1 23.42 22.55" fill="none" stroke={C.orangeInk} strokeWidth="5.04" strokeLinecap="round" />
    </svg>
  );
}

export type OgCard = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
};

export async function renderOgImage({ eyebrow, title, subtitle }: OgCard) {
  const titleSize = title.length > 48 ? 64 : title.length > 32 ? 76 : 88;
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: C.cream,
          padding: '56px 72px',
          fontFamily: 'Source Sans',
          color: C.ink,
          position: 'relative',
        }}
      >
        {/* soft paper accents */}
        <div style={{ position: 'absolute', right: -120, top: -120, width: 420, height: 420, borderRadius: 9999, background: C.leaf, display: 'flex' }} />
        <div style={{ position: 'absolute', right: 70, bottom: -150, width: 300, height: 300, borderRadius: 9999, background: C.cream2, display: 'flex' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <LogoMark size={56} />
          <div style={{ fontFamily: 'Fraunces', fontSize: 36, color: C.green, display: 'flex' }}>AI One Stop Shop</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', maxWidth: 940 }}>
          {eyebrow ? (
            <div style={{ display: 'flex', marginBottom: 22 }}>
              <div
                style={{
                  display: 'flex',
                  fontSize: 24,
                  fontWeight: 600,
                  letterSpacing: 1.5,
                  textTransform: 'uppercase',
                  color: C.orangeInk,
                  background: '#FFFDF8',
                  border: `2px solid ${C.line}`,
                  borderRadius: 9999,
                  padding: '6px 20px',
                }}
              >
                {eyebrow}
              </div>
            </div>
          ) : null}
          <div style={{ fontFamily: 'Fraunces', fontSize: titleSize, lineHeight: 1.05, letterSpacing: -1.5, color: C.green, display: 'flex' }}>
            {title}
          </div>
          <svg width="280" height="28" viewBox="0 0 140 14" style={{ marginTop: 14 }}>
            <path d="M3 10c30-7 75-9 134-4" fill="none" stroke={C.orange} strokeWidth="4" strokeLinecap="round" />
          </svg>
          {subtitle ? (
            <div style={{ fontSize: 32, lineHeight: 1.3, color: C.soft, marginTop: 14, display: 'flex', maxWidth: 880 }}>{subtitle}</div>
          ) : null}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: `2px solid ${C.line}`, paddingTop: 22, fontSize: 26 }}>
          <div style={{ display: 'flex', fontWeight: 600, color: C.green }}>aionestop.shop</div>
          <div style={{ display: 'flex', color: C.soft }}>Honest picks. Real prices. By oneTomorrow.</div>
        </div>
      </div>
    ),
    { ...OG_SIZE, fonts: await loadFonts() }
  );
}
