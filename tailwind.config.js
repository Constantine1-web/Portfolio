/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: '#fdfbf7',
        ink: '#292524', // stone-800
        rust: '#9a3412', // orange-800
        mustard: '#eab308', // yellow-500
        coral: '#ea580c', // orange-600
        sage: '#dcfce7', // green-100
      },
      fontFamily: {
        display: ['Fraunces', 'serif'],
        sans: ['Quicksand', 'sans-serif'],
        handwriting: ['Patrick Hand', 'cursive'],
      },
      backgroundImage: {
        'paper-texture': "url('https://www.transparenttextures.com/patterns/notebook.png')",
        'subtle-grunge': "url('https://www.transparenttextures.com/patterns/cream-paper.png')",
      },
      boxShadow: {
        'drawn': '4px 4px 0px 0px rgba(41, 37, 36, 1)',
        'drawn-lg': '8px 8px 0px 0px rgba(41, 37, 36, 1)',
      }
    },
  },
  plugins: [],
}
