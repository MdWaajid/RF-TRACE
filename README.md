# RF-TRACE — frontend

React + TypeScript + Vite + Tailwind UI for RF signal analysis. **Frontend only**: no DSP, demodulation, FEC or AI runs here.

## Run
```bash
npm install
npm run dev      # http://localhost:5173
npm run build
```

## Mock vs backend
By default the app runs in **preview mode** with synthetic data from `src/services/mock.ts` (a banner says so).
To use a backend: copy `.env.example` to `.env`, set `VITE_USE_MOCK=false` and `VITE_API_URL`.

## Structure
`src/types` result contract (`AnalysisResult`) · `src/services/api.ts` FastAPI client · `src/hooks/useAnalysis.ts` run state ·
`src/layouts` sidebar/top bar · `src/pages` one file per view · `src/components` UI kit and SVG/canvas charts.

## Expected FastAPI endpoints
- `GET /api/health`
- `POST /api/analyses` (multipart `file`) → `{ id }`
- `GET /api/analyses/{id}/status` → `{ state, stage, message? }`
- `GET /api/analyses/{id}` → `AnalysisResult` (see `src/types/index.ts`)
