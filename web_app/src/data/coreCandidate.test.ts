import { expect, it } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import * as s from './schemas';
import { seasonStatsSchema } from './schemas/core';
const candidate = process.env.LAPLOGIC_CANDIDATE;
it.skipIf(!candidate)('validates every core candidate with the production contracts', () => {
 const schemas = { calendar: s.calendarSchema, drivers: s.driversSchema, teams: s.teamsSchema, tracks: s.tracksSchema, driver_standings: s.driverStandingsSchema, constructor_standings: s.constructorStandingsSchema, driver_registry: s.registrySchema, track_registry: s.trackRegistrySchema, asset_manifest: s.assetSchema, season_stats: seasonStatsSchema };
 const folder = candidate ?? '';
 expect(readdirSync(folder).sort()).toEqual(Object.keys(schemas).map(name => `${name}.json`).sort());
 for (const [name, schema] of Object.entries(schemas)) {
  const raw: unknown = JSON.parse(readFileSync(resolve(folder, `${name}.json`), 'utf8'));
  expect(() => schema.parse(raw)).not.toThrow();
 }
});
