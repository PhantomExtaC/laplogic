import { useResource } from '../data/hooks/useResource';
import { legacy } from '../data/adapters';
import { ResourceBoundary } from '../ui/ResourceBoundary';
import { Surface, SectionHeader } from '../ui/Surface';
import { Select } from '../ui/Controls';
import { useState, useMemo } from "react";

import TeamCard from "../components/cards/TeamCard";

import { getTeams } from "../services/teams";
import { getDrivers } from "../services/drivers";


const loadTeams = async (signal: AbortSignal) => legacy(await getTeams(signal));

const loadDrivers = async (signal: AbortSignal) => legacy(await getDrivers(signal));

export default function Teams() {
  const teamsState = useResource(loadTeams);

  const driversState = useResource(loadDrivers);
  const drivers = driversState.status === 'ready' ? driversState.data : [];
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  const [sortBy, setSortBy] = useState("alphabetical");


  const sortedTeams = useMemo(() => {
    let filteredTeams = teamsState.status === 'ready' ? [...teamsState.data] : [];

    // Filter
    if (showActiveOnly) {
      filteredTeams = filteredTeams.filter((team) => team.active);
    }

    // Sort
    return filteredTeams.sort((a, b) => {
      if (sortBy === "alphabetical") {
        return a.name.localeCompare(b.name);
      }
      if (sortBy === "wins") {
        // Sort from highest wins to lowest wins
        return b.wins - a.wins;
      }
      return 0;
    });
  }, [teamsState, showActiveOnly, sortBy]);

  return (
    <div className="page space-y-6">
      <SectionHeader title="Teams" level={1} kicker="LapLogic / Directory" asOf="Directory export · season and as-of unverified" />

      <Surface>
      <div className="mb-6 flex flex-wrap gap-4 items-center">
        <label className="flex min-h-11 items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={showActiveOnly}
            onChange={(e) => setShowActiveOnly(e.target.checked)}
            className="h-4 w-4 accent-telemetry-red"
          />
          <span>Active Only</span>
        </label>

        <Select label="Sort by"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="alphabetical">Alphabetical (A-Z)</option>
          <option value="wins">Most Race Wins</option>
        </Select>
      </div>

      {/* Grid Layout for Cards */}
      </Surface>
      <ResourceBoundary state={driversState}>{()=>null}</ResourceBoundary>
      <ResourceBoundary state={teamsState}>{() => <>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {sortedTeams.map((team) => {
          const teamDrivers = drivers.filter((driver) =>
            team.driverIds.includes(driver.id)
          );

          return (
            <TeamCard
              key={team.id}
              team={team}
              drivers={teamDrivers}
            />
          );
        })}
      </div>
      </>}</ResourceBoundary>
    </div>
  );
}
