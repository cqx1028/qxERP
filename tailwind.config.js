/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ozon: {
          blue: '#005BFF',
          light: '#E8F0FF',
          dark: '#002B8F',
          gray: '#6A737B',
        }
      }
    },
  },
  plugins: [],
}
