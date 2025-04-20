/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#000',
        text: {
          primary: '#FF9770',
          secondary: '#FF9971',
        },
        button: '#EFEDE9',
      },
      fontFamily: {
        sans: ['Martel Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

