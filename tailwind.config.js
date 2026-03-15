/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./App.tsx",
    "./index.tsx",
    "./types.ts",
    "./components/**/*.{ts,tsx}",
    "./services/**/*.{ts,tsx}",
    "./styles/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sole: {
          bg: '#050507',
          surface: '#111118',
          border: '#1A1A2A',
          accent: '#7C5CFC',
          green: '#00C896',
          text: '#E8E8ED',
          muted: '#8888A0',
        },
      },
      fontFamily: {
        heading: ['DM Sans', 'sans-serif'],
        body: ['Figtree', 'sans-serif'],
      },
      animation: {
        'float': 'float-orb 20s ease-in-out infinite',
      },
      keyframes: {
        'float-orb': {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '33%': { transform: 'translate(30px, -30px) scale(1.05)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.95)' },
        },
      },
    },
  },
  plugins: [],
};
