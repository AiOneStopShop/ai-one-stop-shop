/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        cream: '#FBF4E6',
        'cream-2': '#F4EAD6',
        green: '#1E3B2C',
        'green-2': '#2E5A43',
        ink: '#22201B',
        soft: '#5A5348',
        line: '#E2D6BF',
        orange: '#E2562B',
        'orange-ink': '#B8360F',
        card: '#FFFDF8',
        leaf: { DEFAULT: '#DCEBD9', line: '#9FBFA6' },
        // Legacy colors for backward compat
        purple: '#6C39EF',
        'deep-purple': '#4A2D86',
        coral: '#FB6851',
        'coral-text': '#C62810',
        navy: '#171C26',
        canvas: '#F9F8F5',
        slate: '#5B657B',
        border: '#E5E1DC',
      },
      fontFamily: {
        'fraunces': ['var(--font-fraunces)', 'Georgia', 'serif'],
        'source-sans': ['var(--font-source-sans)', 'system-ui', 'sans-serif'],
        // Legacy fonts for backward compat
        'dm-sans': ['var(--font-dm-sans)', 'sans-serif'],
        'inter': ['var(--font-inter)', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
