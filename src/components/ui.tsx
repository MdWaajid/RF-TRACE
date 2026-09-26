import type { ReactNode } from 'react';
import type { Provenance } from '../types';

const tone: Record<Provenance, string> = {
  Measured: 'text-emerald-700 dark:text-emerald-400 border-emerald-500/40 bg-emerald-500/10 font-semibold shadow-xs',
  Estimated: 'text-amber-700 dark:text-amber-400 border-amber-500/40 bg-amber-500/10 font-semibold shadow-xs',
  Metadata: 'text-sky-700 dark:text-sky-400 border-sky-500/40 bg-sky-500/10 font-semibold shadow-xs',
  Unknown: 'text-slate-600 dark:text-slate-400 border-slate-400 dark:border-slate-600 bg-slate-500/10 font-medium',
};

export const SourceBadge = ({ s }: { s: Provenance }) => (
  <span className={`text-[10px] font-semibold tracking-wide border rounded-xs px-1.5 py-0.5 ${tone[s]}`}>{s}</span>
);

export const Card = ({ title, right, children, className = '' }: { title: string; right?: ReactNode; children: ReactNode; className?: string }) => (
  <section className={`bg-panel border border-line rounded-sm shadow-xs hover:border-line/80 transition-all duration-150 ${className}`}>
    <header className="flex items-center justify-between gap-2 px-3.5 py-2.5 border-b border-line bg-raised/40">
      <h3 className="text-sm font-semibold tracking-wide text-slate-800 dark:text-slate-200">{title}</h3>{right}
    </header>
    <div className="p-3.5">{children}</div>
  </section>
);

export const Page = ({ title, sub, actions, children }: { title: string; sub?: string; actions?: ReactNode; children: ReactNode }) => (
  <div className="space-y-4">
    <div className="flex flex-wrap items-end justify-between gap-2 border-b border-line/60 pb-2.5">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">{title}</h1>
        {sub && <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 font-medium">{sub}</p>}
      </div>
      {actions}
    </div>
    {children}
  </div>
);

export const Empty = ({ text = 'No analysis data. Upload a file on the Dashboard and run the analysis.' }: { text?: string }) => (
  <div className="border border-dashed border-line rounded-sm p-10 text-center text-sm text-slate-600 dark:text-slate-400 font-medium bg-raised/20">{text}</div>
);

export const Btn = ({ children, primary, ...p }: { primary?: boolean } & React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    {...p}
    className={`px-3.5 py-1.5 text-sm rounded-sm border font-semibold transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed ${
      primary
        ? 'bg-accent text-white dark:text-slate-950 border-accent hover:brightness-110 active:scale-[0.98] shadow-xs'
        : 'border-line bg-raised text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:border-slate-400 active:scale-[0.98]'
    }`}
  >
    {children}
  </button>
);

export const Row = ({ k, v }: { k: string; v: ReactNode }) => (
  <div className="flex justify-between items-center gap-4 py-1.5 text-sm border-b border-line/50 last:border-0 hover:bg-raised/40 px-1 -mx-1 rounded-xs transition-colors">
    <span className="text-slate-600 dark:text-slate-400 font-medium">{k}</span>
    <span className="font-mono text-right text-slate-900 dark:text-slate-100 font-bold">{v}</span>
  </div>
);
