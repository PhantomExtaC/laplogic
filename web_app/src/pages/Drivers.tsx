import { useResource } from '../data/hooks/useResource';
import { legacy } from '../data/adapters';
import { ResourceBoundary } from '../ui/ResourceBoundary';
import { Surface, SectionHeader } from '../ui/Surface';
import { Select } from '../ui/Controls';
import { useState, useMemo } from "react";

import DriverCard from "../components/cards/DriverCard";

import { getDrivers } from "../services/drivers";
import { getTeams } from "../services/teams";



const loadDrivers = async (signal: AbortSignal) => legacy(await getDrivers(signal));

const loadTeams = async (signal: AbortSignal) => legacy(await getTeams(signal));

export default function Drivers() {
  const driversState = useResource(loadDrivers);

  const teamsState = useResource(loadTeams);
  const teams = teamsState.status === 'ready' ? teamsState.data : [];
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  const [sortBy, setSortBy] = useState("alphabetical");

  const displayedDrivers = useMemo(() => {
  let filtered = driversState.status === 'ready' ? [...driversState.data] : [];

  // Filter
  if (showActiveOnly) {
    filtered = filtered.filter(driver => driver.active);
  }

  // Sort
  switch (sortBy) {
    case "alphabetical":
      filtered.sort((a, b) =>
        a.fullName.localeCompare(b.fullName)
      );
      break;

    case "winsAsc":
      filtered.sort((a, b) => a.wins - b.wins);
      break;

    case "winsDesc":
      filtered.sort((a, b) => b.wins - a.wins);
      break;

    default:
      break;
  }

  return filtered;
}, [driversState, showActiveOnly, sortBy]);

  return (
    <div className="page space-y-6">
      <SectionHeader title="Drivers" level={1} kicker="LapLogic / Directory" asOf="Directory export · season and as-of unverified" />
      <Surface>
      <div className="mb-6 flex flex-wrap gap-4">

  <label className="flex min-h-11 items-center gap-2">
    <input
      type="checkbox"
      checked={showActiveOnly}
      onChange={(e) => setShowActiveOnly(e.target.checked)}
    />
    Active Only
  </label>

  <Select label="Sort by"
    value={sortBy}
    onChange={(e) => setSortBy(e.target.value)}
  >
    <option value="alphabetical">
      Alphabetical (A-Z)
    </option>

    <option value="winsAsc">
      Race Wins (Ascending)
    </option>

    <option value="winsDesc">
      Race Wins (Descending)
    </option>
  </Select>

</div>
      </Surface>
      <ResourceBoundary state={teamsState}>{()=>null}</ResourceBoundary>
      <ResourceBoundary state={driversState}>{() => <>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {displayedDrivers.map((driver) => {
          const team = teams.find(
            (t) => t.id === driver.currentTeamId
          );



          return (
            <DriverCard
              key={driver.id}
              driver={driver}
              teamName={team?.name ?? "Unknown Team"}
            />
          );
        })}
      </div>
      </>}</ResourceBoundary>
    </div>
  );
}
