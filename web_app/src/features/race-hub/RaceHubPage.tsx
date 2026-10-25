import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSnapshot } from '../../data/hooks/useSnapshot';
import { usePredictions, useStages, useWeekend } from '../../data/hooks/resources';
import type { Prediction } from '../../domain/types/prediction';
import { probabilityCoverage } from '../../domain/logic';
import { eventMatches, sameSnapshot } from '../../domain/logic/snapshots';
import { ResourceBoundary } from '../../ui/ResourceBoundary';
import { Surface, SectionHeader } from '../../ui/Surface';
import { Select } from '../../ui/Controls';
import { Badge, Num } from '../../ui/Indicators';
import { StaleBanner, EmptyState } from '../../ui/States';
import { RaceContext } from '../../ui/RaceContext';
import { PredictionsTable } from '../../ui/PredictionsTable';
import { DataTable } from '../../ui/DataTable';
import { InfoPopover } from '../../ui/InfoPopover';

function Field({ rows, previous, fieldSize }: { rows: Prediction[]; previous?: Prediction[]; fieldSize?: number | null }) {
  const [topTen, setTopTen] = useState(true);
  const coverage = probabilityCoverage(rows);
  return <div className="space-y-4"><div className="flex flex-wrap justify-between gap-3"><p className="text-sm text-text-muted">{topTen ? Math.min(10, rows.length) : rows.length} shown of {fieldSize ?? 'unknown'} event drivers / {coverage.count} exported probabilities / {(coverage.mass * 100).toFixed(1)}% probability mass</p><label className="flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" checked={topTen} onChange={e => setTopTen(e.target.checked)} />Top 10 only</label></div><PredictionsTable rows={topTen ? rows.slice(0, 10) : rows} previous={previous} /></div>;
}

