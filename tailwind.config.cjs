/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        toonks: {
          orange: '#fea825',
          orangeLight: '#fecb00',
        },
      },
      backgroundImage: {
        'toonks-bg': 'url(\'/images/toonks-bg.webp\')',
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      backgroundPosition: {
        'toonks-bg-pos': 'center 70%',
      },
      animation: {
        'health': 'pulse 600ms cubic-bezier(0.4, 0, 0.6, 1) infinite'
      }
    },
  },
  plugins: [],
}
