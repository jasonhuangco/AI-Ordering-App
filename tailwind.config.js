/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Dynamic colors that use CSS custom properties for branding
        'coffee-brown': 'var(--color-primary, #8B4513)',
        'coffee-light': 'var(--color-secondary, #D2B48C)',
        'coffee-dark': 'var(--color-coffee-dark, #4A2C17)',
        'cream': 'var(--color-background, #F5F5DC)',
        'espresso': 'var(--color-espresso, #3C2415)',
        'roast': 'var(--color-accent, #A0522D)',
        // Keep some static fallbacks for elements that shouldn't change
        'warm-gold': '#DAA520',
      },
      fontFamily: {
        'serif': ['Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}
