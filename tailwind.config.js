export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: { extend: {
    colors: {
      bg: 'var(--color-bg)',
      panel: 'var(--color-panel)',
      raised: 'var(--color-raised)',
      line: 'var(--color-line)',
      accent: 'var(--color-accent)',
      warn: 'var(--color-warn)',
      bad: 'var(--color-bad)',
    },
    fontFamily: { sans: ['"IBM Plex Sans"', 'system-ui', 'sans-serif'], mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'] },
  } },
  plugins: [],
};
