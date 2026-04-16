/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-red': '#731919',
        'brand-dark': '#303234',
        'brand-cream': '#F9F6F0',
        'brand-card': '#FFFFFF',
        'brand-muted': '#6B7280',
        'brand-border': '#E5E7EB',
        'brand-success': '#16A34A',
        'brand-warn': '#D97706',
        'brand-error': '#DC2626',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.06)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.15)',
        'modal': '0 20px 60px rgba(0,0,0,0.3)',
      },
    },
  },
  plugins: [],
}
