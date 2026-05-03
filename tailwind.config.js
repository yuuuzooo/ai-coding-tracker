/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        canvas: 'rgb(var(--canvas) / <alpha-value>)',
        surface: 'rgb(var(--surface) / <alpha-value>)',
        elev: 'rgb(var(--elev) / <alpha-value>)',
        line: 'rgb(var(--line) / <alpha-value>)',
        fg: {
          DEFAULT: 'rgb(var(--fg) / <alpha-value>)',
          strong: 'rgb(var(--fg-strong) / <alpha-value>)',
          muted: 'rgb(var(--fg-muted) / <alpha-value>)',
          subtle: 'rgb(var(--fg-subtle) / <alpha-value>)',
          faint: 'rgb(var(--fg-faint) / <alpha-value>)',
        },
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"Hiragino Sans"',
          '"Noto Sans JP"',
          'sans-serif',
        ],
        mono: ['"SF Mono"', 'Menlo', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(99, 102, 241, 0.4), 0 8px 24px -8px rgba(99, 102, 241, 0.4)',
      },
    },
  },
  plugins: [],
};
