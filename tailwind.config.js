/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gamer: {
          bg: '#0d0f14',
          card: '#151922',
          border: '#242b3a',
          purple: '#a855f7',
          green: '#10b981',
          neonGreen: '#39ff14',
        }
      },
      boxShadow: {
        'neon-purple': '0 0 20px -2px rgba(168, 85, 247, 0.45)',
        'neon-green': '0 0 20px -2px rgba(16, 185, 129, 0.45)',
      }
    },
  },
  plugins: [],
}
