import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1d85ed',
        'background-light': '#f6f7f8',
        'background-dark': '#101922',
        'surface-dark': '#161B22',
        'border-dark': '#30363d',
        'electric-blue': '#58A6FF',
        'success-green': '#238636',
        'error-red': '#DA3633',
        'ai-purple': '#BB80FF',
        'text-muted': '#8da4ce',
      },
      fontFamily: {
        display: ['var(--font-inter)', 'Inter', 'sans-serif'],
        mono: ['var(--font-jetbrains-mono)', 'JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '0.25rem',
        lg: '0.5rem',
        xl: '0.75rem',
        full: '9999px',
      },
    },
  },
  plugins: [],
};

export default config;
