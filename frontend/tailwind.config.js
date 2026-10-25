/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: '#0b1426',
          card: '#14233d',
          elevated: '#1b2b46',
          accent: '#8cc8ff',
          'accent-hover': '#a3d5ff',
          text: '#f4f7fc',
          secondary: '#a6b4c9',
          border: '#2c3d58',
        },
        noc: {
          950: '#0b1426',
          900: '#14233d',
          850: '#1b2b46',
          800: '#1b2b46',
          700: '#2c3d58',
          border: '#2c3d58',
          emerald: '#34d399',
          cyan: '#8cc8ff',
          blue: '#8cc8ff',
          amber: '#fbbf24',
          rose: '#f87171'
        }
      },
      fontFamily: {
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace']
      }
    },
  },
  plugins: [],
}
