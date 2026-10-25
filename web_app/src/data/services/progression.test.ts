import { afterEach, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { getProgressionResource } from './index';

afterEach(() => vi.unstubAllGlobals());

it('resolves all progression IDs and preserves zero points using shipped exports', async () => {
  vi.stubGlobal('fetch', vi.fn(async (url: string) => {
    const name = url.split('/').at(-1);
    return new Response(readFileSync(resolve('public/data', name ?? ''), 'utf8'));
  }));
  const resource = await getProgressionResource();
  const registry: unknown = JSON.parse(readFileSync('public/data/driver_registry.json', 'utf8'));
  expect(registry).toBeTruthy();
  expect(resource.data.series.length).toBeGreaterThan(0);
  expect(resource.data.points[0].values.albon).toBe(0);
  expect(resource.data.series.find(row => row.id === 'tsunoda')?.label).toBeTruthy();
  expect(resource.data.points.every((row, index, rows) => index === 0 || row.x >= rows[index - 1].x)).toBe(true);
  for (const point of resource.data.points) {
    for (const id of Object.keys(point.values)) expect(resource.data.series.some(series => series.id === id)).toBe(true);
  }
});
