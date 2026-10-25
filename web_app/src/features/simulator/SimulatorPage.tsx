import { useState } from 'react';
import { useResource } from '../../data/hooks/useResource';
import { useSimulation } from '../../data/hooks/useSimulation';
import { getSimulator, simulationProvider } from '../../data/services/simulation';
import type { SimulationInput } from '../../domain/types/simulation';
import type { z } from 'zod';
import type { simulatorSchema } from '../../data/schemas/simulation';
import { Surface, SectionHeader } from '../../ui/Surface';
import { ResourceBoundary } from '../../ui/ResourceBoundary';
import { SimulatorForm } from './SimulatorForm';
import { SimulatorResults } from './SimulatorResults';
import { features } from '../../config/features';

function Workspace({ data }: { data: z.infer<typeof simulatorSchema>['data'] }) {
  const [input, setInput] = useState<SimulationInput>({ snapshotId: data.events[0].snapshotId, driverId: data.drivers[0].driverId, gridPenalty: 0 });
  const simulation = useSimulation(simulationProvider, input);
  // Reset restores the original event, driver and published zero-penalty fixture.
  const reset = () => { const next = { snapshotId: data.events[0].snapshotId, driverId: data.drivers[0].driverId, gridPenalty: 0 }; setInput(next); void simulation.run(next); };
  return <div className="space-y-6"><Surface title="Scenario controls"><SimulatorForm input={input} events={data.events} drivers={data.drivers} busy={simulation.busy} onChange={setInput} onRun={() => void simulation.run()} onReset={reset} />
    <p className="mt-4 text-xs text-text-muted">{features.simulationProvider === 'placeholder' ? 'Sample mode uses a fixed fixture table. Some drivers intentionally have no supplied scenarios.' : 'Configured inference service. The service owns probabilities and model assumptions.'} Reset loads the published zero-penalty baseline.</p></Surface>
    <p role="status" aria-live="polite">{simulation.busy ? 'Running scenario…' : simulation.error ? `Scenario unavailable. ${simulation.error}` : simulation.result ? simulation.stale ? 'Inputs changed. Previous result is stale.' : 'Scenario complete.' : 'Choose inputs and run a scenario.'}</p>
    {simulation.result && <SimulatorResults result={simulation.result} stale={simulation.stale} />}
  </div>;
}
export default function SimulatorPage() {
  const state = useResource(getSimulator);
  return <div className="page space-y-6"><SectionHeader level={1} title="Scenario Simulator" kicker="LapLogic / What if" asOf="Explore a grid penalty against a frozen baseline. Every outcome is hypothetical." /><ResourceBoundary state={state}>{data => <Workspace data={data} />}</ResourceBoundary></div>;
}
