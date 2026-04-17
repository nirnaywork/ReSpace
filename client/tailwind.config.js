/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-red':     '#C8622A', /* Warm Cognac Accent */
        'brand-dark':    '#731919', /* Deep Crimson — Accents */
        'brand-cream':   '#0E0C0A', /* Deep Espresso Background */
        'brand-card':    '#1A1612', /* Rich Dark Walnut Card */
        'brand-muted':   '#8C7D6E', /* Warm Taupe — Readable Text */
        'brand-surface': '#141210', /* Near-Black Surface */
        'brand-success': '#86A673', /* Sage/Olive Green — Posh Success */
        'brand-warn':    '#C4924E',
        'brand-error':   '#A84848',
        'brand-border':  '#2E2520', /* Dark Mocha Border */
        'brand-text-light': '#EDE8DF', /* Light Ivory for dark backgrounds */
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Syne', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'card': 'none',
        'card-hover': 'none',
        'modal': '0 24px 64px rgba(0,0,0,0.8)',
      },
    },
  },
  plugins: [],
}
