/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        peach: {
          50: '#FFF4ED',
          100: '#FFDAB3',
        },
        mauve: '#C8AAAA',
        'muted-mauve': '#9F8383',
        'deep-plum': '#574964',
      },
      typography: {
        DEFAULT: {
          css: {
            img: {
              borderRadius: '0.5rem',
              marginTop: '1rem',
              marginBottom: '1rem',
            },
          },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
