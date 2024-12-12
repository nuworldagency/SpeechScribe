/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#007bff',
        'primary-dark': '#0056b3',
        secondary: '#6c757d',
      },
    },
  },
  plugins: [],
}
