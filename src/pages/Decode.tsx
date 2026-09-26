import { useMemo, useState } from 'react';
import type { Analysis } from '../hooks/useAnalysis';
import { Btn, Card, Empty, Page, Row } from '../components/ui';

export function Modulation({ a }: { a: Analysis }) {
  const m = a.result?.modulation;
  if (!m) return <Page title="Modulation"><Empty /></Page>;
  return (
    <Page title="Modulation" sub="Classifier output and supporting evidence">
      <div className="grid lg:grid-cols-3 gap-3">
        <Card title="Classification probabilities" className="lg:col-span-2">
          <div className="space-y-2">{(Object.entries(m.probs) as [string, number][]).sort((x, y) => y[1] - x[1]).map(([k, v]) => (
            <div key={k} className="flex items-center gap-3 text-sm"><span className="w-14 font-mono font-semibold text-main">{k}</span>
              <div className="flex-1 h-3 bg-raised border border-line rounded-xs"><div className={`h-full ${k === m.detected ? 'bg-accent' : 'bg-muted/40'}`} style={{ width: `${v * 100}%` }} /></div>
              <span className="w-12 text-right font-mono font-semibold text-main">{(v * 100).toFixed(1)}%</span></div>))}</div>
        </Card>
        <Card title="Result"><div className="font-mono text-3xl font-bold text-accent">{m.detected}</div><Row k="Confidence" v={`${(m.confidence * 100).toFixed(1)}%`} /></Card>
        <Card title="CNN evidence"><ul className="text-sm space-y-1.5 list-disc pl-4 text-sub font-medium">{m.cnnEvidence.map((e) => <li key={e}>{e}</li>)}</ul></Card>
        <Card title="DSP evidence" className="lg:col-span-2">{m.dspEvidence.map((e) => <Row key={e.metric} k={`${e.metric} — ${e.note}`} v={e.value} />)}</Card>
      </div>
    </Page>
  );
}

export function BitStream({ a }: { a: Analysis }) {
  const [q, setQ] = useState(''); const [view, setView] = useState<'bin' | 'hex'>('bin'); const [copied, setCopied] = useState(false);
  const bits = a.result?.bits ?? '';
  const hex = useMemo(() => (bits.match(/.{1,8}/g) ?? []).map((b) => parseInt(b.padEnd(8, '0'), 2).toString(16).padStart(2, '0')).join(' '), [bits]);
  const valid = /^[01]+$/.test(q);
  const parts = valid ? bits.split(new RegExp(`(${q})`)) : [bits];
  const copy = async () => { await navigator.clipboard.writeText(view === 'hex' ? hex : bits); setCopied(true); setTimeout(() => setCopied(false), 1200); };
  if (!a.result) return <Page title="Bit Stream"><Empty /></Page>;
  return (
    <Page title="Bit Stream" sub={`${bits.length} bits · ${Math.ceil(bits.length / 8)} bytes`}>
      <Card title="Recovered data" right={<div className="flex gap-2"><Btn onClick={() => setView(view === 'bin' ? 'hex' : 'bin')}>{view === 'bin' ? 'Show hex' : 'Show binary'}</Btn><Btn onClick={copy}>{copied ? 'Copied' : 'Copy'}</Btn></div>}>
        <div className="flex items-center gap-2 mb-3"><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search bit pattern, e.g. 10110"
          className="bg-raised border border-line text-main placeholder:text-muted rounded-sm px-2 py-1.5 text-sm font-mono w-64" aria-label="Search bit pattern" />
          {q && <span className="text-xs text-sub font-medium">{valid ? `${parts.length > 1 ? (parts.length - 1) / 2 : 0} matches` : 'Use 0 and 1 only'}</span>}</div>
        <div className="font-mono text-sm break-all leading-6 max-h-96 overflow-auto text-main">
          {view === 'hex' ? hex : parts.map((p, i) => (i % 2 ? <mark key={i} className="bg-accent/30 text-accent font-bold px-0.5">{p}</mark> : <span key={i}>{p}</span>))}
        </div>
      </Card>
    </Page>
  );
}

const st = { candidate: 'text-accent border-accent/40 font-semibold', inconclusive: 'text-warn border-warn/40 font-semibold', rejected: 'text-sub border-line' } as const;
export function Fec({ a }: { a: Analysis }) {
  if (!a.result) return <Page title="FEC / Interleaving"><Empty /></Page>;
  return (
    <Page title="FEC / Interleaving" sub="Candidate schemes ranked by score">
      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-3">{a.result.fec.map((f) => (
        <Card key={f.name} title={f.name} right={<span className={`text-[10px] border rounded-sm px-1.5 py-0.5 ${st[f.status]}`}>{f.status}</span>}>
          <div className="font-mono text-xl font-bold text-main">{(f.score * 100).toFixed(0)}%</div>
          <div className="h-1.5 bg-raised border border-line mt-1 mb-2 rounded-xs"><div className="h-full bg-accent" style={{ width: `${f.score * 100}%` }} /></div>
          <p className="text-xs text-sub font-medium">{f.note}</p></Card>))}</div>
    </Page>
  );
}
