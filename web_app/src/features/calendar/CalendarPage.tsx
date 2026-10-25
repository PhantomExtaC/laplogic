import { Link, useSearchParams } from 'react-router-dom';
import { useCalendar } from '../../data/hooks/resources';
import { displaySession } from '../../domain/logic/snapshots';
import { Surface, SectionHeader } from '../../ui/Surface';
import { ResourceBoundary } from '../../ui/ResourceBoundary';
import { DataTable } from '../../ui/DataTable';
import { Badge, Num } from '../../ui/Indicators';
import { Select } from '../../ui/Controls';

export default function CalendarPage() {
  const state = useCalendar();
  const [params, setParams] = useSearchParams();
  const status = params.get('status') ?? 'all', season = params.get('season') ?? 'all', timezone = params.get('timezone') ?? 'local';
  const update = (key: string, value: string) => { const next = new URLSearchParams(params); next.set(key, value); setParams(next); };
  const seasons = state.status === 'ready' ? [...new Set(state.data.map(row => row.season))].sort((a, b) => b - a) : [];
  return <div className="page space-y-6"><SectionHeader title="Race calendar" level={1} kicker="LapLogic / Schedule" asOf="Published status flags are preserved. Dates without session times remain day-precision." />
    <Surface><div className="grid gap-4 sm:grid-cols-3"><Select label="Season" value={season} onChange={e => update('season', e.target.value)}><option value="all">All supplied seasons</option>{seasons.map(year => <option key={year} value={year}>{year}</option>)}</Select><Select label="Event status" value={status} onChange={e => update('status', e.target.value)}><option value="all">All events</option>{['upcoming', 'in_progress', 'completed', 'cancelled', 'postponed'].map(value => <option key={value} value={value}>{value.replace('_', ' ')}</option>)}</Select><Select label="Session timezone" value={timezone} onChange={e => update('timezone', e.target.value)}><option value="local">My local timezone</option><option value="track">Track timezone (when supplied)</option></Select></div><p className="mt-4 text-xs text-text-muted">Timezone conversion only applies to session instants. Track time stays unavailable if the export lacks its timezone. Calendar export is deferred until start times exist.</p></Surface>
    <Surface title="Season schedule"><ResourceBoundary state={state}>{calendar => <DataTable rows={calendar.filter(row => (season === 'all' || String(row.season) === season) && (status === 'all' || row.status === status))} rowKey={row => row.raceId} caption="Published calendar · stale status flags may include past-dated upcoming events" columns={[
      { key: 'round', label: 'Round', numeric: true, sortValue: row => row.round, render: row => <Num value={row.round} /> },
      { key: 'race', label: 'Grand Prix', render: row => <div><Link className="inline-flex min-h-11 items-center font-medium hover:text-red-400" to={`/race-hub?race=${encodeURIComponent(row.raceId)}`}>{row.grandPrix}</Link><p className="font-mono text-xs text-text-muted">{row.season} / {row.raceId}</p></div> },
      { key: 'date', label: 'Date', sortValue: row => row.date, render: row => <time className="whitespace-nowrap font-mono text-xs" dateTime={row.date}>{row.date}</time> },
      { key: 'format', label: 'Format / sessions', render: row => <div className="space-y-2"><Badge>{row.sprintWeekend ? 'Sprint' : 'Standard'}</Badge>{row.sessions.length ? row.sessions.map(session => <p key={session.name} className="text-xs">{session.name}: {timezone === 'track' && !row.timezone ? 'Track timezone unavailable' : displaySession(session.startsAt, timezone === 'track' ? row.timezone : null)}</p>) : <p className="text-xs text-text-muted">Times unavailable</p>}</div> },
      { key: 'status', label: 'Status', render: row => <Badge tone={row.status === 'in_progress' ? 'alert' : ['cancelled', 'postponed'].includes(row.status) ? 'warning' : 'neutral'}>{row.status.replace('_', ' ')}</Badge> },
      { key: 'audit', label: 'Audit', render: row => <Link className="inline-flex min-h-11 items-center text-xs text-text-muted hover:text-text" to={`/insights?race=${encodeURIComponent(row.raceId)}`}>Archive</Link> },
    ]} />}</ResourceBoundary></Surface>
  </div>;
}
