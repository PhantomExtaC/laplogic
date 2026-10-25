import { Link, useParams, useSearchParams } from 'react-router-dom';
import { CircleCheck, CircleX } from 'lucide-react';
import { useArenaHistory, useDriverNames, useFrozenSnapshot, useOutcome } from '../../data/hooks/arena';
import { useEvaluation } from '../../data/hooks/resources';
import type { ArenaRace } from '../../domain/types/arena';
import { arenaCohort } from '../../domain/logic/arena';
import { Surface, SectionHeader } from '../../ui/Surface';
import { ResourceBoundary } from '../../ui/ResourceBoundary';
import { Select } from '../../ui/Controls';
import { Badge, Num, Stat } from '../../ui/Indicators';
import { DataTable } from '../../ui/DataTable';
import { EmptyState, StaleBanner } from '../../ui/States';
import { InfoPopover } from '../../ui/InfoPopover';
import { EvaluationSummary } from '../../ui/EvaluationSummary';
import { LineTrendChart } from '../../charts/LineTrendChart';
import { tokens } from '../../config/tokens';

function FrozenPicks({ id }: { id: string }) {
  const snapshot = useFrozenSnapshot(id), names = useDriverNames();
  const name = (driverId: string | null) => driverId === null ? 'Unavailable' : names.status === 'ready' ? names.data[driverId] ?? driverId : driverId;
  return <div className="page space-y-6"><SectionHeader title="Frozen prediction snapshot" level={1} kicker="LapLogic / Immutable archive" actions={<Link className="button" to="/arena">Back to Arena</Link>} />
    <Surface><ResourceBoundary state={snapshot}>{data => <div className="space-y-4"><h2 className="text-[28px] font-semibold">{data.eventName}</h2><p className="break-all font-mono text-xs">{data.snapshotId}</p><p className="text-sm text-text-muted">{data.season} / {data.stage} / Frozen {data.frozenAt} / Evaluation {data.evaluationId}</p><DataTable rows={data.predictions} rowKey={row => row.modelId} caption="Frozen pre-outcome picks; this archive does not recompute current models" columns={[
      { key: 'model', label: 'Model', render: row => row.modelId }, { key: 'version', label: 'Frozen version', render: row => row.modelVersion ?? 'Unavailable in this archive' }, { key: 'winner', label: 'Predicted winner', render: row => name(row.predictedWinner) },
      { key: 'probability', label: 'Win probability (%)', numeric: true, render: row => <Num value={row.winProbability === null ? null : row.winProbability * 100} digits={1} /> },
    ]} /></div>}</ResourceBoundary></Surface><ResourceBoundary state={names}>{() => null}</ResourceBoundary>
  </div>;
}
function FrozenOutcome({ id }: { id: string }) {
  const outcome = useOutcome(id), names = useDriverNames();
  return <div className="page space-y-6"><SectionHeader title="Frozen outcome record" level={1} kicker="LapLogic / Immutable archive" actions={<Link className="button" to="/arena">Back to Arena</Link>} /><Surface><ResourceBoundary state={outcome}>{data => <div className="space-y-4"><h2 className="text-[28px] font-semibold">{data.eventName}</h2><p className="font-mono text-xs">Event {data.raceId} / Record {data.outcomeId}</p><p className="text-sm text-text-muted">Recorded {data.recordedAt}</p><p className="text-xl">Winner: {data.winnerId === null ? 'Unavailable' : names.status === 'ready' ? names.data[data.winnerId] ?? data.winnerId : data.winnerId}</p><p className="text-sm text-text-muted">SAMPLE DATA denotes an illustrative outcome, not an assertion about the real race result.</p></div>}</ResourceBoundary></Surface><ResourceBoundary state={names}>{() => null}</ResourceBoundary></div>;
}
function Tracker() {
  const history = useArenaHistory(), evaluation = useEvaluation(), names = useDriverNames();
  const [params, setParams] = useSearchParams();
  const stage = params.get('stage') ?? 'post-quali';
  const seasons = history.status === 'ready' ? [...new Set(history.data.races.map(row => row.season))].sort((a, b) => b - a) : [];
  const season = params.get('season') ?? String(seasons[0] ?? 'all');
  const update = (key: string, value: string) => { const next = new URLSearchParams(params); next.set(key, value); setParams(next); };
  const champion = evaluation.status === 'ready' && !evaluation.data.conflict ? evaluation.data.championId : null;
  const name = (id: string | null) => id === null ? 'Unavailable' : names.status === 'ready' ? names.data[id] ?? id : id;
  return <div className="page space-y-6"><SectionHeader title="Arena Tracker" level={1} kicker="LapLogic / Model evaluation" asOf="One shared cohort. Every denominator visible. Published picks stay frozen." />
    <Surface><div className="grid gap-4 sm:grid-cols-2"><Select label="Evaluation season" value={season} onChange={e => update('season', e.target.value)}><option value="all">All supplied seasons</option>{seasons.map(value => <option key={value}>{value}</option>)}</Select><Select label="Evaluation stage" value={stage} onChange={e => update('stage', e.target.value)}><option value="all">All event-stage forecasts</option><option value="pre-weekend">Pre-weekend</option><option value="post-fp2">Post-FP2</option><option value="post-quali">Post-quali</option></Select></div></Surface>
    <Surface title="Champion, baseline & metric definitions"><ResourceBoundary state={evaluation}>{data => <div className="space-y-4">{(() => {
        if (history.status !== 'ready') return <div><p className="mb-3 text-xs text-text-muted">Published evaluation totals across all stages; filtered history is unavailable.</p><EvaluationSummary evaluation={data} /></div>;
        if (history.data.evaluationId !== data.evaluationId) return <StaleBanner>Evaluation and history IDs differ; combined summary withheld.</StaleBanner>;
        const cohort = arenaCohort(history.data, season === 'all' ? undefined : Number(season), stage);
        const filtered = { ...data, sampleCount: cohort.eligible.length, models: data.models.map(model => ({ ...model, accuracy: cohort.summaries.find(row => row.id === model.id)?.accuracy ?? null })), baseline: data.baseline ? { ...data.baseline, accuracy: cohort.summaries.find(row => row.id === data.baseline?.id)?.accuracy ?? null } : null };
        return <div><p className="mb-3 text-xs text-text-muted">Summary uses the selected season and stage, on the same cohort as the cards below.</p><EvaluationSummary evaluation={filtered} /></div>;
      })()}<p className="text-xs text-text-muted">Evaluation {data.evaluationId ?? 'unavailable'} / Window {data.dateRange ? `${data.dateRange.fromDate} to ${data.dateRange.toDate}` : 'unavailable'}</p>{Object.entries(data.metricDefinitions).map(([key, definition]) => <InfoPopover key={key} label={key}>{definition}</InfoPopover>)}</div>}</ResourceBoundary></Surface>
    <ResourceBoundary state={names}>{() => null}</ResourceBoundary>
    <Surface title="Shared eligible cohort"><ResourceBoundary state={history}>{data => {
      const cohort = arenaCohort(data, season === 'all' ? undefined : Number(season), stage);
      const baseline = cohort.summaries.find(row => row.id === data.baselineId);
      const promoted = cohort.summaries.find(row => row.id === champion);
      const mismatch = evaluation.status === 'ready' && evaluation.data.evaluationId !== data.evaluationId;
      if (mismatch) return <StaleBanner>History and evaluation IDs differ. Combined performance is withheld.</StaleBanner>;
      return <div className="space-y-6">
        {promoted?.accuracy != null && baseline?.accuracy != null && promoted.accuracy < baseline.accuracy && <StaleBanner>Champion accuracy is below the grid baseline on this shared eligible cohort.</StaleBanner>}
        <p className="text-sm text-text-muted">{cohort.eligible.length} eligible event-stage forecasts / {cohort.excluded.length} excluded for every model. All stages can include multiple forecasts of the same race.</p>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{cohort.summaries.map(model => <Surface key={model.id} variant="raised"><Badge tone={model.id === champion ? 'success' : model.id === data.baselineId ? 'neutral' : 'warning'}>{model.id === champion ? 'CHAMPION' : model.id === data.baselineId ? 'BASELINE' : 'CHALLENGER'}</Badge><h3 className="my-4 text-xl font-semibold">{model.id}</h3><Stat label="Winner accuracy" value={model.accuracy === null ? null : model.accuracy * 100} unit="%" scope={`${model.correct} correct / ${model.denominator} shared eligible forecasts`} /><p className="mt-3 text-xs text-text-muted">Top-3 winner coverage <Num value={model.top3 === null ? null : model.top3 * 100} digits={1} unit="%" /></p></Surface>)}</div>
        {cohort.eligible.length ? <LineTrendChart points={cohort.points} series={data.modelIds.map((id, index) => ({ id, label: id, color: [tokens.red, tokens.green, tokens.amber][index % 3] }))} xLabel="Eligible forecast" unit="Accuracy (%)" summary="Cumulative winner-pick accuracy on the shared eligible cohort, in round order." /> : <EmptyState title="No shared eligible forecasts" description="Adjust filters or inspect the exclusions. Missing eligibility never becomes an incorrect result." />}
        <DataTable rows={[...cohort.eligible, ...cohort.excluded].sort((a, b) => a.round - b.round)} rowKey={row => row.snapshotId} caption="Frozen picks vs outcome; excluded forecasts do not enter any model denominator" columns={[
          { key: 'race', label: 'Race / stage', render: row => <div><p className="font-medium">{row.eventName}</p><p className="text-xs text-text-muted">{row.season} / R{row.round} / {row.stage}</p></div> },
          { key: 'outcome', label: 'Outcome winner', render: row => name(row.outcomeWinner) },
          ...data.modelIds.map(id => ({ key: id, label: id, render: (row: ArenaRace) => { const result = row.results.find(model => model.modelId === id); const shared = cohort.eligible.some(race => race.snapshotId === row.snapshotId); return <div className="space-y-2"><p>{name(result?.predictedWinner ?? null)}</p><Badge tone={!shared || result?.correct == null ? 'warning' : result.correct ? 'success' : 'alert'}>{!shared ? 'EXCLUDED' : result?.correct == null ? 'UNAVAILABLE' : result.correct ? <><CircleCheck size={12} aria-hidden="true" />Correct</> : <><CircleX size={12} aria-hidden="true" />Incorrect</>}</Badge><p><Num value={result?.winProbability == null ? null : result.winProbability * 100} digits={1} unit="%" /></p></div>; } })),
          { key: 'archive', label: 'Immutable records', render: row => <div className="flex flex-col gap-2"><Link className="button text-xs" to={`/arena/snapshots/${encodeURIComponent(row.snapshotId)}`}>Frozen picks</Link><Link className="button text-xs" to={`/arena/outcomes/${encodeURIComponent(row.outcomeId)}`}>Outcome</Link></div> },
        ]} />
        <DataTable rows={cohort.excluded} rowKey={row => row.snapshotId} caption="Common-cohort exclusions" columns={[{ key: 'race', label: 'Event / stage', render: row => `${row.eventName} / ${row.stage}` }, { key: 'reason', label: 'Excluded for all models because', render: row => row.reasons.join('; ') }]} />
      </div>;
    }}</ResourceBoundary></Surface>
  </div>;
}
export default function ArenaPage() {
  const { snapshotId, outcomeId } = useParams();
  return snapshotId ? <FrozenPicks id={snapshotId} /> : outcomeId ? <FrozenOutcome id={outcomeId} /> : <Tracker />;
}
