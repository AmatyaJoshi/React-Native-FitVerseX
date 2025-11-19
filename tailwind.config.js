/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        charcoal: '#555555',
      },
    },
  },
  darkMode: ['class', 'class'],
  future: {
    hoverOnlyWhenSupported: true,
  },
  plugins: [],
};