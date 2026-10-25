import { fetchJson } from '../client/fetchJson';
import { momentumSchema, seasonStatsSchema, stagesSchema } from '../schemas/core';
import { degradationSchema, insightsSchema, trackRegistrySchema } from '../schemas';
import { legacy, resolveDriver } from '../adapters';
import { getRegistry } from './index';
import { getDrivers } from '../../services/drivers';
import { getTeams } from '../../services/teams';
import { getTracks } from '../../services/tracks';
import { getDriverStandings, getConstructorStandings } from '../../services/standings';

export const getDriverDirectory = async (signal?: AbortSignal) => legacy(await getDrivers(signal));
export const getTeamDirectory = async (signal?: AbortSignal) => legacy(await getTeams(signal));
export const getTrackDirectory = async (signal?: AbortSignal) => legacy(await getTracks(signal));
export const getDriverStandingsResource = async (signal?: AbortSignal) => legacy(await getDriverStandings(signal));
export const getTeamStandingsResource = async (signal?: AbortSignal) => legacy(await getConstructorStandings(signal));
export const getSeasonStats = (signal?: AbortSignal) => fetchJson('data/season_stats.json', seasonStatsSchema, signal);
export const getStages = async (signal?: AbortSignal) => {
  const [resource, registry] = await Promise.all([fetchJson('data/prediction_stages.json', stagesSchema, signal), getRegistry(signal)]);
  return { ...resource, data: { ...resource.data, stages: resource.data.stages.map(stage => ({ ...stage,
    predictions: stage.predictions.map(row => ({ ...row, driverId: resolveDriver(row.driverId, registry.data) })),
  })) } };
};
export const getMomentum = async (signal?: AbortSignal) => {
  const [resource, registry, directory] = await Promise.all([
    fetchJson('data/momentum.json', momentumSchema, signal), getRegistry(signal), getDrivers(signal),
  ]);
  return { ...resource, data: { ...resource.data, drivers: resource.data.drivers.map(row => {
    const id = resolveDriver(row.driverId, registry.data);
    return { ...row, driverId: id, name: directory.find(driver => driver.id === id)?.fullName ?? id };
  }) } };
};
export const getTrackProfiles = async (signal?: AbortSignal) => {
  const [rows, registry] = await Promise.all([
    fetchJson('data/tracksDeg.json', degradationSchema, signal), fetchJson('data/track_registry.json', trackRegistrySchema, signal),
  ]);
  return legacy(rows.map(row => ({ ...row, trackId: registry.data.find(track => track.engineCircuitId === row.circuitId)?.canonicalId ?? null,
    definition: 'Legacy 1–5 index. Direction, sample window and pit-stop denominator are unconfirmed.',
  })));
};
export const getInsights = async (signal?: AbortSignal) => legacy((await fetchJson('data/insights.json', insightsSchema, signal)).map(row => ({
  ...row, higherIsBetter: { momentumIndex: null, racecraftIndex: null, mastery: null },
})));
