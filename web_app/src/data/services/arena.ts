import { getDrivers, getDriverStandings } from './directories';
import { DataError, fetchJson } from '../client/fetchJson';
import { arenaHistorySchema, frozenSnapshotSchema, outcomeSchema, comparisonSchema, archiveIdSchema } from '../schemas/arena';
import { getRegistry } from './index';
import { resolveDriver } from '../adapters';

export const getArenaHistory = async (signal?: AbortSignal) => {
  const [resource, registry] = await Promise.all([fetchJson('data/arena_history.json', arenaHistorySchema, signal), getRegistry(signal)]);
  const canonical = (id: string | null) => id === null ? null : resolveDriver(id, registry.data);
  return { ...resource, data: { ...resource.data, races: resource.data.races.map(row => ({ ...row,
    outcomeWinner: canonical(row.outcomeWinner), results: row.results.map(result => ({ ...result, predictedWinner: canonical(result.predictedWinner) })),
  })) } };
};
export const getFrozenSnapshot = async (id: string, signal?: AbortSignal) => {
  const resource = await fetchJson(`data/snapshots/${archiveIdSchema.parse(id)}.json`, frozenSnapshotSchema, signal);
  if (resource.data.snapshotId !== id || resource.meta.snapshotId !== id || resource.meta.raceId !== resource.data.raceId) throw new DataError('schema', 'Snapshot identity does not match the requested immutable record');
  return resource;
};
export const getOutcome = async (id: string, signal?: AbortSignal) => {
  const resource = await fetchJson(`data/outcomes/${archiveIdSchema.parse(id)}.json`, outcomeSchema, signal);
  if (resource.data.outcomeId !== id || resource.meta.snapshotId !== id || resource.meta.raceId !== resource.data.raceId) throw new DataError('schema', 'Outcome identity does not match the requested immutable record');
  return resource;
};
export const getComparison = async (signal?: AbortSignal) => {
  const [resource, registry, drivers, standings] = await Promise.all([
    fetchJson('data/head_to_head.json', comparisonSchema, signal), getRegistry(signal), getDrivers(signal), getDriverStandings(signal),
  ]);
  return { ...resource, data: { ...resource.data, drivers: resource.data.drivers.map(row => {
    const canonicalId = resolveDriver(row.driverId, registry.data);
    return { ...row, driverId: canonicalId, name: drivers.find(driver => driver.id === canonicalId)?.fullName ?? standings.find(driver => driver.id === canonicalId)?.driverName ?? canonicalId };
  }) } };
};
export const getDriverNames = async (signal?: AbortSignal) => {
  const [drivers, standings] = await Promise.all([getDrivers(signal), getDriverStandings(signal)]);
  const names: Record<string, string> = {};
  for (const row of standings) names[row.id] = row.driverName;
  for (const row of drivers) names[row.id] = row.fullName;
  return names;
};
