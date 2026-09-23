import { API_BASE, USE_MOCK } from '../services/api';
import { Card, Page, Row } from '../components/ui';
export default function Settings() {
  return <Page title="Settings" sub="Connection settings are read from environment variables (see .env.example).">
    <Card title="Backend"><Row k="Mode" v={USE_MOCK ? 'Mock preview' : 'FastAPI backend'} /><Row k="API URL" v={API_BASE} /></Card></Page>;
}
