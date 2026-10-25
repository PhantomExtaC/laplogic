import type { Prediction } from '../domain/types/prediction';
import { DataTable } from './DataTable';
import { Delta, Num } from './Indicators';
import { InfoPopover } from './InfoPopover';

export function PredictionsTable({ rows, previous = [] }: { rows: Prediction[]; previous?: Prediction[] }) {
  return <div className="space-y-4"><DataTable rows={rows} rowKey={row => row.driverId} caption="Published field · raw probabilities and percentage-point changes" columns={[
    { key: 'position', label: 'Pos', numeric: true, render: row => <Num value={row.predictedPosition} /> },
    { key: 'driver', label: 'Driver', render: row => row.driverName },
    { key: 'probability', label: 'Win %', numeric: true, sortValue: row => row.winProbability, render: row => <Num value={row.winProbability * 100} digits={1} /> },
    { key: 'change', label: 'Prior stage Δ', numeric: true, render: row => <Delta before={previous.find(p => p.driverId === row.driverId)?.winProbability ?? null} after={row.winProbability} /> },
    { key: 'mastery', label: 'Track mastery', numeric: true, render: row => <Num value={row.insights?.trackMastery} digits={1} /> },
    { key: 'form', label: 'Driver momentum', numeric: true, render: row => <Num value={row.insights?.driverMomentum} digits={1} /> },
    { key: 'team', label: 'Team momentum', numeric: true, render: row => <Num value={row.insights?.teamMomentum} digits={1} /> },
  ]} /><InfoPopover label="Probability, feature units & direction">Win probability is a fraction displayed as percent. Changes are percentage points from the prior stage of this event. Feature units and direction are unconfirmed in the legacy export; zeros remain valid measured values. Missing stage/feature data is unavailable, not zero.</InfoPopover></div>;
}
