/** Tailwind Config with design tokens */
import plugin from 'tailwindcss/plugin';

const semanticColors = {
  // Dark mode default (we toggle classes to swap)
  brand: {
    primary: 'hsl(220 90% 60%)',
    primaryHover: 'hsl(220 90% 66%)',
    accent: 'hsl(280 70% 65%)',
    danger: 'hsl(0 70% 58%)',
    warn: 'hsl(35 85% 58%)',
    success: 'hsl(150 65% 45%)',
    surface: 'hsl(222 28% 12%)',
    surfaceAlt: 'hsl(222 26% 18%)',
    border: 'hsl(222 20% 28%)',
    text: 'hsl(220 15% 88%)',
    textDim: 'hsl(220 12% 65%)'
  }
};

export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        brand: semanticColors.brand
      },
      fontFamily: {
        sans: ['Inter','system-ui','sans-serif'],
        display: ['Montserrat','Inter','system-ui']
      },
      spacing: {
        13: '3.25rem',
        15: '3.75rem'
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.25rem'
      },
      boxShadow: {
        'soft': '0 4px 14px -2px rgba(0,0,0,.35)',
        'focus': '0 0 0 3px hsl(220 90% 60% / .35)'
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(.4,0,.2,1)'
      },
      keyframes: {
        skeleton: {
          '0%': { backgroundPosition: '0% 0%' },
          '100%': { backgroundPosition: '-200% 0%' }
        }
      },
      animation: {
        skeleton: 'skeleton 1.4s linear infinite'
      }
    }
  },
  plugins: [
    plugin(function({ addUtilities }) {
      addUtilities({
        '.focus-ring': {
          outline: 'none',
          boxShadow: '0 0 0 2px hsl(222 30% 10%), 0 0 0 4px hsl(220 90% 60%)'
        },
        '.skeleton': {
          background:
            'linear-gradient(90deg, rgba(255,255,255,0.08) 25%, rgba(255,255,255,0.18) 37%, rgba(255,255,255,0.08) 63%)',
          backgroundSize: '400% 100%'
        }
      });
    })
  ]
};
