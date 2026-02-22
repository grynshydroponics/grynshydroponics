/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        surface: { DEFAULT: '#1e293b', muted: '#334155' },
        accent: { DEFAULT: '#22c55e', muted: '#16a34a' },
      },
    },
  },
  plugins: [],
}
