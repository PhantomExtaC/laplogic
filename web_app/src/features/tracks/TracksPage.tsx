import { Link, useSearchParams } from 'react-router-dom';
import { useTracks, useCalendar, useTrackProfiles } from '../../data/hooks/resources';
import { Surface, SectionHeader } from '../../ui/Surface';
import { ResourceBoundary } from '../../ui/ResourceBoundary';
import { SearchInput, Select, Tabs } from '../../ui/Controls';
import { EmptyState } from '../../ui/States';
import { Num } from '../../ui/Indicators';
import TrackCard from '../../ui/TrackCard';

export default function TracksPage() {
  const tracks = useTracks(), calendar = useCalendar(), profiles = useTrackProfiles();
  const [params, setParams] = useSearchParams();
  const q = params.get('q') ?? '', country = params.get('country') ?? 'all', type = params.get('type') ?? 'all', sort = params.get('sort') ?? 'name', view = params.get('view') ?? 'calendar';
  const update = (key: string, value: string) => { const next = new URLSearchParams(params); next.set(key, value); setParams(next, { replace: true }); };
  const countries = tracks.status === 'ready' ? [...new Set(tracks.data.map(row => row.country))].sort() : [];
  const types = tracks.status === 'ready' ? [...new Set(tracks.data.flatMap(row => row.circuitType ? [row.circuitType] : []))].sort() : [];
  const knownCalendar = calendar.status === 'ready' && calendar.data.some(row => row.trackId !== null);
  const unmapped = calendar.status === 'ready' ? calendar.data.filter(row => row.trackId === null) : [];
  const content = <ResourceBoundary state={tracks}>{rows => {
    if (view === 'calendar' && !knownCalendar) return <EmptyState title="Calendar track mapping unavailable" description="The calendar export does not supply track IDs. Historical active flags are not used as a substitute for current-calendar membership." />;
    const filtered = rows.filter(row => row.name.toLowerCase().includes(q.toLowerCase()) && (country === 'all' || row.country === country) && (type === 'all' || row.circuitType === type) && (view !== 'calendar' || calendar.status === 'ready' && calendar.data.some(event => event.trackId === row.id)));
    filtered.sort((a, b) => { if (sort === 'name') return a.name.localeCompare(b.name); if (a.lengthKm === null) return b.lengthKm === null ? 0 : 1; if (b.lengthKm === null) return -1; return sort === 'lengthAsc' ? a.lengthKm - b.lengthKm : b.lengthKm - a.lengthKm; });
    return filtered.length ? <div className="grid items-start gap-6 md:grid-cols-2 xl:grid-cols-3">{filtered.map(track => {
      const event = calendar.status === 'ready' ? calendar.data.find(row => row.trackId === track.id) : null;
      return <div key={track.id} className="space-y-3"><TrackCard track={track} /><Surface>{event && <Link className="button text-xs" to={`/race-hub?race=${encodeURIComponent(event.raceId)}`}>Open race profile</Link>}<ResourceBoundary state={profiles}>{data => {
        const profile = data.find(row => row.trackId === track.id);
        return profile ? <div className="space-y-2 text-sm"><p>Pole-to-win: <Num value={profile.poleToWin === null ? null : profile.poleToWin * 100} digits={0} unit="%" /></p><p className="text-xs text-text-muted">{profile.poleWins} wins / {profile.poleStarts} identified pole starts · {profile.sampleCount} recorded races</p><p className="text-xs text-text-muted">{profile.fromDate && profile.toDate ? `${profile.fromDate} to ${profile.toDate}` : 'No recorded races in this season yet.'}</p><p className="text-xs text-text-muted">{profile.definition}</p></div> : <p className="text-xs text-text-muted">No circuit observations in this export.</p>;
      }}</ResourceBoundary></Surface></div>;
    })}</div> : <EmptyState title="No matching circuits" description="Adjust the country, type or search filter." />;
  }}</ResourceBoundary>;
  return <div className="page space-y-6"><SectionHeader title="Tracks" level={1} kicker="LapLogic / Circuit directory" asOf="Historical participation, current-calendar membership and degradation retain separate scopes." />
    <Surface><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><SearchInput label="Search circuits" value={q} onChange={value => update('q', value)} /><Select label="Country" value={country} onChange={e => update('country', e.target.value)}><option value="all">All countries</option>{countries.map(value => <option key={value}>{value}</option>)}</Select><Select label="Circuit type" value={type} onChange={e => update('type', e.target.value)}><option value="all">All types</option>{types.map(value => <option key={value}>{value}</option>)}</Select><Select label="Sort circuits" value={sort} onChange={e => update('sort', e.target.value)}><option value="name">Name</option><option value="lengthAsc">Shortest first</option><option value="lengthDesc">Longest first</option></Select></div></Surface>
    <ResourceBoundary state={calendar}>{() => null}</ResourceBoundary>
    {view === 'calendar' && unmapped.length > 0 && <p className="text-sm text-text-muted">Directory profile unavailable for: {unmapped.map(row => row.grandPrix).join(', ')}. Other calendar circuits are shown below.</p>}
    <Tabs label="Circuit scope" value={view} onChange={value => update('view', value)} tabs={[{ id: 'calendar', label: 'Current calendar', content: view === 'calendar' ? content : null }, { id: 'archive', label: 'Historical directory', content: view === 'archive' ? content : null }]} />
  </div>;
}
