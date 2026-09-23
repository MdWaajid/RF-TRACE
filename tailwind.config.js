export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: { extend: {
    colors: { bg: '#0a0d12', panel: '#0f141b', raised: '#151c25', line: '#1f2833', accent: '#3ddbc0', warn: '#e8b04a', bad: '#ef6a6a' },
    fontFamily: { sans: ['"IBM Plex Sans"', 'system-ui', 'sans-serif'], mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'] },
  } },
  plugins: [],
};
