import { Stat } from './Indicators';
export function SeasonStats({ data }: { data: { seasonEntrants: number; currentLineup: number; teams: number; scheduledEvents: number; uniqueCircuits: number | null; completedRaces: number; scope: string } }) {
  return <><div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-6">
    <Stat label="Entrants" value={data.seasonEntrants} scope="Standings IDs" />
    <Stat label="Current lineup" value={data.currentLineup} scope="Active directory records" />
    <Stat label="Teams" value={data.teams} scope="Active team records" />
    <Stat label="Events" value={data.scheduledEvents} scope="Non-cancelled calendar rows" />
    <Stat label="Circuits" value={data.uniqueCircuits} scope="Unique calendar track IDs" />
    <Stat label="Completed" value={data.completedRaces} scope="Export status flags" />
  </div><p className="mt-5 text-xs text-text-muted">{data.scope}</p></>;
}
