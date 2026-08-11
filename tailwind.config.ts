import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#120E0D',
          soft: '#1F1917',
          border: '#2E2725',
        },
        paper: '#F7F6F7',
        border: '#E7E3E2',
        card: '#FFFFFF',
        text: {
          DEFAULT: '#17130F',
          muted: '#6B6260',
          faint: '#A39C9A',
        },
        brand: {
          DEFAULT: '#EB3137',
          soft: '#FDEAEA',
          dark: '#B81E24',
        },
        success: {
          DEFAULT: '#16A34A',
          soft: '#E1F6E8',
        },
        amber: {
          DEFAULT: '#E8A33D',
          soft: '#FBF0DD',
        },
        danger: {
          DEFAULT: '#9B1C1C',
          soft: '#F6E4E4',
        },
      },
      fontFamily: {
        display: ['var(--font-space-grotesk)', 'sans-serif'],
        sans: ['var(--font-inter)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(16, 19, 28, 0.04), 0 1px 8px rgba(16, 19, 28, 0.04)',
        panel: '0 4px 24px rgba(16, 19, 28, 0.08)',
      },
      borderRadius: {
        xl: '14px',
        '2xl': '20px',
      },
    },
  },
  plugins: [],
};

export default config;
