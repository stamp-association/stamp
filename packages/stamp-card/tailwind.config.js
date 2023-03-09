import typography from '@tailwindcss/typography'

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{svelte,js,ts}'],
  theme: {
    fontFamily: {
      sans: ['Work Sans', 'sans-serif'],
      serif: ['Poppins', 'serif'],
      mono: ['Roboto Mono', 'mono']
    },
    extend: {
      colors: {
        orange: {
          400: '#ff8500',
          500: '#c7761e'
        },
        black: {
          400: '#293241'
        },
        white: {
          400: '#fcfcfc'
        },
        whitesmoke: {
          400: 'f2f3f4'
        }
      }
    },
  },
  plugins: [typography],
}