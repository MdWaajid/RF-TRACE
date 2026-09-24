import type { ReactNode } from 'react';
import type { Provenance } from '../types';

const tone: Record<Provenance, string> = {
  Measured: 'text-emerald-800 dark:text-emerald-300 border-emerald-500/40 bg-emerald-500/10 font-semibold',
  Estimated: 'text-amber-800 dark:text-amber-300 border-amber-500/40 bg-amber-500/10 font-semibold',
  Metadata: 'text-sky-800 dark:text-sky-300 border-sky-500/40 bg-sky-500/10 font-semibold',
  Unknown: 'text-slate-700 dark:text-slate-400 border-slate-400 dark:border-slate-600 bg-slate-500/10',
};
export const SourceBadge = ({ s }: { s: Provenance }) => (
  <span className={`text-[10px] font-medium border rounded-sm px-1.5 py-0.5 ${tone[s]}`}>{s}</span>
);
export const Card = ({ title, right, children, className = '' }: { title: string; right?: ReactNode; children: ReactNode; className?: string }) => (
  <section className={`bg-panel border border-line rounded-sm shadow-xs ${className}`}>
    <header className="flex items-center justify-between gap-2 px-3 py-2 border-b border-line bg-raised/40">
      <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">{title}</h3>{right}
    </header>
    <div className="p-3">{children}</div>
  </section>
);
export const Page = ({ title, sub, actions, children }: { title: string; sub?: string; actions?: ReactNode; children: ReactNode }) => (
  <div className="space-y-3">
    <div className="flex flex-wrap items-end justify-between gap-2">
      <div><h1 className="text-lg font-bold text-slate-900 dark:text-slate-100">{title}</h1>{sub && <p className="text-sm text-slate-500 dark:text-slate-400">{sub}</p>}</div>{actions}
    </div>{children}
  </div>
);
export const Empty = ({ text = 'No analysis data. Upload a file on the Dashboard and run the analysis.' }: { text?: string }) => (
  <div className="border border-dashed border-line rounded-sm p-10 text-center text-sm text-slate-500">{text}</div>
);
export const Btn = ({ children, primary, ...p }: { primary?: boolean } & React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button {...p} className={`px-3 py-1.5 text-sm rounded-sm border disabled:opacity-40 disabled:cursor-not-allowed ${primary ? 'bg-accent text-white dark:text-bg border-accent font-medium hover:brightness-110 shadow-xs' : 'border-line bg-raised text-slate-700 dark:text-slate-200 hover:border-slate-400'}`}>{children}</button>
);
export const Row = ({ k, v }: { k: string; v: ReactNode }) => (
  <div className="flex justify-between gap-4 py-1 text-sm border-b border-line/60 last:border-0"><span className="text-slate-500 dark:text-slate-400">{k}</span><span className="font-mono text-right text-slate-900 dark:text-slate-100">{v}</span></div>
);
