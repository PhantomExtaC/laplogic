import type { Driver } from '../domain/types/directories';
import { Surface } from './Surface';
import { Avatar } from './Avatar';
import { Badge, Stat } from './Indicators';
export default function DriverCard({ driver, teamName }: { driver: Driver; teamName: string }) {
  return <Surface><p className="kicker mb-3">Directory / season unverified</p><Avatar src={driver.image} name={driver.fullName} className="mb-5 h-48 w-full" />
    <div className="mb-2 flex items-start justify-between gap-3"><h2 className="text-xl font-semibold tracking-tight">{driver.fullName}</h2><Badge>#{driver.number}</Badge></div>
    <p className="text-sm text-text-muted">{teamName}</p>
    <div className="mt-5 grid grid-cols-2 gap-5 border-t border-line pt-5">
      <Stat label="Wins" value={driver.wins} scope="Career" /><Stat label="Podiums" value={driver.podiums} scope="Career" />
      <Stat label="Starts" value={driver.raceStarts} scope="Career" /><Stat label="Points" value={driver.currentPoints} scope="Directory season unverified" />
    </div>
  <p className="mt-4 text-xs text-text-muted">Directory as-of unavailable</p></Surface>;
}
