import type { Team } from '../../types/team';
import type { Driver } from '../../types/driver';
import { Surface } from '../../ui/Surface';
import { Avatar } from '../../ui/Avatar';
import { Stat } from '../../ui/Indicators';
export default function TeamCard({ team, drivers }: { team: Team; drivers: Driver[] }) {
  const unmatched = team.driverIds.filter(id => !drivers.some(driver => driver.id === id));
  return <Surface><Avatar src={team.logo} name={team.name} className="mb-5 h-24 w-full" /><h2 className="text-xl font-semibold">{team.name}</h2><p className="mt-1 text-sm text-text-muted">{team.principal}</p>
    <div className="my-5 border-y border-line py-4"><p className="kicker mb-2">Listed roster</p><ul className="space-y-1 text-sm">{drivers.map(driver => <li key={driver.id}>{driver.fullName}</li>)}</ul>{unmatched.length > 0 && <p className="mt-2 text-xs text-drs-amber">Unresolved roster IDs: {unmatched.join(', ')}</p>}</div>
    <div className="grid grid-cols-2 gap-5"><Stat label="Wins" value={team.wins} scope="Career" /><Stat label="Podiums" value={team.podiums} scope="Career" /><Stat label="Titles" value={team.championships} scope="Career" /><Stat label="Points" value={team.points} scope="Directory season unverified" /></div>
  </Surface>;
}
