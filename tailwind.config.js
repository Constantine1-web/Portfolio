/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: '#faf8f4',
        ink: '#1a1210',        // much darker — near-black espresso
        rust: '#b91c1c',       // stronger red — stands out on paper
        mustard: '#d97706',    // warmer, deeper amber
        coral: '#c2410c',      // deep burnt orange
        sage: '#d9f99d',       // brighter lime-green for pops
        cream: '#fefce8',      // warm cream for result cards
        maroon: '#7f1d1d',     // deep maroon for footer
      },
      fontFamily: {
        display: ['Fraunces', 'serif'],
        sans: ['Quicksand', 'sans-serif'],
        handwriting: ['Patrick Hand', 'cursive'],
      },
      backgroundImage: {
        'paper-texture': "url('https://www.transparenttextures.com/patterns/cream-paper.png')",
      },
      boxShadow: {
        'drawn': '4px 4px 0px 0px #1a1210',
        'drawn-lg': '8px 8px 0px 0px #1a1210',
      }
    },
  },
  plugins: [],
}
