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
        display: ['Instrument Serif', 'Cormorant Garamond', 'Canela', 'Times New Roman', 'serif'],
        sans: ['Inter', 'DM Sans', 'Neue Montreal', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        tightest: '-0.055em',
        micro: '0.24em',
        editorial: '-0.02em',
      },
      transitionTimingFunction: {
        apple: 'cubic-bezier(0.16, 1, 0.3, 1)',
        subtle: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
      },
    },
  },
  plugins: [],
}
