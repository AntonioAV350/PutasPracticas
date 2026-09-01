/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors:{
        primaryBlue: 'rgb(0,46,99)',
        SecundaryGold: 'rgb(212,176,18)',
        white : 'rgb(255,255,255)',
        darkBackground: '#262626',
      },
      fontFamily:{
        'sans': ['Helvetica', 'Arial', 'sistem-ui']
      },
    },
  },
  plugins: [],
}

