import { getDrivers, getTeams, getTracks } from './directories';
import { fetchJson } from '../client/fetchJson';
import { momentumSchema, seasonStatsSchema, stagesSchema, trackProfilesSchema } from '../schemas/core';
import { insightsSchema } from '../schemas';
import { legacy, resolveDriver } from '../adapters';
import { getRegistry } from './index';

export const getDriverDirectory = async (signal?: AbortSignal) => legacy(await getDrivers(signal));
export const getTeamDirectory = async (signal?: AbortSignal) => legacy(await getTeams(signal));
export const getTrackDirectory = async (signal?: AbortSignal) => legacy(await getTracks(signal));
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
export const getTrackProfiles = (signal?: AbortSignal) => fetchJson('data/track_profiles.json', trackProfilesSchema, signal);
export const getInsights = async (signal?: AbortSignal) => legacy((await fetchJson('data/insights.json', insightsSchema, signal)).map(row => ({
  ...row, higherIsBetter: { momentumIndex: null, racecraftIndex: null, mastery: null },
})));

export { getDriverStandingsResource, getTeamStandingsResource } from './directories';
