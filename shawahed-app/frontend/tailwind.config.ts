import type { Config } from 'tailwindcss';
export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['Tajawal', 'sans-serif'], display: ['Cairo', 'sans-serif'] },
      colors: {
        // الهوية الزرقاء الاحترافية — مستوحاة من الشعار الجديد
        royal: { 900:'#0a2a4a', 800:'#0f3a63', 700:'#15497d', 600:'#1d5fa0', 500:'#2978c8', 400:'#5a9bde' },
        gold:  { 600:'#b8902f', 500:'#d4a437', 400:'#e6c468' },
        ink:   '#0a1929',
        mist:  '#f4f7fb',
        cloud: '#eaf1f8',
        // أبقينا forest كمرجع خلفي لكن نستخدم royal
        forest:{ 900:'#0a2a4a', 800:'#0f3a63', 700:'#15497d', 600:'#1d5fa0' },
        sand:  '#f4f7fb', cream:'#fbfcfe',
      },
      boxShadow: {
        'soft': '0 2px 20px -4px rgba(15,58,99,0.12)',
        'glow': '0 8px 40px -8px rgba(41,120,200,0.35)',
      },
    },
  },
} satisfies Config;
