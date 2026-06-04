/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#07090f',
          900: '#0b0d16',
          800: '#0f1320',
          700: '#141a2e',
          600: '#1a2240',
        },
        ecs: {
          red:    '#8D1D45',
          redhov: '#6b1535',
          redglow:'#8D1D4540',
          yellow: '#F8CE3E',
          gold:   '#d4aa20',
          ygroup: '#F8CE3E40',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'ecs-red':    '0 0 28px 0 rgba(141,29,69,0.35)',
        'ecs-yellow': '0 0 28px 0 rgba(248,206,62,0.30)',
      },
    },
  },
  plugins: [],
}
