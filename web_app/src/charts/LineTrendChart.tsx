import { useId, useState } from 'react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { ChartSeries, TrendPoint } from '../domain/types/charts';
import { tokens } from '../config/tokens';
import { DataTable } from '../ui/DataTable';
import { Num } from '../ui/Indicators';
import { EmptyState } from '../ui/States';

export function LineTrendChart({ points, series, summary, xLabel = 'Round', unit = 'Points', initialVisible = 6 }: {
  points: TrendPoint[]; series: ChartSeries[]; summary: string; xLabel?: string; unit?: string; initialVisible?: number;
}) {
  const id = useId();
  const [hidden, setHidden] = useState<string[]>(() => series.slice(initialVisible).map(s => s.id));
  const visible = series.filter(s => !hidden.includes(s.id));
  const sorted = [...points].sort((a, b) => a.x - b.x);
  if (!points.length || !series.length) return <EmptyState title="No observations" description="There are no recorded points for this chart." />;
  return <figure aria-labelledby={id}>
    <figcaption id={id} className="mb-4 text-sm text-text-muted">{summary} Step lines retain recorded values between observations. Toggle series below.</figcaption>
    <fieldset className="mb-4 flex flex-wrap gap-x-4 gap-y-1"><legend className="sr-only">Visible series</legend>{series.map((s, i) => <label key={s.id} className="inline-flex min-h-11 items-center gap-2 text-xs"><input type="checkbox" checked={!hidden.includes(s.id)} className="h-4 w-4 accent-telemetry-red" onChange={() => setHidden(current => current.includes(s.id) ? current.filter(key => key !== s.id) : [...current, s.id])} /><span className="inline-block w-5 border-t-2" style={{ borderColor: s.color, borderStyle: i % 6 ? 'dashed' : 'solid' }} aria-hidden="true" />{s.label}</label>)}</fieldset>
    {visible.length ? <div className="h-72 min-w-0 sm:h-96" aria-hidden="true"><ResponsiveContainer width="100%" height="100%"><LineChart data={sorted} margin={{ top: 10, right: 12, left: -18, bottom: 12 }}>
      <CartesianGrid stroke={tokens.line} vertical={false} /><XAxis dataKey="x" tick={{ fill: tokens.muted, fontSize: 12 }} axisLine={false} tickLine={false} /><YAxis tick={{ fill: tokens.muted, fontSize: 12 }} axisLine={false} tickLine={false} />
      <Tooltip contentStyle={{ background: tokens.charcoal, border: `1px solid ${tokens.muted}`, borderRadius: 8, color: tokens.text }} labelFormatter={label => `${xLabel} ${label}`} />
      {visible.map(s => <Line key={s.id} dataKey={(point: TrendPoint) => point.values[s.id]} name={s.label} type="stepAfter" stroke={s.color} strokeWidth={2} strokeDasharray={['', '6 4', '2 3', '10 3 2 3', '1 3', '8 3 4 3'][series.indexOf(s) % 6]} dot={{ r: 2 }} connectNulls={false} isAnimationActive={false} />)}
    </LineChart></ResponsiveContainer></div> : <p className="py-8 text-text-muted">Select a series to display the chart.</p>}
    <details className="mt-4"><summary className="min-h-11 content-center text-sm text-text-muted">View chart data as a table</summary><DataTable rows={sorted} rowKey={row => row.x} caption={`${unit} by ${xLabel.toLowerCase()}; selected series`} columns={[{ key: 'x', label: xLabel, numeric: true, render: row => <Num value={row.x} /> }, ...visible.map(s => ({ key: s.id, label: s.label, numeric: true, render: (row: TrendPoint) => <Num value={row.values[s.id]} /> }))]} /></details>
  </figure>;
}
