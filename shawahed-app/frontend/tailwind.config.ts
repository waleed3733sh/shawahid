import type { Config } from 'tailwindcss';
export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['Tajawal', 'sans-serif'], display: ['Cairo', 'sans-serif'] },
      colors: {
        forest: { 900: '#0b2e22', 800: '#0f3d2e', 700: '#15543f', 600: '#1c6b50' },
        gold: { 500: '#caa84a', 600: '#b8973f', 400: '#d8bd6e' },
        sand: '#f6f8f5', cream: '#fbfcfa',
      },
    },
  },
} satisfies Config;
