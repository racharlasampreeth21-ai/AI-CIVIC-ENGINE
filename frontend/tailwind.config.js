/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        civic: {
          indigo: '#2e3a87', // Deep Indigo
          teal: '#0f766e',   // Teal
          lightTeal: '#f0fdfa',
          lavender: '#eef2ff', // Soft Lavender
          amber: '#d97706',   // Warm Amber
          dark: '#1e293b',
          gray: '#64748b',
          bg: '#f8fafc'
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
