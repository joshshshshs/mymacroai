/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Design System v2.1 Specific Tokens
        'forest-bg': '#0B1410',
        'forest-card': '#13201C',
        'lime-accent': '#A3E635',
        'leaf-accent': '#65A30D',

        // Deep Forest (Dark)
        forest: {
          bg: '#0B1410',
          card: '#13201C',
          elevated: '#1A2B25',
        },
        // Morning Mist (Light)
        mist: {
          bg: '#F2F5F3',
          card: '#FFFFFF',
          elevated: '#FAFAFA',
        },
        // Accents
        lime: {
          400: '#A3E635',
          500: '#84CC16',
          600: '#65A30D',
        },
        // Glass
        glass: {
          dark: 'rgba(255, 255, 255, 0.05)',
          light: 'rgba(255, 255, 255, 0.70)',
          border: 'rgba(255, 255, 255, 0.10)',
        },
        // Keep existing deep colors if needed, but prioritizing Design System
        deep: {
          primary: '#1a365d',
          secondary: '#2d3748',
          accent: '#3182ce',
          surface: '#f7fafc',
          muted: '#718096',
          error: '#e53e3e',
          success: '#38a169',
          warning: '#d69e2e'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace']
      },
      fontSize: {
        'xs': '0.75rem',
        'sm': '0.875rem',
        'base': '1rem',
        'lg': '1.125rem',
        'xl': '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem'
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem'
      },
      borderRadius: {
        'none': '0',
        'sm': '0.125rem',
        'DEFAULT': '0.25rem',
        'md': '0.375rem',
        'lg': '0.5rem',
        'xl': '0.75rem',
        '2xl': '28px',
        '3xl': '32px',
        '4xl': '36px',
        'full': '9999px',
        'glass-radius': '32px',
      }
    },
  },
  plugins: [],
}