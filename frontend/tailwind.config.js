/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-base': '#06101C',
        'bg-surface': '#081522',
        'surface': '#0D1B2A',
        'elevated': '#12263A',
        'border-col': '#22384B',
        'cyan': '#42C7FF',
        'success': '#35C98A',
        'watch': '#F2C94C',
        'warning': '#F2994A',
        'critical': '#EF5A5A',
        'flood': '#4E8BF0',
        'sos': '#FF4D6D',
        'text-primary': '#EAF2F8',
        'text-muted': '#8EA6B8',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
