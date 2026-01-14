/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class", // dark mode controlat prin clasa "dark"
  content: ["./index.html", "./src/**/*.{js,jsx}"], // fișiere scanate de Tailwind
  theme: {
    extend: {}, // extensii de temă (nefolosite aici)
  },
  plugins: [], // fără plugin-uri suplimentare
};
