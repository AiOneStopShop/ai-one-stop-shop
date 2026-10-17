export default function DeskIllustration() {
  return (
    <svg 
      className="w-full h-auto" 
      viewBox="0 0 560 440" 
      role="img" 
      aria-label="A cozy desk with a plant, a red mug of coffee, books labeled Ideas, Plans and Progress, and an open notebook with today's to-do list"
    >
      <defs>
        <linearGradient id="wood" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#E7C9A0"/>
          <stop offset="1" stopColor="#D4AE7E"/>
        </linearGradient>
        <linearGradient id="leaf" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#5E8F5C"/>
          <stop offset="1" stopColor="#2F5A3A"/>
        </linearGradient>
      </defs>
      
      <ellipse cx="300" cy="250" rx="260" ry="180" fill="#F4E4C8"/>
      <path d="M20 330 Q280 250 548 300 L548 440 L20 440Z" fill="url(#wood)"/>
      <path d="M20 330 Q280 250 548 300" fill="none" stroke="#C59C6B" strokeWidth="2"/>
      
      {/* plant */}
      <g>
        <path d="M262 168c-6-46-42-72-86-70 4 42 36 70 86 70Z" fill="url(#leaf)"/>
        <path d="M268 162c-2-56 26-98 74-112 6 50-22 92-74 112Z" fill="#3F7347"/>
        <path d="M274 170c22-40 64-58 108-48-14 42-56 62-108 48Z" fill="url(#leaf)"/>
        <path d="M258 176c-40-14-80-2-102 26 36 18 78 10 102-26Z" fill="#4E8452"/>
        <path d="M276 174c38-6 72 12 86 44-38 8-72-8-86-44Z" fill="#3A6B44"/>
        <path d="M268 70c-14 30-16 70-2 108M262 168c-26-20-52-38-80-62M276 170c28-22 60-36 98-44" fill="none" stroke="#24442D" strokeWidth="2" opacity=".5"/>
        <path d="M226 176h88l-10 74a12 12 0 0 1-12 10h-44a12 12 0 0 1-12-10Z" fill="#E9DCC7"/>
        <path d="M222 170h96v14h-96z" fill="#D9C8AE"/>
      </g>
      
      {/* mug */}
      <g>
        <path d="M86 214h78v70a18 18 0 0 1-18 18h-42a18 18 0 0 1-18-18Z" fill="#D9472B"/>
        <path d="M164 230c26 0 26 44 0 44" fill="none" stroke="#D9472B" strokeWidth="10"/>
        <ellipse cx="125" cy="214" rx="39" ry="8" fill="#6B3A22"/>
        <path d="M104 196c-8-10 8-16 0-28M126 192c-8-10 8-16 0-28" fill="none" stroke="#C9B49A" strokeWidth="3" strokeLinecap="round"/>
        <path d="M94 226v52" stroke="#F08A70" strokeWidth="5" strokeLinecap="round" opacity=".6"/>
      </g>
      
      {/* books */}
      <g fontFamily="Source Sans 3, sans-serif" fontSize="14" fontWeight="600" fill="#22201B">
        <g transform="rotate(-8 450 170)">
          <rect x="372" y="128" width="150" height="34" rx="4" fill="#A9C4D6"/>
          <rect x="372" y="128" width="12" height="34" fill="#89A8BD"/>
          <text x="398" y="151">Ideas</text>
        </g>
        <g transform="rotate(-4 450 200)">
          <rect x="366" y="162" width="160" height="34" rx="4" fill="#E9DCC7"/>
          <rect x="366" y="162" width="12" height="34" fill="#D3C2A6"/>
          <text x="392" y="185">Plans</text>
        </g>
        <rect x="360" y="198" width="168" height="36" rx="4" fill="#8FB0C4"/>
        <rect x="360" y="198" width="12" height="36" fill="#6F93A9"/>
        <text x="386" y="222">Progress</text>
      </g>
      
      {/* job application paper */}
      <g transform="rotate(-6 150 340)">
        <rect x="70" y="300" width="160" height="110" rx="4" fill="#fff" stroke="#D9CDB6"/>
        <text x="86" y="326" fontFamily="Source Sans 3, sans-serif" fontSize="14" fontWeight="700" fill="#22201B">Job application</text>
        <path d="M86 344h120M86 360h120M86 376h90M86 392h104" stroke="#C9C1B1" strokeWidth="3" strokeLinecap="round"/>
      </g>
      
      {/* notebook */}
      <g transform="rotate(8 360 330)">
        <rect x="250" y="248" width="210" height="170" rx="8" fill="#FFFDF6" stroke="#D9CDB6" strokeWidth="1.5"/>
        <path d="M262 248v170" stroke="#E7B4A5" strokeWidth="1.5"/>
        <g stroke="#9C9384" strokeWidth="2">
          <circle cx="252" cy="268" r="4" fill="none"/>
          <circle cx="252" cy="292" r="4" fill="none"/>
          <circle cx="252" cy="316" r="4" fill="none"/>
          <circle cx="252" cy="340" r="4" fill="none"/>
          <circle cx="252" cy="364" r="4" fill="none"/>
          <circle cx="252" cy="388" r="4" fill="none"/>
        </g>
        <g fontFamily="Fraunces, Georgia, serif" fontSize="17" fill="#1E3B2C" fontStyle="italic">
          <text x="280" y="280" fontWeight="700">Today:</text>
          <text x="280" y="306">✓ Look for jobs</text>
          <text x="280" y="332">✓ Plan business</text>
          <text x="280" y="358">✓ Organize home</text>
          <text x="280" y="384">✓ Try an AI tool</text>
        </g>
      </g>
      
      {/* pen */}
      <g transform="rotate(-38 470 360)">
        <rect x="410" y="352" width="120" height="12" rx="6" fill="#1E3B2C"/>
        <path d="M530 352l16 6-16 6Z" fill="#B9A98E"/>
        <rect x="420" y="352" width="10" height="12" fill="#2E5A43"/>
      </g>
      
      {/* sticky note */}
      <g transform="rotate(7 470 330)">
        <rect x="430" y="270" width="104" height="96" fill="#F7D774"/>
        <path d="M430 270h104v10h-104z" fill="#EFC955"/>
        <g fontFamily="Fraunces, Georgia, serif" fontSize="17" fontStyle="italic" fill="#22201B">
          <text x="444" y="308">A brighter</text>
          <text x="444" y="332">tomorrow</text>
        </g>
        <path d="M444 344c18-6 46-6 70 0" fill="none" stroke="#E2562B" strokeWidth="2.5" strokeLinecap="round"/>
      </g>
    </svg>
  )
}
