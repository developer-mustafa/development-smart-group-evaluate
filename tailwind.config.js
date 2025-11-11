/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,html}'],
  theme: {
    extend: {
      fontFamily: {
        bengali: ['"Noto Sans Bengali"', 'Hind Siliguri', 'SolaimanLipi', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
