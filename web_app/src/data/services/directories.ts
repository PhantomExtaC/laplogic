import { legacy } from '../adapters';
import { fetchJson } from '../client/fetchJson';
import { driversSchema, teamsSchema, tracksSchema, assetSchema, driverStandingsResourceSchema, constructorStandingsResourceSchema } from '../schemas';
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
export async function getDriverStandingsResource(signal?: AbortSignal) {
  const raw = await fetchJson('data/driver_standings.json', driverStandingsResourceSchema, signal);
  return Array.isArray(raw) ? legacy(raw) : raw;
}
export async function getTeamStandingsResource(signal?: AbortSignal) {
  const raw = await fetchJson('data/constructor_standings.json', constructorStandingsResourceSchema, signal);
  return Array.isArray(raw) ? legacy(raw) : raw;
}
export const getDriverStandings = async (signal?: AbortSignal) => (await getDriverStandingsResource(signal)).data;
export const getConstructorStandings = async (signal?: AbortSignal) => (await getTeamStandingsResource(signal)).data;
