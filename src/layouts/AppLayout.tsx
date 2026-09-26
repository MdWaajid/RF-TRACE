import { useEffect, useState, type ReactNode } from 'react';
import type { Analysis } from '../hooks/useAnalysis';
import { Btn } from '../components/ui';

export const NAV = ['Dashboard', 'Signal Analysis', 'Spectrum', 'Waterfall', 'Constellation', 'Modulation', 'Bit Stream', 'FEC / Interleaving', 'Signal Profile', 'Settings'] as const;
export type PageId = (typeof NAV)[number];

const dot = { idle: 'bg-slate-500', running: 'bg-warn animate-pulse', complete: 'bg-accent', error: 'bg-bad' } as const;
const be = { mock: ['bg-warn', 'Mock data (no backend)'], checking: ['bg-slate-500', 'Checking backend…'], online: ['bg-accent', 'Backend online'], offline: ['bg-bad', 'Backend offline'] } as const;

export function AppLayout({ page, setPage, a, children }: { page: PageId; setPage: (p: PageId) => void; a: Analysis; children: ReactNode }) {
  const fileName = a.file?.name ?? a.result?.file.name ?? 'No file loaded';
  const [theme, setTheme] = useState<'light' | 'dark'>(
    () => (localStorage.getItem('rf_theme') as 'light' | 'dark') || 'light'
  );

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
    localStorage.setItem('rf_theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'));

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <aside className="md:w-56 md:min-h-screen shrink-0 bg-panel border-b md:border-b-0 md:border-r border-line flex md:flex-col overflow-x-auto">
        <div className="flex items-center gap-2 px-4 py-3.5 md:py-4 shrink-0">
          <svg width="24" height="24" viewBox="0 0 22 22" fill="none" stroke="var(--color-accent)" strokeWidth="2"><path d="M1 11h4l2-7 4 14 3-10 2 3h5" /></svg>
          <span className="font-mono font-black text-base tracking-wider text-slate-900 dark:text-slate-100">RF-TRACE</span>
        </div>
        <nav className="flex md:flex-col md:px-2 md:pb-4 gap-1" aria-label="Main">
          {NAV.map((n) => (
            <button key={n} onClick={() => setPage(n)} aria-current={page === n}
              className={`text-left whitespace-nowrap text-sm px-3.5 py-2.5 rounded-md border-l-2 font-semibold transition-all duration-150 ${page === n ? 'bg-raised text-accent border-accent shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-raised/60'}`}>{n}</button>
          ))}
        </nav>
      </aside>
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="flex flex-wrap items-center gap-x-5 gap-y-2 px-4 py-2.5 bg-panel border-b border-line text-sm shadow-2xs">
          <div className="min-w-0"><span className="text-slate-500 dark:text-slate-400 font-medium">File </span><span className="font-mono font-bold text-slate-900 dark:text-slate-100 truncate">{fileName}</span></div>
          <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-100"><span className={`w-2.5 h-2.5 rounded-full ${dot[a.state]}`} /><span className="capitalize">{a.state}</span></div>
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 font-semibold"><span className={`w-2.5 h-2.5 rounded-full ${be[a.backend][0]}`} />{be[a.backend][1]}</div>
          <div className="ml-auto flex gap-2">
            <Btn onClick={toggleTheme}>{theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}</Btn>
            <Btn onClick={a.reset}>New Analysis</Btn>
            <Btn primary onClick={a.run} disabled={!a.file || a.state === 'running'}>Run Analysis</Btn>
          </div>
        </header>
        {a.isPreview && <div className="px-4 py-1 text-xs bg-warn/10 text-warn border-b border-warn/30">Preview mode: all values are synthetic mock data for UI layout, not analysis output. Set VITE_USE_MOCK=false to use the backend.</div>}
        <main className="p-4 flex-1">{children}</main>
      </div>
    </div>
  );
}
