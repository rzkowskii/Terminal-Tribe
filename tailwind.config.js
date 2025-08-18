/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'terminal-bg': '#1a1b26',
        'terminal-text': '#a9b1d6',
        'terminal-prompt': '#7aa2f7',
        'terminal-success': '#9ece6a',
        'terminal-error': '#f7768e',
        'terminal-info': '#e0af68',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
}
