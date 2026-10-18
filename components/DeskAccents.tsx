/**
 * Small "cozy desk" illustrations for page intros (Everyday Guide).
 * Decorative only: always aria-hidden. Palette matches DeskIllustration.
 */
export type AccentName = 'plant' | 'mug' | 'notebook' | 'lamp' | 'envelope' | 'books' | 'magnifier' | 'scales' | 'jar' | 'key';

const common = { viewBox: '0 0 220 180', 'aria-hidden': true as const, focusable: 'false' as const };

function Shadow() {
  return <ellipse cx="110" cy="166" rx="84" ry="9" fill="#E6D5B5" />;
}

export function DeskAccent({ name, className = '' }: { name: AccentName; className?: string }) {
  switch (name) {
    case 'plant':
      return (
        <svg {...common} className={className}>
          <Shadow />
          <path d="M108 104c-4-34-30-52-62-50 3 30 26 50 62 50Z" fill="#4E8452" />
          <path d="M112 100c-2-42 20-72 54-82 4 36-16 68-54 82Z" fill="#3F7347" />
          <path d="M114 106c18-28 46-40 76-32-10 30-40 42-76 32Z" fill="#5E8F5C" />
          <path d="M110 30c-8 24-8 50 0 74" fill="none" stroke="#24442D" strokeWidth="2" opacity=".5" />
          <path d="M76 104h68l-8 58H84Z" fill="#C9603F" />
          <rect x="70" y="98" width="80" height="14" rx="4" fill="#D9472B" />
        </svg>
      );
    case 'mug':
      return (
        <svg {...common} className={className}>
          <Shadow />
          <path d="M92 42c-8 10 8 16 0 28M112 36c-8 12 8 18 0 32M132 42c-8 10 8 16 0 28" fill="none" stroke="#C9C1B1" strokeWidth="4" strokeLinecap="round" />
          <rect x="66" y="78" width="96" height="84" rx="14" fill="#D9472B" />
          <path d="M162 98h10a18 18 0 0 1 0 36h-10" fill="none" stroke="#D9472B" strokeWidth="10" />
          <rect x="66" y="78" width="96" height="14" rx="7" fill="#B8360F" />
          <path d="M92 124c8 10 28 10 36 0" fill="none" stroke="#FBF4E6" strokeWidth="4" strokeLinecap="round" />
        </svg>
      );
    case 'notebook':
      return (
        <svg {...common} className={className}>
          <Shadow />
          <g transform="rotate(-6 110 96)">
            <rect x="46" y="22" width="132" height="140" rx="8" fill="#FFFDF8" stroke="#C9C1B1" strokeWidth="2" />
            <g fill="none" stroke="#9C9384" strokeWidth="2">
              <circle cx="58" cy="44" r="4" /><circle cx="58" cy="72" r="4" /><circle cx="58" cy="100" r="4" /><circle cx="58" cy="128" r="4" />
            </g>
            <path d="M78 52l6 6 12-12M78 84l6 6 12-12M78 116l6 6 12-12" fill="none" stroke="#2E5A43" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M106 52h56M106 84h48M106 116h52" stroke="#C9C1B1" strokeWidth="5" strokeLinecap="round" />
          </g>
          <g transform="rotate(-40 170 130)"><rect x="128" y="124" width="84" height="10" rx="5" fill="#1E3B2C" /><path d="M212 124l12 5-12 5Z" fill="#B9A98E" /></g>
        </svg>
      );
    case 'lamp':
      return (
        <svg {...common} className={className}>
          <Shadow />
          <path d="M70 150h70" stroke="#1E3B2C" strokeWidth="10" strokeLinecap="round" />
          <path d="M104 150l-14-56 44-34" fill="none" stroke="#2E5A43" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M120 40l52 24-22 30-48-30Z" fill="#E2562B" />
          <path d="M150 94c14 12 30 22 48 26" fill="none" stroke="#F4E4C8" strokeWidth="14" strokeLinecap="round" opacity=".9" />
          <circle cx="134" cy="60" r="6" fill="#B8360F" />
        </svg>
      );
    case 'envelope':
      return (
        <svg {...common} className={className}>
          <Shadow />
          <g transform="rotate(-5 110 100)">
            <rect x="36" y="48" width="148" height="104" rx="10" fill="#FFFDF8" stroke="#C9C1B1" strokeWidth="2" />
            <path d="M40 54l70 52 70-52" fill="none" stroke="#C9C1B1" strokeWidth="3" strokeLinejoin="round" />
            <rect x="140" y="62" width="30" height="24" rx="3" fill="#2E5A43" />
            <path d="M146 70h18M146 77h12" stroke="#DCEBD9" strokeWidth="3" strokeLinecap="round" />
          </g>
          <path d="M176 36c8-14 26-14 30 0" fill="none" stroke="#E2562B" strokeWidth="4" strokeLinecap="round" />
        </svg>
      );
    case 'books':
      return (
        <svg {...common} className={className}>
          <Shadow />
          <rect x="44" y="126" width="140" height="30" rx="4" fill="#2E5A43" />
          <rect x="54" y="98" width="124" height="28" rx="4" fill="#E9DCC7" />
          <rect x="40" y="70" width="132" height="28" rx="4" fill="#89A8BD" />
          <rect x="44" y="126" width="12" height="30" fill="#24442D" />
          <rect x="54" y="98" width="12" height="28" fill="#D3C2A6" />
          <rect x="40" y="70" width="12" height="28" fill="#6F8FA6" />
          <path d="M150 70V40l10 8 10-8v30" fill="#E2562B" />
        </svg>
      );
    case 'magnifier':
      return (
        <svg {...common} className={className}>
          <Shadow />
          <g transform="rotate(4 100 96)">
            <rect x="40" y="30" width="116" height="134" rx="6" fill="#FFFDF8" stroke="#C9C1B1" strokeWidth="2" />
            <path d="M58 56h80M58 76h64M58 96h72M58 116h52" stroke="#E2D6BF" strokeWidth="6" strokeLinecap="round" />
          </g>
          <circle cx="132" cy="96" r="30" fill="#DCEBD9" fillOpacity=".6" stroke="#1E3B2C" strokeWidth="9" />
          <path d="M154 118l30 30" stroke="#1E3B2C" strokeWidth="12" strokeLinecap="round" />
        </svg>
      );
    case 'scales':
      return (
        <svg {...common} className={className}>
          <Shadow />
          <path d="M110 40v112M78 156h64" stroke="#1E3B2C" strokeWidth="8" strokeLinecap="round" />
          <path d="M50 58h120" stroke="#2E5A43" strokeWidth="6" strokeLinecap="round" />
          <path d="M50 58l-22 46h44ZM170 58l-22 46h44Z" fill="none" stroke="#2E5A43" strokeWidth="3" strokeLinejoin="round" />
          <path d="M26 104a24 12 0 0 0 48 0ZM146 104a24 12 0 0 0 48 0Z" fill="#E2562B" />
          <circle cx="110" cy="38" r="8" fill="#E2562B" />
        </svg>
      );
    case 'jar':
      return (
        <svg {...common} className={className}>
          <Shadow />
          <rect x="70" y="34" width="80" height="16" rx="5" fill="#2E5A43" />
          <path d="M66 54h88v92a14 14 0 0 1-14 14H80a14 14 0 0 1-14-14Z" fill="#DCEBD9" fillOpacity=".7" stroke="#9FBFA6" strokeWidth="3" />
          <g fill="#E7C9A0" stroke="#C59C6B" strokeWidth="2">
            <ellipse cx="92" cy="146" rx="16" ry="6" /><ellipse cx="128" cy="146" rx="16" ry="6" />
            <ellipse cx="110" cy="136" rx="16" ry="6" /><ellipse cx="94" cy="126" rx="16" ry="6" /><ellipse cx="126" cy="122" rx="16" ry="6" />
          </g>
          <rect x="84" y="78" width="52" height="24" rx="4" fill="#FFFDF8" />
          <path d="M94 90h32" stroke="#B8360F" strokeWidth="4" strokeLinecap="round" />
        </svg>
      );
    case 'key':
      return (
        <svg {...common} className={className}>
          <Shadow />
          <circle cx="76" cy="92" r="30" fill="none" stroke="#C59C6B" strokeWidth="12" />
          <path d="M104 92h80M160 92v22M178 92v16" stroke="#C59C6B" strokeWidth="12" strokeLinecap="round" />
          <path d="M60 44c10-10 28-12 40-4" fill="none" stroke="#2E5A43" strokeWidth="4" strokeLinecap="round" />
        </svg>
      );
  }
}
