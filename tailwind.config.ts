import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/app/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
    './src/lib/**/*.{ts,tsx}',
    './src/config/**/*.{ts,tsx}',
  ],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Montserrat"', 'sans-serif'],
        display: ['"Montserrat"', 'sans-serif'],
        montserrat: ['"Montserrat"', 'sans-serif'],
      },
      colors: {
        bg: 'var(--color-bg)',
        panel: 'var(--color-panel)',
        panelAlt: 'var(--color-panel-alt)',
        panelBorder: 'var(--color-border)',
        border: 'var(--color-border)',
        text: 'var(--color-text)',
        muted: 'var(--color-muted)',
        accent: {
          emerald: '#10b981',
          pitch: '#10b981',
          green: '#34d399',
          blue: '#38bdf8',
          cyan: '#06b6d4',
          amber: '#f59e0b',
          rose: '#f43f5e',
        },
      },
      boxShadow: {
        soft: '0 20px 50px -10px rgba(0, 0, 0, 0.25)',
        card: '0 4px 20px -2px rgba(0, 0, 0, 0.15)',
        emeraldGlow: '0 0 25px -5px rgba(16, 185, 129, 0.25)',
      },
      backgroundImage: {
        'radial-fade': 'var(--bg-radial)',
        'card-gradient': 'linear-gradient(180deg, var(--card-grad-start) 0%, var(--card-grad-end) 100%)',
      },
    },
  },
  plugins: [],
};

export default config;