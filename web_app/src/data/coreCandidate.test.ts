import { expect, it } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import * as s from './schemas';
import { momentumSchema, seasonStatsSchema, trackProfilesSchema } from './schemas/core';
import { comparisonSchema } from './schemas/arena';
const candidate = process.env.LAPLOGIC_CANDIDATE;
it.skipIf(!candidate)('validates every core candidate with the production contracts', () => {
 const schemas = { calendar: s.calendarResourceSchema, drivers: s.driversSchema, teams: s.teamsSchema, tracks: s.tracksSchema, driver_standings: s.driverStandingsResourceSchema, constructor_standings: s.constructorStandingsResourceSchema, driver_registry: s.registrySchema, track_registry: s.trackRegistrySchema, asset_manifest: s.assetSchema, season_stats: seasonStatsSchema };
 const folder = candidate ?? '';
 const files = readdirSync(folder);
 expect(files.sort()).toEqual([...Object.keys(schemas).map(name => `${name}.json`), ...['momentum.json', 'manifest.json', 'head_to_head.json', 'track_profiles.json'].filter(name => files.includes(name))].sort());
 if (files.includes('track_profiles.json')) trackProfilesSchema.parse(JSON.parse(readFileSync(resolve(folder, 'track_profiles.json'), 'utf8')));
 if (files.includes('head_to_head.json')) comparisonSchema.parse(JSON.parse(readFileSync(resolve(folder, 'head_to_head.json'), 'utf8')));
 if (files.includes('manifest.json')) s.manifestSchema.parse(JSON.parse(readFileSync(resolve(folder, 'manifest.json'), 'utf8')));
 if (files.includes('momentum.json')) momentumSchema.parse(JSON.parse(readFileSync(resolve(folder, 'momentum.json'), 'utf8')));
 for (const [name, schema] of Object.entries(schemas)) {
  const raw: unknown = JSON.parse(readFileSync(resolve(folder, `${name}.json`), 'utf8'));
  expect(() => schema.parse(raw)).not.toThrow();
 }
});
