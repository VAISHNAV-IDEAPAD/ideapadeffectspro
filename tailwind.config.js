/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        prem: {
          darkest: '#111111',
          dark: '#161616',
          panel: '#1e1e1e',
          panelLight: '#242424',
          header: '#282828',
          hover: '#323232',
          active: '#3a3a3a',
          border: '#2e2e2e',
          borderLight: '#3f3f3f',
          blue: '#1473E6',
          blueHover: '#388BFD',
          blueDark: '#0d56a8',
          accent: '#2680eb',
          playhead: '#388bfd',
          video: '#2a5b84',
          videoHeader: '#1e4261',
          audio: '#256e54',
          audioHeader: '#1a4e3c',
          text: '#803c66',
          textHeader: '#592946',
          image: '#7a5a2b',
          imageHeader: '#543e1d',
          vuGreen: '#10b981',
          vuYellow: '#f59e0b',
          vuRed: '#ef4444',
        }
      },
      fontFamily: {
        sans: ['Segoe UI', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['JetBrains Mono', 'Consolas', 'Courier New', 'monospace'],
      },
      boxShadow: {
        'panel': '0 2px 8px rgba(0, 0, 0, 0.4)',
        'glow': '0 0 12px rgba(20, 115, 230, 0.4)',
      }
    },
  },
  plugins: [],
}
