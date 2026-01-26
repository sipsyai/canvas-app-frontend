import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--color-primary)',
          dark: 'var(--color-primary-dark)',
          hover: 'var(--color-primary-hover)',
          light: '#dbeafe',
          muted: '#e0e7ff',
        },
        'background-light': 'var(--color-background-light)',
        'surface-light': 'var(--color-surface-light)',
        'border-light': 'var(--color-border-light)',
        'background-dark': 'var(--color-background-dark)',
        'surface-dark': 'var(--color-surface-dark)',
        'surface-dark-alt': 'var(--color-surface-dark-alt)',
        'border-dark': 'var(--color-border-dark)',
      },
    },
  },
  plugins: [],
} satisfies Config;
