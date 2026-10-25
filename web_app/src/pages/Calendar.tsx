import { useResource } from '../data/hooks/useResource';
import { getCalendarResource } from '../data/services';
import { ResourceBoundary } from '../ui/ResourceBoundary';
import { SectionHeader, Surface } from '../ui/Surface';
import { DataTable } from '../ui/DataTable';
import { Badge, Num } from '../ui/Indicators';

export default function Calendar() {
  const state = useResource(getCalendarResource);
  return <div className="page space-y-6"><SectionHeader title="Race calendar" level={1} kicker="LapLogic / Schedule" asOf="Published schedule · dates have day precision; session times are not available." />
    <Surface title="Season schedule"><ResourceBoundary state={state}>{calendar => <DataTable rows={calendar} rowKey={row => row.round} caption="Published calendar · season and as-of unverified" columns={[
      { key: 'round', label: 'Round', numeric: true, sortValue: row => row.round, render: row => <Num value={row.round} /> },
      { key: 'race', label: 'Grand Prix', sortValue: row => row.grandPrix, render: row => <span className="font-medium">{row.grandPrix}</span> },
      { key: 'date', label: 'Date', sortValue: row => row.date, render: row => <time className="whitespace-nowrap font-mono text-xs text-text-muted" dateTime={row.date}>{row.date}</time> },
      { key: 'sprint', label: 'Format', render: row => <Badge>{row.sprintWeekend ? 'Sprint' : 'Standard'}</Badge> },
      { key: 'status', label: 'Status', render: row => <Badge tone={row.status === 'in_progress' ? 'alert' : ['cancelled', 'postponed'].includes(row.status) ? 'warning' : 'neutral'}>{row.status.replace('_', ' ')}</Badge> },
    ]} />}</ResourceBoundary></Surface>
  </div>;
}
