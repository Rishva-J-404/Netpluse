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
          bg: '#111827',
          card: '#181f2b',
          elevated: '#202938',
          accent: '#4f7cff',
          'accent-hover': '#6b93ff',
          text: '#f3f4f6',
          secondary: '#9ca8b8',
          border: '#2b3545',
        },
        noc: {
          950: '#111827',
          900: '#181f2b',
          850: '#202938',
          800: '#202938',
          700: '#2b3545',
          border: '#2b3545',
          emerald: '#35a875',
          cyan: '#4f7cff',
          blue: '#4f7cff',
          amber: '#d9a441',
          rose: '#d95c5c'
        }
      },
      fontFamily: {
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace']
      }
    },
  },
  plugins: [],
}
