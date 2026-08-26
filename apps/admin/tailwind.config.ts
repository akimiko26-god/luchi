import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        sun: '#FFD93D',
        sky: '#4ECDC4',
        growth: '#6BCB77',
        'rays-gold': '#FFB800',
        error: '#FF6B6B',
        gray: {
          50: '#FAFAFA',
          100: '#F5F5F5',
          900: '#1A1A2E',
        },
      },
    },
  },
  plugins: [],
};

export default config;
