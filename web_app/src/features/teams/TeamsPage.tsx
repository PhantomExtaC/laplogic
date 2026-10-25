import { Link, useSearchParams } from 'react-router-dom';
import { useTeams, useDrivers, useTeamStandings, useMomentum } from '../../data/hooks/resources';
import { Surface, SectionHeader } from '../../ui/Surface';
import { ResourceBoundary } from '../../ui/ResourceBoundary';
import { SearchInput, Select } from '../../ui/Controls';
import { Num } from '../../ui/Indicators';
import { EmptyState } from '../../ui/States';
import TeamCard from '../../ui/TeamCard';

export default function TeamsPage() {
  const teams = useTeams(), drivers = useDrivers(), standings = useTeamStandings(), momentum = useMomentum();
  const [params, setParams] = useSearchParams();
  const q = params.get('q') ?? '', sort = params.get('sort') ?? 'points', archive = params.get('lineup') === 'archive';
  const update = (key: string, value: string) => { const next = new URLSearchParams(params); next.set(key, value); setParams(next, { replace: true }); };
  const points = (id: string) => standings.status === 'ready' ? standings.data.find(row => row.id === id)?.points ?? null : null;
  return <div className="page space-y-6"><SectionHeader title="Teams" level={1} kicker="LapLogic / Constructors" asOf="Season points from standings; wins, podiums and titles from career directory totals." />
    <Surface><div className="grid gap-4 sm:grid-cols-3"><SearchInput label="Search teams" value={q} onChange={value => update('q', value)} /><Select label="Sort teams" value={sort} onChange={e => update('sort', e.target.value)}><option value="points">Season standings points</option><option value="wins">Career wins</option><option value="name">Name</option></Select><label className="flex min-h-11 items-center gap-2 self-end"><input type="checkbox" checked={archive} onChange={e => update('lineup', e.target.checked ? 'archive' : 'current')} />Include archived teams</label></div></Surface>
    <ResourceBoundary state={standings}>{() => null}</ResourceBoundary><ResourceBoundary state={drivers}>{() => null}</ResourceBoundary>
    <ResourceBoundary state={teams}>{rows => {
      const filtered = rows.filter(row => (archive || row.active) && row.name.toLowerCase().includes(q.toLowerCase()));
      filtered.sort((a, b) => { if (sort === 'name') return a.name.localeCompare(b.name); const x = sort === 'wins' ? a.wins : points(a.id), y = sort === 'wins' ? b.wins : points(b.id); return x === null ? y === null ? 0 : 1 : y === null ? -1 : y - x; });
      return filtered.length ? <div className="grid items-start gap-6 md:grid-cols-2 xl:grid-cols-3">{filtered.map(team => <div key={team.id} className="space-y-3"><TeamCard team={team} drivers={drivers.status === 'ready' ? drivers.data.filter(driver => team.driverIds.includes(driver.id)) : []} /><div className="rounded-lg border border-line bg-charcoal p-4"><p className="mb-3 text-sm">Season standings <Num value={points(team.id)} unit="pts" /></p><nav aria-label={`${team.name} driver links`} className="flex flex-wrap gap-2">{team.driverIds.map(id => <Link key={id} className="button text-xs" to={`/drivers?driver=${encodeURIComponent(id)}&lineup=archive`}>{drivers.status === 'ready' ? drivers.data.find(row => row.id === id)?.fullName ?? `Unmatched: ${id}` : id}</Link>)}</nav></div></div>)}</div> : <EmptyState title="No matching teams" description="Adjust the search or archive filter." />;
    }}</ResourceBoundary>
    <Surface title="Roster momentum" kicker="Mean of matched drivers"><ResourceBoundary state={momentum}>{data => <div className="space-y-4"><p className="text-xs text-text-muted">Arithmetic mean of each listed driver's last value, only when all roster IDs resolve and their as-of rounds match. {data.definition}</p><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{teams.status === 'ready' && teams.data.filter(team => team.active).map(team => {
      const values = team.driverIds.map(id => data.drivers.find(row => row.driverId === id)?.points.at(-1));
      const valid = values.length > 0 && values.every(row => row?.momentum != null) && new Set(values.map(row => row?.round)).size === 1;
      const mean = valid ? values.reduce((sum, row) => sum + (row?.momentum ?? 0), 0) / values.length : null;
      return <div key={team.id} className="flex justify-between gap-4 rounded-lg border border-line p-3"><span>{team.name}</span><Num value={mean} digits={1} /></div>;
    })}</div></div>}</ResourceBoundary></Surface>
  </div>;
}
