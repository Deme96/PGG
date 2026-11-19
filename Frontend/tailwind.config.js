/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#0A131F',
          900: '#0D1929',
          800: '#14243B', // Institutional Navy
          700: '#1E3554',
          600: '#2C4972',
          500: '#3D6194',
          100: '#E4EBF5',
          50: '#F0F5FA',
        },
        gold: {
          600: '#A4802E',
          500: '#C9A44C', // Institutional Gold Accent
          400: '#DCB964',
          300: '#EDD18C',
          200: '#F5E3B8',
          100: '#FAF0DB',
          50: '#FDFBF5',
        },
        cream: {
          50: '#FDFCF9',
          100: '#FAF8F4', // Institutional Cream Background
          200: '#F4EFE6',
          300: '#EAE2D3',
          400: '#DDD1BD',
          500: '#C9B89E',
        }
      },
      fontFamily: {
        cinzel: ['Aptos', 'Aptos Body', 'Segoe UI', 'sans-serif'],
        sans: ['Aptos', 'Aptos Body', 'Segoe UI', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(20, 36, 59, 0.06), 0 2px 6px -1px rgba(20, 36, 59, 0.04)',
        'card': '0 10px 30px -4px rgba(20, 36, 59, 0.08), 0 4px 10px -2px rgba(20, 36, 59, 0.03)',
        'gold': '0 0 20px rgba(201, 164, 76, 0.25)',
      }
    },
  },
  plugins: [],
}
