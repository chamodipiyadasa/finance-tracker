import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Piggy Bank! - Cream Base, Blush Pink & Olive Green
        base: {
          50: '#fdfdf8',
          100: '#fbfbf0',
          200: '#f5f3e0',
          300: '#e9df9e',  // Main cream/pale yellow
          400: '#ddd18a',
          500: '#cfc070',
          600: '#b5a555',
          700: '#968743',
          800: '#7a6e38',
          900: '#655b30',
          950: '#373118',
        },
        primary: {
          50: '#fef7f8',
          100: '#fdf0f2',
          200: '#fbe1e6',
          300: '#f9cdd5',  // Main blush pink
          400: '#f5a8b8',
          500: '#ed7a93',
          600: '#dc5070',
          700: '#ba3a57',
          800: '#9a3349',
          900: '#822f42',
          950: '#491520',
        },
        accent: {
          50: '#f6f7f0',
          100: '#ebeede',
          200: '#d6ddc0',
          300: '#b9c596',
          400: '#9caa6f',
          500: '#7a8450',  // Main olive green
          600: '#636c40',
          700: '#4d5435',
          800: '#40452e',
          900: '#373c29',
          950: '#1c2013',
        },
        warning: {
          50: '#fdfdf8',
          100: '#fbfbf0',
          200: '#f5f3e0',
          300: '#e9df9e',  // Cream for warnings
          400: '#ddd18a',
          500: '#cfc070',
          600: '#b5a555',
          700: '#968743',
          800: '#7a6e38',
          900: '#655b30',
          950: '#373118',
        },
        danger: {
          50: '#fef7f8',
          100: '#fdf0f2',
          200: '#fbe1e6',
          300: '#f9cdd5',
          400: '#f5a8b8',
          500: '#ed7a93',  // Pink-based danger
          600: '#dc5070',
          700: '#ba3a57',
          800: '#9a3349',
          900: '#822f42',
          950: '#491520',
        },
        dark: {
          50: '#fdfdf8',   // Cream white
          100: '#f8f6e8',
          200: '#f0ecd0',
          300: '#e9df9e',  // Base cream
          400: '#d4c88a',
          500: '#a9a07a',
          600: '#7a7560',
          700: '#5a5548',
          800: '#3a3830',  // Dark cream-tinted
          900: '#2a2824',  // Darker
          950: '#1a1916',  // Deepest
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        display: ['Titan One', 'cursive'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'glass-gradient': 'linear-gradient(135deg, rgba(250, 248, 246, 0.08), rgba(250, 248, 246, 0.03))',
        'card-gradient': 'linear-gradient(135deg, rgba(250, 248, 246, 0.05), rgba(250, 248, 246, 0.02))',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(26, 26, 22, 0.45)',
        'card': '0 4px 6px -1px rgba(26, 26, 22, 0.15), 0 2px 4px -1px rgba(26, 26, 22, 0.1)',
        'card-hover': '0 10px 15px -3px rgba(26, 26, 22, 0.2), 0 4px 6px -2px rgba(26, 26, 22, 0.1)',
        'glow': '0 0 20px rgba(249, 205, 213, 0.35)',
        'glow-accent': '0 0 20px rgba(122, 132, 80, 0.35)',
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'pulse-slow': 'pulse 3s infinite',
        'shimmer': 'shimmer 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
}

export default config
