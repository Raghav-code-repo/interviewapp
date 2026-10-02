/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Auth surface palette (see AuthLayout / LoginPage / RegisterPage).
        accent: {
          50: '#F5FAFE',
          100: '#EAF1FC', // input field background
          200: '#D3E5F8',
          300: '#A9CDF1',
          400: '#5FAEE2',
          500: '#2C9BD6',
          600: '#0785C9', // primary action blue
          700: '#066BA4',
          800: '#07567F',
          900: '#0A4563',
        },
        ink: '#142338', // headings
        muted: '#52647A', // body copy
        panel: '#F6F8FA', // light-gray left panel
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        navy: {
          800: '#0f172a',
          850: '#0c1322',
          900: '#090d16',
          950: '#05070c',
        },
      },
      borderRadius: {
        card: '12px',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'Monaco', 'monospace'],
      },
      backgroundImage: {
        // Depth for the app canvas and for tinted panels. Kept low-contrast so
        // light mode gains dimension without the surface turning into a gradient.
        'canvas-light':
          'radial-gradient(1200px 600px at 15% -10%, #EAF1FC 0%, rgba(234, 241, 252, 0) 60%), radial-gradient(900px 500px at 100% 0%, #EEF2FF 0%, rgba(238, 242, 255, 0) 55%), linear-gradient(180deg, #F8FAFC 0%, #F1F5F9 100%)',
        'canvas-dark':
          'radial-gradient(1200px 600px at 15% -10%, rgba(7, 133, 201, 0.10) 0%, rgba(7, 133, 201, 0) 60%), radial-gradient(900px 500px at 100% 0%, rgba(99, 102, 241, 0.08) 0%, rgba(99, 102, 241, 0) 55%), linear-gradient(180deg, #0F172A 0%, #080D18 100%)',
        'panel-light':
          'linear-gradient(180deg, #FFFFFF 0%, #FDFEFF 60%, #F8FBFF 100%)',
        'panel-dark':
          'linear-gradient(180deg, rgba(30, 41, 59, 0.92) 0%, rgba(23, 32, 48, 0.92) 100%)',
      },
      boxShadow: {
        subtle: '0 1px 3px 0 rgba(15, 23, 42, 0.06), 0 1px 2px -1px rgba(15, 23, 42, 0.05)',
        card: '0 1px 2px 0 rgba(15, 23, 42, 0.04), 0 4px 12px -2px rgba(15, 23, 42, 0.07), 0 2px 4px -2px rgba(15, 23, 42, 0.04)',
        elevated:
          '0 4px 8px -2px rgba(15, 23, 42, 0.06), 0 12px 28px -6px rgba(15, 23, 42, 0.12)',
        // Deeper lift for interactive cards.
        lift: '0 2px 4px -2px rgba(15, 23, 42, 0.06), 0 12px 24px -6px rgba(15, 23, 42, 0.14)',
        // Panel depth: the card shadow plus an inset top highlight that fakes a
        // lit edge. Must stay a single value — two `shadow-*` utilities collide
        // under twMerge, which keeps only the last one.
        panel:
          '0 1px 2px 0 rgba(15, 23, 42, 0.04), 0 4px 12px -2px rgba(15, 23, 42, 0.07), inset 0 1px 0 0 rgba(255, 255, 255, 0.9)',
        'panel-dark':
          '0 1px 2px 0 rgba(0, 0, 0, 0.3), 0 8px 20px -6px rgba(0, 0, 0, 0.55), inset 0 1px 0 0 rgba(255, 255, 255, 0.05)',
        // Inset shadow for small nested panels sitting *inside* a Card, so the inner
        // surface reads as recessed rather than as another flat block.
        nested: 'inset 0 1px 2px 0 rgba(15, 23, 42, 0.05)',
        'nested-dark': 'inset 0 1px 2px 0 rgba(0, 0, 0, 0.3)',
        glow: '0 0 0 1px rgba(7, 133, 201, 0.18), 0 8px 28px -8px rgba(7, 133, 201, 0.32)',
        'focus-ring': '0 0 0 3px rgba(7, 133, 201, 0.18)',
      },
      keyframes: {
        'dp-fade': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        // Opacity + scale + rise in one keyframe so a single utility can stand in
        // for the `tailwindcss-animate` composite classes.
        'dp-pop': {
          from: { opacity: '0', transform: 'scale(0.96) translateY(6px)' },
          to: { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
        'dp-drop': {
          from: { opacity: '0', transform: 'translateY(-8px) scale(0.98)' },
          to: { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        'dp-rise': {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'dp-shimmer': {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        enter: 'dp-pop 220ms cubic-bezier(0.16, 1, 0.3, 1) both',
        fade: 'dp-fade 200ms ease-out both',
        drop: 'dp-drop 180ms cubic-bezier(0.16, 1, 0.3, 1) both',
        rise: 'dp-rise 320ms cubic-bezier(0.16, 1, 0.3, 1) both',
        shimmer: 'dp-shimmer 1.8s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
