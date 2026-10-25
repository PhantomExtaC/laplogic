import type { SimulationInput } from '../../domain/types/simulation';
import { Select, Slider } from '../../ui/Controls';
export function SimulatorForm({ input, events, drivers, busy, onChange, onRun, onReset }: {
  input: SimulationInput; events: { snapshotId: string; eventName: string }[]; drivers: { driverId: string; driverName: string }[];
  busy: boolean; onChange: (input: SimulationInput) => void; onRun: () => void; onReset: () => void;
}) {
  const valid = events.some(row => row.snapshotId === input.snapshotId) && drivers.some(row => row.driverId === input.driverId) && Number.isInteger(input.gridPenalty) && input.gridPenalty >= 0 && input.gridPenalty <= 10;
  return <form className="space-y-6" onSubmit={e => { e.preventDefault(); if (valid) onRun(); }}>
    <div className="grid gap-5 sm:grid-cols-2"><Select label="Simulation event" value={input.snapshotId} onChange={e => onChange({ ...input, snapshotId: e.target.value })}>{events.map(row => <option key={row.snapshotId} value={row.snapshotId}>{row.eventName}</option>)}</Select><Select label="Simulation driver" value={input.driverId} onChange={e => onChange({ ...input, driverId: e.target.value })}>{drivers.map(row => <option key={row.driverId} value={row.driverId}>{row.driverName}</option>)}</Select></div>
    <Slider label="Grid penalty (places)" value={input.gridPenalty} min={0} max={10} onChange={gridPenalty => onChange({ ...input, gridPenalty })} />
    {!valid && <p role="alert">Choose a supplied event, driver and whole penalty from 0 to 10.</p>}
    <div className="flex flex-wrap gap-3"><button className="button border-telemetry-red" disabled={busy || !valid} type="submit">{busy ? 'Running scenario…' : 'Run scenario'}</button><button className="button" type="button" onClick={onReset}>Reset to baseline</button></div>
  </form>;
}
