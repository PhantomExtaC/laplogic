import type { ProbabilityRow } from '../domain/types/charts';
import { DataTable } from '../ui/DataTable';
import { Num, ProgressBar } from '../ui/Indicators';
import { EmptyState } from '../ui/States';

export function ProbabilityBars({ rows, summary }: { rows: ProbabilityRow[]; summary: string }) {
  if (!rows.length) return <EmptyState title="No probabilities" description="No published probability values are available." />;
  return <figure><figcaption className="mb-5 text-sm text-text-muted">{summary}</figcaption><div className="space-y-5">{rows.map(row => <div key={row.id}><div className="mb-2 flex items-center justify-between gap-4"><span className="text-sm font-medium">{row.label}</span><Num value={row.probability === null ? null : row.probability * 100} digits={1} unit="%" /></div>{row.probability !== null && <ProgressBar value={row.probability} label={`${row.label} win probability`} />}</div>)}</div><details className="mt-4"><summary className="min-h-11 content-center text-sm text-text-muted">View probabilities as a table</summary><DataTable rows={rows} rowKey={row => row.id} caption="Published probabilities, without renormalization" columns={[{ key: 'driver', label: 'Driver', render: row => row.label }, { key: 'probability', label: 'Win probability (%)', numeric: true, render: row => <Num value={row.probability === null ? null : row.probability * 100} digits={1} /> }]} /></details></figure>;
}
