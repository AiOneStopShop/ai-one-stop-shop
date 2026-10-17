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
        purple: '#6C39EF',
        'deep-purple': '#4A2D86',
        coral: '#FB6851',
        'coral-text': '#C62810',
        navy: '#171C26',
        canvas: '#F9F8F5',
        card: '#FDFDFC',
        slate: '#5B657B',
        border: '#E5E1DC',
      },
      fontFamily: {
        'dm-sans': ['var(--font-dm-sans)', 'sans-serif'],
        'inter': ['var(--font-inter)', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
