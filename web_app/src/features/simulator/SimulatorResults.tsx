import type { SimulationResult } from '../../domain/types/simulation';
import { Surface } from '../../ui/Surface';
import { SampleDataChip, Num } from '../../ui/Indicators';
import { StaleBanner } from '../../ui/States';
import { ProbabilityBars } from '../../charts/ProbabilityBars';
import { DataTable } from '../../ui/DataTable';
import { probabilityCoverage } from '../../domain/logic';
export function SimulatorResults({ result, stale }: { result: SimulationResult; stale: boolean }) {
  const rows = result.baseline.map(row => ({ ...row, scenario: result.scenario.find(next => next.driverId === row.driverId)?.probability ?? null, delta: result.deltasPp.find(next => next.driverId === row.driverId)?.value ?? null }));
  const coverage = (values: SimulationResult['baseline']) => {
    const raw = probabilityCoverage(values.map(row => ({ winProbability: row.probability })));
    return `${raw.count} published drivers; ${(raw.mass * 100).toFixed(1)}% of raw probability mass.`;
  };
  return <Surface title="Hypothetical outcome" kicker="Scenario / Not a race prediction"><div className="space-y-5">
    {result.placeholder && <SampleDataChip />}{stale && <StaleBanner>Previous result — inputs changed or the latest request failed. Run again to update.</StaleBanner>}
    <p className="text-sm text-text-muted break-words">{result.eventName} · {result.snapshotId} · {result.driverId} +{result.gridPenalty} places<br />Model {result.modelId} / {result.modelVersion} · Generated {result.generatedAt}</p>
    <div className="grid min-w-0 gap-8 lg:grid-cols-2"><ProbabilityBars rows={result.baseline.map(row => ({ id: row.driverId, label: row.driverName, probability: row.probability }))} summary={`Frozen baseline. ${coverage(result.baseline)}`} /><ProbabilityBars rows={result.scenario.map(row => ({ id: row.driverId, label: row.driverName, probability: row.probability }))} summary={`Hypothetical scenario. ${coverage(result.scenario)}`} /></div>
    <DataTable rows={rows} rowKey={row => row.driverId} caption="Scenario change in percentage points" columns={[{ key: 'driver', label: 'Driver', render: row => row.driverName }, { key: 'delta', label: 'Change (pp)', numeric: true, render: row => <Num value={row.delta} digits={2} /> }]} />
    <ul className="list-disc space-y-2 pl-5 text-sm text-text-muted">{result.assumptions.map(text => <li key={text}>{text}</li>)}</ul>
  </div></Surface>;
}
