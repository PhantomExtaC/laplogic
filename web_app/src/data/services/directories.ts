import { fetchJson } from '../client/fetchJson';
import { driversSchema, teamsSchema, tracksSchema, assetSchema, driverStandingsSchema, constructorStandingsSchema } from '../schemas';
import { adaptDriver, adaptTrack } from '../adapters/directories';

export async function getDrivers(signal?: AbortSignal) {
  const rows = await fetchJson('data/drivers.json', driversSchema, signal);
  return rows.map(adaptDriver);
}
export const getTeams = (signal?: AbortSignal) => fetchJson('data/teams.json', teamsSchema, signal);

export async function getTracks(signal?: AbortSignal) {
  const [rows, assets] = await Promise.all([
    fetchJson('data/tracks.json', tracksSchema, signal),
    fetchJson('data/asset_manifest.json', assetSchema, signal),
  ]);
  const available = new Set(assets.data);
  return rows.map(row => adaptTrack(row, available));
}
export const getDriverStandings = (signal?: AbortSignal) => fetchJson('data/driver_standings.json', driverStandingsSchema, signal);
export const getConstructorStandings = (signal?: AbortSignal) => fetchJson('data/constructor_standings.json', constructorStandingsSchema, signal);
