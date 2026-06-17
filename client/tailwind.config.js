/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#f97316', // Orange-500
          DEFAULT: '#ea580c', // Orange-600
          dark: '#c2410c', // Orange-700
        },
        secondary: {
          light: '#6b7280',
          DEFAULT: '#374151',
          dark: '#111827',
        },
        background: '#f9fafb',
      },
    },
  },
  plugins: [],
}
