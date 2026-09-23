import type { AnalysisResult } from '../types';
import { mockResult } from './mock';

export const API_BASE: string = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';
export const USE_MOCK: boolean = import.meta.env.VITE_USE_MOCK === 'true';
export const STAGES = ['Upload', 'Preprocess', 'Analyze', 'Classify', 'Demodulate', 'Decode', 'Complete'] as const;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

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

    // Step 1: Upload File to backend
    onStage(0);
    const fd = new FormData();
    fd.append('file', file);
    const up = await fetch(`${API_BASE}/api/upload`, { method: 'POST', body: fd });
    if (!up.ok) throw new Error('Upload failed');
    const uploadRes = await up.json();
    const fileId = uploadRes.fileId;

    // Step 2: Start Analysis Pipeline
    onStage(1);
    const startRes = await fetch(`${API_BASE}/api/analysis`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileId }),
    });
    if (!startRes.ok) throw new Error('Failed to start analysis');
    const { analysisId } = await startRes.json();

    // Step 3: Poll status until completion
    let pollCount = 0;
    while (pollCount < 30) {
      pollCount++;
      const statusResp = await fetch(`${API_BASE}/api/analysis/${analysisId}/status`);
      if (statusResp.ok) {
        const s = await statusResp.json();
        // Map backend stage 1-12 to frontend STAGES 0-6
        const stageIdx = Math.min(Math.floor((s.stage / 12) * (STAGES.length - 1)), STAGES.length - 2);
        onStage(stageIdx);

        if (s.state === 'complete') break;
        if (s.state === 'error') throw new Error(s.error ?? 'Analysis failed');
      }
      await sleep(600);
    }

    // Step 4: Fetch Results
    onStage(STAGES.length - 1);
    const resultsResp = await fetch(`${API_BASE}/api/analysis/${analysisId}/results`);
    if (!resultsResp.ok) throw new Error('Failed to retrieve analysis results');
    return resultsResp.json();
  },
};
