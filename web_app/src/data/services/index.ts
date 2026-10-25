import { getDriverStandings } from './directories';
import {z} from 'zod';
import type {RaceEvent} from '../../domain/types/core';
import {teamColors, unknownTeamColor} from '../registry/teams';
import {fetchJson, DataError} from '../client/fetchJson';
import * as s from '../schemas';
import {legacy,resolveDriver} from '../adapters';
export const getManifest=(signal?:AbortSignal)=>fetchJson('data/manifest.json',s.manifestSchema,signal);
export const getRegistry=(signal?:AbortSignal)=>fetchJson('data/driver_registry.json',s.registrySchema,signal);
export const getCalendarResource = async (signal?: AbortSignal) => {
  const raw = await fetchJson('data/calendar.json', z.union([s.envelope(s.calendarSchema), s.calendarSchema]), signal);
  const resource = Array.isArray(raw) ? legacy(raw) : raw;
  const data: RaceEvent[] = resource.data.map(row => ({ ...row, season: row.season ?? Number(row.date.slice(0, 4)), raceId: row.raceId ?? `${row.date.slice(0, 4)}-r${row.round}` }));
  return { ...resource, data };
};
export const getWeekendResource = async (signal?: AbortSignal) => {
  const raw = await fetchJson('data/weekend_state.json', z.union([s.envelope(s.weekendSchema), s.weekendSchema]), signal);
  const resource = 'meta' in raw ? raw : legacy(raw);
  const registry = await getRegistry(signal);
  return { ...resource, data: { ...resource.data,
    weather: { airTemperature: resource.data.weather.airTemp, trackTemperature: resource.data.weather.trackTemp, ...resource.data.weather },
    telemetry: { ...resource.data.telemetry, longRunPace: resource.data.telemetry.longRunPace.map(row => ({ ...row, driverId: resolveDriver(row.driverId, registry.data) })) },
  } };
};
export const getPredictionsResource=async(signal?:AbortSignal)=>{const [rows,registry]=await Promise.all([fetchJson('data/predictions.json',z.union([s.envelope(s.predictionsSchema),s.predictionsSchema]),signal),getRegistry(signal)]);const resource=Array.isArray(rows)?legacy(rows):rows;if(!resource.meta.modelId || !resource.meta.snapshotId || !resource.meta.raceId)throw new DataError('unavailable','A verified forecast has not been published for this event yet.');return {...resource,data:resource.data.map(row=>({...row,driverId:resolveDriver(row.driverId,registry.data)}))};};
export const getEvaluation = async (signal?: AbortSignal) => {
  const canonical = await fetchJson('data/evaluation.json', s.evaluationSchema, signal);
  // A real versioned contract supersedes historical, unbound evaluation files.
  if (!canonical.meta.placeholder) return canonical;
  const [evaluation, arena] = await Promise.all([
    fetchJson('data/evaluation_metrics.json', s.legacyEvaluationSchema, signal), fetchJson('data/arena_metrics.json', s.arenaSchema, signal),
  ]);
  const normalize = (id: string) => id.toLowerCase().replace(/[^a-z]/g, '');
  const conflict = canonical.data.conflict || normalize(evaluation.champion) !== normalize(arena.champion) ||
    Object.entries(evaluation.models).some(([id, row]) => arena.models[id]?.winAccuracy !== row.winAccuracy);
  return { ...canonical, data: { ...canonical.data, conflict } };
};

export const getProgressionResource = async (signal?: AbortSignal) => {
  const [points, registry, drivers, standings] = await Promise.all([
    fetchJson('data/pointsProgression.json', s.progressionSchema, signal),
    getRegistry(signal), fetchJson('data/drivers.json', s.driversSchema, signal),
    getDriverStandings(signal),
  ]);
  const sorted = [...points].sort((a, b) => a.round - b.round);
  const ids = [...new Set(points.flatMap(row => Object.keys(row).filter(key => key !== 'round')))];
  const latest = sorted[sorted.length - 1];
  ids.sort((a, b) => (latest?.[b] ?? -Infinity) - (latest?.[a] ?? -Infinity));
  const series = ids.map(id => {
    const canonicalId = resolveDriver(id, registry.data);
    const driver = drivers.find(row => row.id === canonicalId);
    const standing = standings.find(row => row.id === canonicalId);
    if (!driver && !standing) throw new Error(`No driver label for ${canonicalId}`);
    return { id: canonicalId, label: driver?.fullName ?? standing?.driverName ?? canonicalId, color: teamColors[driver?.currentTeamId ?? standing?.currentTeamId ?? ''] ?? unknownTeamColor };
  });
  const rows = sorted.map(row => ({ x: row.round, values: Object.fromEntries(Object.entries(row).filter(([id]) => id !== 'round').map(([id, value]) => [resolveDriver(id, registry.data), value])) }));
  return legacy({ points: rows, series });
};
