import type { AnalysisResult } from '../types';
import { mockResult } from './mock';

export const API_BASE: string = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';
export const USE_MOCK: boolean = import.meta.env.VITE_USE_MOCK !== 'false';
export const STAGES = ['Upload', 'Preprocess', 'Analyze', 'Classify', 'Demodulate', 'Decode', 'Complete'] as const;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Expected FastAPI contract:
 *   GET  /api/health                  -> 200
 *   POST /api/analyses (multipart)    -> { id }
 *   GET  /api/analyses/{id}/status    -> { state: 'running'|'complete'|'error', stage: number, message? }
 *   GET  /api/analyses/{id}           -> AnalysisResult
 */
export const api = {
  async health(): Promise<void> {
    const r = await fetch(`${API_BASE}/api/health`);
    if (!r.ok) throw new Error('Backend unreachable');
  },
  async analyze(file: File, onStage: (i: number) => void): Promise<AnalysisResult> {
    if (USE_MOCK) {
      for (let i = 0; i < STAGES.length - 1; i++) { onStage(i); await sleep(600); }
      return mockResult(file.name, file.size);
    }
    const fd = new FormData(); fd.append('file', file);
    const up = await fetch(`${API_BASE}/api/analyses`, { method: 'POST', body: fd });
    if (!up.ok) throw new Error('Upload failed');
    const { id } = await up.json();
    for (;;) {
      const s = await (await fetch(`${API_BASE}/api/analyses/${id}/status`)).json();
      onStage(s.stage);
      if (s.state === 'complete') break;
      if (s.state === 'error') throw new Error(s.message ?? 'Analysis failed');
      await sleep(1000);
    }
    return (await fetch(`${API_BASE}/api/analyses/${id}`)).json();
  },
};
