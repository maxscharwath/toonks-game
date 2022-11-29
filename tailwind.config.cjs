/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        toonks: {
          orange: "#fea825",
          orangeLight: "#fecb00",
        },
      },
    },
  },
  plugins: [],
};
