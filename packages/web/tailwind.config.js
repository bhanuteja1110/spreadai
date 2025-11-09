/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'dark-navy': '#0b0f19',
        'neon-blue': '#4eaaff',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}

