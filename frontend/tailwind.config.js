/** @type {import('tailwindcss').Config} */
import scrollbarHide from 'tailwind-scrollbar-hide';

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'heading': ['Storm Gust', 'sans-serif'],
        'body': ['Ungai', 'sans-serif'],
        'sans': ['Ungai', 'sans-serif'],
      },
    },
  },
  darkMode: "class",
  plugins: [
    scrollbarHide, // ✅ use imported plugin, not require()
  ],
};
