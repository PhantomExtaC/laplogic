import { useSearchParams } from 'react-router-dom';
import { useComparison } from '../../data/hooks/arena';
import { useTracks } from '../../data/hooks/resources';
import { headToHead } from '../../domain/logic';
import { Surface, SectionHeader } from '../../ui/Surface';
import { ResourceBoundary } from '../../ui/ResourceBoundary';
import { Select } from '../../ui/Controls';
import { DataTable } from '../../ui/DataTable';
import { Num } from '../../ui/Indicators';
import { InfoPopover } from '../../ui/InfoPopover';
import { EmptyState } from '../../ui/States';
import { RadarCompare } from '../../charts/RadarCompare';

export default function ComparePage() {
  const comparison = useComparison(), tracks = useTracks();
  const [params, setParams] = useSearchParams();
  const update = (key: string, value: string) => { const next = new URLSearchParams(params); if (value || key === 'a' || key === 'b') next.set(key, value); else next.delete(key); setParams(next); };
  return <div className="page space-y-6"><SectionHeader title="Head-to-Head" level={1} kicker="LapLogic / Driver comparison" asOf="Normalized shape alongside raw values, direction and sample sizes." />
    <Surface><ResourceBoundary state={comparison}>{data => {
      const aId = params.has('a') ? params.get('a') ?? '' : data.drivers[0]?.driverId ?? '';
      const bId = params.has('b') ? params.get('b') ?? '' : data.drivers[1]?.driverId ?? '';
      const track = params.get('track') ?? '', season = params.get('season') ?? String(data.season);
      const a = data.drivers.find(row => row.driverId === aId), b = data.drivers.find(row => row.driverId === bId);
      const invalid = !a || !b ? 'Choose two drivers present in this dataset.' : aId === bId ? 'Choose two different drivers.' : season !== String(data.season) ? 'No comparison dataset exists for the selected season.' : null;
      const rows = a && b && !invalid ? headToHead({ ...a, id: a.driverId }, { ...b, id: b.driverId }, track || undefined) : [];
      return <div className="space-y-6"><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><Select label="Driver A" value={aId} onChange={e => update('a', e.target.value)}><option value="">Choose driver</option>{data.drivers.map(row => <option key={row.driverId} value={row.driverId} disabled={row.driverId === bId}>{row.name}</option>)}</Select><Select label="Driver B" value={bId} onChange={e => update('b', e.target.value)}><option value="">Choose driver</option>{data.drivers.map(row => <option key={row.driverId} value={row.driverId} disabled={row.driverId === aId}>{row.name}</option>)}</Select><Select label="Track context" value={track} onChange={e => update('track', e.target.value)}><option value="">Overall supplied context</option>{track && (tracks.status !== 'ready' || !tracks.data.some(row => row.id === track)) && <option value={track}>{track} / unavailable</option>}{tracks.status === 'ready' && tracks.data.map(row => <option key={row.id} value={row.id}>{row.name}</option>)}</Select><Select label="Comparison season" value={season} onChange={e => update('season', e.target.value)}><option value={data.season}>{data.season}</option>{season !== String(data.season) && <option value={season}>{season} / unavailable</option>}</Select></div>
        {invalid ? <div role="alert"><EmptyState title="Comparison unavailable" description={invalid} /></div> : a && b && <div className="grid min-w-0 grid-cols-1 items-start gap-6 xl:grid-cols-2"><RadarCompare rows={rows.map(row => ({ label: row.key, a: row.a?.normalized ?? null, b: row.b?.normalized ?? null }))} names={[a.name, b.name]} summary="Directional normalized scores: higher on every plotted axis means stronger in this dataset." /><DataTable rows={rows} rowKey={row => row.key} caption="Raw comparison values, sample counts and availability" columns={[
          { key: 'metric', label: 'Metric', render: row => <div><p>{row.key}</p><p className="mt-1 text-xs text-text-muted">{row.reason ?? `${row.a?.unit ?? 'index'} / ${row.a?.higherIsBetter ? 'higher is better' : 'lower is better'}`}</p></div> },
          { key: 'a', label: `${a.name} raw`, numeric: true, render: row => <Num value={row.a?.raw} digits={2} /> },
          { key: 'an', label: 'A samples', numeric: true, render: row => <Num value={row.sampleA} /> },
          { key: 'b', label: `${b.name} raw`, numeric: true, render: row => <Num value={row.b?.raw} digits={2} /> },
          { key: 'bn', label: 'B samples', numeric: true, render: row => <Num value={row.sampleB} /> },
        ]} /></div>}
        <div className="space-y-3">{Object.entries(data.metricDefinitions).map(([key, definition]) => <InfoPopover key={key} label={key}>{definition}</InfoPopover>)}</div>
        <p className="text-xs text-text-muted">No overall-track fallback is used when a selected track lacks comparable mastery data. Insufficient samples are unavailable rather than zero. The last fixture record intentionally demonstrates sparse data; it is not a claim about the real driver's experience.</p>
      </div>;
    }}</ResourceBoundary></Surface><ResourceBoundary state={tracks}>{() => null}</ResourceBoundary>
  </div>;
}
