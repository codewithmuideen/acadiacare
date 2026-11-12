/** @type {import('tailwindcss').Config} */
const v = (name) => `rgb(var(--${name}) / <alpha-value>)`

export default {
  content: ['./index.html', './src/**/*.{js,jsx}', './node_modules/liquid-glass-react/dist/*.js'],
  theme: {
    screens: {
      xs: '400px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        brand: {
          DEFAULT: v('brand'),
          strong: v('brand-strong'),
          deep: v('brand-deep'),
          soft: v('brand-soft'),
          tint: v('brand-tint'),
        },
        rose: v('rose'),
        steel: { DEFAULT: v('steel'), deep: v('steel-deep'), soft: v('steel-soft') },
        ink: { DEFAULT: v('ink'), soft: v('ink-soft') },
        muted: v('muted'),
        cream: v('cream'),
        sand: v('sand'),
        stone: v('stone'),
        earth: v('earth'),
        line: v('line'),
        surface: v('surface'),
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['Manrope', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
      fontSize: {
        'display-xl': ['clamp(3rem, 7.4vw, 7.25rem)', { lineHeight: '0.95', letterSpacing: '-0.02em' }],
        'display-lg': ['clamp(2.5rem, 5.2vw, 5rem)', { lineHeight: '1', letterSpacing: '-0.015em' }],
        'display-md': ['clamp(2.1rem, 3.8vw, 3.6rem)', { lineHeight: '1.04', letterSpacing: '-0.01em' }],
        'display-sm': ['clamp(1.65rem, 2.6vw, 2.4rem)', { lineHeight: '1.12' }],
      },
      maxWidth: { site: '84rem' },
      borderRadius: { arch: '999px 999px 1.5rem 1.5rem' },
      transitionTimingFunction: { soft: 'cubic-bezier(0.22, 1, 0.36, 1)' },
      keyframes: {
        marquee: { from: { transform: 'translateX(0)' }, to: { transform: 'translateX(-50%)' } },
        spin_slow: { to: { transform: 'rotate(360deg)' } },
      },
      animation: {
        marquee: 'marquee 40s linear infinite',
        'spin-slow': 'spin_slow 28s linear infinite',
      },
    },
  },
  plugins: [],
}
