/** @type {import('tailwindcss').Config} */
module.exports = {
  purge: ["./**/templates/*.html"],
  theme: {
    extend: {
      colors: { 
        primary: "#F6D658",
        secondary: "#EAECEF",
        buy: "#2EBD85",
        sell: "#F6465D",
        text1: "#1E2329",
        text2: "#525156",
        stroke: "#DDE2E4",
        background: "#ffffff"
      },
    },
  },
  plugins: [],
};
