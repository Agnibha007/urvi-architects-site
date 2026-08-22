/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bone: '#F7F5F2',
        ink: '#151515',
        accent: '#A98D67',
        secondary: '#D8CEC0',
        dark: '#101010',
      },
      fontFamily: {
        display: ['Canela', 'Cormorant Garamond', 'Instrument Serif', 'Times New Roman', 'serif'],
        sans: ['Neue Montreal', 'DM Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        tightest: '-0.055em',
        micro: '0.24em',
      },
      transitionTimingFunction: {
        apple: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
}
