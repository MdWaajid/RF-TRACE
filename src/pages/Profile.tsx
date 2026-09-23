import type { Analysis } from '../hooks/useAnalysis';
import { Btn, Card, Empty, Page, Row, SourceBadge } from '../components/ui';

export default function Profile({ a }: { a: Analysis }) {
  const r = a.result;
  if (!r) return <Page title="Signal Profile"><Empty /></Page>;
  const ones = [...r.bits].filter((b) => b === '1').length, top = r.fec.reduce((x, y) => (y.score > x.score ? y : x));
  const exportReport = () => {
    const url = URL.createObjectURL(new Blob([JSON.stringify(r, null, 2)], { type: 'application/json' }));
    Object.assign(document.createElement('a'), { href: url, download: `${r.file.name}.rf-trace-report.json` }).click(); URL.revokeObjectURL(url);
  };
  return (
    <Page title="Signal Profile" sub="Consolidated report" actions={<Btn primary onClick={exportReport}>Export Report</Btn>}>
      <div className="grid lg:grid-cols-3 gap-3">
        <Card title="Input file"><Row k="Name" v={r.file.name} /><Row k="Format" v={r.file.format} /><Row k="Sample format" v={r.file.sampleFormat} /></Card>
        <Card title="Signal parameters" className="lg:col-span-2">
          {Object.values(r.params).map((p) => <Row key={p.label} k={p.label} v={<span className="inline-flex items-center gap-2">{p.value ?? 'Unknown'} {p.unit}<SourceBadge s={p.source} /></span>} />)}</Card>
        <Card title="Modulation"><Row k="Detected" v={r.modulation.detected} /><Row k="Confidence" v={`${(r.modulation.confidence * 100).toFixed(1)}%`} /></Card>
        <Card title="DSP evidence" className="lg:col-span-2">{r.modulation.dspEvidence.map((e) => <Row key={e.metric} k={e.metric} v={e.value} />)}</Card>
        <Card title="FEC / interleaving"><Row k="Top candidate" v={top.name} /><Row k="Score" v={`${(top.score * 100).toFixed(0)}%`} /></Card>
        <Card title="Demodulation"><Row k="Status" v={r.demod.status} /><Row k="Recovered bits" v={r.demod.recoveredBits} /></Card>
        <Card title="Bit analysis"><Row k="Ones / zeros" v={`${ones} / ${r.bits.length - ones}`} /><Row k="Ones ratio" v={(ones / r.bits.length).toFixed(3)} /></Card>
      </div>
    </Page>
  );
}
