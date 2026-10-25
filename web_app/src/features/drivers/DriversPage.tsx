import { Link, useSearchParams } from 'react-router-dom';
import { useDrivers, useTeams, useDriverStandings, useMomentum } from '../../data/hooks/resources';
import { Surface, SectionHeader } from '../../ui/Surface';
import { ResourceBoundary } from '../../ui/ResourceBoundary';
import { SearchInput, Select } from '../../ui/Controls';
import { EmptyState } from '../../ui/States';
import { Badge, Num } from '../../ui/Indicators';
import { MomentumTicker } from '../../ui/MomentumTicker';
import DriverCard from '../../ui/DriverCard';

export default function DriversPage() {
  const drivers = useDrivers(), teams = useTeams(), standings = useDriverStandings(), momentum = useMomentum();
  const [params, setParams] = useSearchParams();
  const q = params.get('q') ?? '', team = params.get('team') ?? 'all', sort = params.get('sort') ?? 'points', archive = params.get('lineup') === 'archive';
  const picked = [...new Set((params.get('pick') ?? '').split(',').filter(Boolean))].slice(0, 2);
  const update = (key: string, value: string) => { const next = new URLSearchParams(params); next.set(key, value); if (key === 'q') next.delete('driver'); setParams(next, { replace: true }); };
  const points = (id: string) => standings.status === 'ready' ? standings.data.find(row => row.id === id)?.points ?? null : null;
  const form = (id: string) => momentum.status === 'ready' ? momentum.data.drivers.find(row => row.driverId === id)?.points.at(-1)?.momentum ?? null : null;
  return <div className="page space-y-6"><SectionHeader title="Drivers" level={1} kicker="LapLogic / Directory" asOf="Season standings and career totals keep separate scopes." actions={picked.length === 2 ? <Link className="button" to={`/compare?a=${encodeURIComponent(picked[0])}&b=${encodeURIComponent(picked[1])}`}>Compare selected drivers</Link> : <Badge>Select two to compare</Badge>} />
    <Surface><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><SearchInput label="Search drivers" value={q} onChange={value => update('q', value)} placeholder="Name or abbreviation" /><Select label="Team" value={team} onChange={e => update('team', e.target.value)}><option value="all">All teams</option>{teams.status === 'ready' && teams.data.map(row => <option key={row.id} value={row.id}>{row.name}</option>)}</Select><Select label="Sort by" value={sort} onChange={e => update('sort', e.target.value)}><option value="points">Season standings points</option><option value="momentum">Momentum (sample when labeled)</option><option value="wins">Career wins</option><option value="name">Name</option></Select><label className="flex min-h-11 items-center gap-2 self-end"><input type="checkbox" checked={archive} onChange={e => update('lineup', e.target.checked ? 'archive' : 'current')} />Include archived directory records</label></div><p className="mt-4 text-xs text-text-muted">Current lineup means active directory records. Missing standings points and form are unavailable, not zero. Filters are saved in the URL.</p></Surface>
    <Surface title="Driver standings context"><ResourceBoundary state={standings}>{() => <p className="text-xs text-text-muted">Points displayed below come from standings; directory card points retain their original scope.</p>}</ResourceBoundary></Surface>
    <ResourceBoundary state={teams}>{() => null}</ResourceBoundary>
    {sort === 'momentum' && <ResourceBoundary state={momentum}>{() => <p className="text-xs text-text-muted">Driver order uses the labeled momentum resource below; it is not a standings ranking.</p>}</ResourceBoundary>}
    <ResourceBoundary state={drivers}>{rows => {
      const filtered = rows.filter(row => (archive || row.active) && (team === 'all' || row.currentTeamId === team) && (!params.get('driver') || row.id === params.get('driver')) && `${row.fullName} ${row.abbreviation}`.toLowerCase().includes(q.toLowerCase()));
      filtered.sort((a, b) => { if (sort === 'name') return a.fullName.localeCompare(b.fullName); const x = sort === 'wins' ? a.wins : sort === 'momentum' ? form(a.id) : points(a.id), y = sort === 'wins' ? b.wins : sort === 'momentum' ? form(b.id) : points(b.id); return x === null ? y === null ? 0 : 1 : y === null ? -1 : y - x || a.fullName.localeCompare(b.fullName); });
      return filtered.length ? <div className="grid items-start gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{filtered.map(driver => <div key={driver.id} className="space-y-3"><DriverCard driver={driver} teamName={teams.status === 'ready' ? teams.data.find(row => row.id === driver.currentTeamId)?.name ?? `Unmatched team ID: ${driver.currentTeamId}` : 'Team resource unavailable'} /><div className="rounded-lg border border-line bg-charcoal p-4"><p className="text-xs text-text-muted">Season standings: <Num value={points(driver.id)} unit="pts" /></p><label className="mt-2 flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" aria-label={`Compare ${driver.fullName}`} checked={picked.includes(driver.id)} disabled={!picked.includes(driver.id) && picked.length === 2} onChange={e => update('pick', (e.target.checked ? [...picked, driver.id] : picked.filter(id => id !== driver.id)).join(','))} />Compare driver</label></div></div>)}</div> : <EmptyState title="No matching drivers" description="Adjust the search, team or archive filter." />;
    }}</ResourceBoundary>
    <Surface title="Momentum / five recorded races"><ResourceBoundary state={momentum}>{data => <MomentumTicker data={data} />}</ResourceBoundary></Surface>
  </div>;
}