export default function RaceHubPage() {
  const [params, setParams] = useSearchParams();
  const predictions = usePredictions(), stages = useStages(), weekend = useWeekend();
  const staged = params.get('source') === 'stages';
  const { calendar, event, selectedRaceMissing } = useSnapshot(params.get('race') ?? (staged && stages.status === 'ready' ? stages.data.raceId : null));
  const stage = params.get('stage') ?? (staged ? 'pre-weekend' : predictions.status === 'ready' ? predictions.meta.stage ?? 'unverified' : 'unverified');
  const canCombine = !staged && predictions.status === 'ready' && weekend.status === 'ready' && sameSnapshot(predictions.meta, weekend.meta) && eventMatches(predictions.meta, event) && (stage === 'unverified' || predictions.meta.stage === stage);
  const update = (key: string, value: string) => { const next = new URLSearchParams(params); next.set(key, value); setParams(next); };
  return <div className="page space-y-6"><SectionHeader title="Race Hub" level={1} kicker="LapLogic / Race context" asOf="Event, stage and snapshot remain attached to every view." />
    <Surface><div className="grid gap-4 sm:grid-cols-2"><Select label="Prediction source" value={staged ? 'stages' : 'published'} onChange={e => {
      const next = new URLSearchParams(params); next.set('source', e.target.value); next.set('stage', e.target.value === 'stages' ? 'pre-weekend' : 'unverified');
      if (e.target.value === 'stages' && stages.status === 'ready') next.set('race', stages.data.raceId); else next.delete('race'); setParams(next);
    }}><option value="published">Published export</option><option value="stages">{stages.status === 'ready' && stages.isPlaceholder ? 'Sample stage workflow' : 'Stage snapshots'}</option></Select><Select label="Prediction stage" value={stage} onChange={e => update('stage', e.target.value)}>{!staged && <option value="unverified">Unverified legacy stage</option>}<option value="pre-weekend">Pre-weekend</option><option value="post-fp2">Post-FP2</option><option value="post-quali">Post-quali</option></Select></div></Surface>
    <Surface title="Event context"><ResourceBoundary state={calendar}>{() => selectedRaceMissing ? <EmptyState title="Event not found" description="The requested event ID is absent from the supplied calendar." /> : <RaceContext event={event} />}</ResourceBoundary></Surface>
    {!canCombine && <StaleBanner>Combined weather, track context and telemetry are suppressed until the published prediction, weekend export and selected event share verified IDs. Stage fixtures never borrow legacy telemetry.</StaleBanner>}
    <Surface title="Weather, track & long-run pace"><ResourceBoundary state={weekend}>{data => canCombine ? <div className="space-y-6">
      <div className="grid gap-5 sm:grid-cols-2"><div><h3 className="mb-3 text-xl font-semibold">Weather / {data.weather.kind}</h3><p>Air <Num value={data.weather.airTemperature} digits={1} unit="°C" /> / Track <Num value={data.weather.trackTemperature} digits={1} unit="°C" /></p><p>Rain <Num value={data.weather.rainProbability} unit="%" /> / {data.weather.condition}</p><p className="mt-2 text-xs text-text-muted">Weather as-of: {data.weather.observedAt ?? 'Unavailable'}</p></div><div><h3 className="mb-3 text-xl font-semibold">Track profile</h3><p>{data.track.layoutType}</p><p>Pit delta <Num value={data.track.pitStopDelta} digits={1} unit="s" /> / DRS <Num value={data.track.drsZones} /></p><p>Degradation <Num value={data.track.degradation} /> / Pole-to-win <Num value={data.track.poleToWin === null ? null : data.track.poleToWin * 100} digits={1} unit="%" /></p><p className="mt-2 text-xs text-text-muted">Sample window: {data.track.sampleWindow ?? 'Unavailable'}</p></div></div>
      <DataTable rows={data.telemetry.longRunPace} rowKey={row => row.driverId} caption="Raw long-run pace · differing compounds are not directly comparable" columns={[
        { key: 'driver', label: 'Driver', render: row => row.driverName }, { key: 'session', label: 'Session', render: row => row.session ?? '—' },
        { key: 'compound', label: 'Compound', render: row => <Badge>{row.tireCompound}</Badge> }, { key: 'age', label: 'Stint age', numeric: true, render: row => <Num value={row.stintAge} /> },
        { key: 'laps', label: 'Laps', numeric: true, render: row => <Num value={row.lapCount} /> }, { key: 'pace', label: 'Average lap', render: row => row.avgLapTime },
      ]} />
      <InfoPopover label="Timing provenance">Fastest-sector claims are withheld unless their session and timing provenance are supplied. Raw pace averages also require stint and compound context.</InfoPopover>
    </div> : <EmptyState title="Event-bound context unavailable" description="The export can be parsed, but it cannot be combined safely with the selected prediction snapshot." />}</ResourceBoundary></Surface>
    <Surface title={staged ? 'Stage probabilities & recalibration' : 'Published probability archive'} variant="accent">
      {staged ? <ResourceBoundary state={stages}>{data => {
        const selected = data.stages.find(row => row.stage === stage);
        if (!selected || !event || data.raceId !== event.raceId) return <EmptyState title="Stage unavailable for this event" description="Choose the stage-workflow event or select another source. Snapshots from different events are never combined." />;
        const index = ['pre-weekend', 'post-fp2', 'post-quali'].indexOf(selected.stage);
        const prior = data.stages.find(row => row.stage === ['pre-weekend', 'post-fp2', 'post-quali'][index - 1]);
        return <div className="space-y-4"><p className="font-mono text-xs text-text-muted">{data.eventName} / {selected.stage} / {selected.modelId} v{selected.modelVersion}</p><p className="break-all text-xs text-text-muted">Snapshot {selected.snapshotId} / As of {selected.generatedAt}</p><Field rows={selected.predictions} previous={prior?.predictions} fieldSize={data.fieldSize} /></div>;
      }}</ResourceBoundary> : <ResourceBoundary state={predictions}>{rows => predictions.status === 'ready' && (stage === 'unverified' || predictions.meta.stage === stage) ? <div className="space-y-4"><p className="text-xs text-text-muted">Model {predictions.meta.modelId ?? 'unavailable'} / Snapshot {predictions.meta.snapshotId ?? 'unverified'} / Stage {predictions.meta.stage ?? 'unverified'}</p><Field rows={rows} fieldSize={predictions.meta.fieldSize} /></div> : <EmptyState title="No published snapshot for this stage" description="The legacy array does not identify its stage. Choose Unverified legacy stage to inspect the archived values." />}</ResourceBoundary>}
    </Surface>
  </div>;
}
