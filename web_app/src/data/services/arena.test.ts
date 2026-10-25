import { afterEach, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { evaluationSchema } from '../schemas';
import { getEvaluation } from './index';
import { getFrozenSnapshot } from './arena';

afterEach(() => vi.unstubAllGlobals());
it('accepts a real versioned evaluation without depending on contradictory legacy runs', async () => {
  const resource = evaluationSchema.parse(JSON.parse(readFileSync('public/data/evaluation.json', 'utf8')));
  resource.meta.placeholder = false;
  resource.data.conflict = false;
  resource.data.championId = resource.data.models[0].id;
  const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify(resource)));
  vi.stubGlobal('fetch', fetcher);
  const result = await getEvaluation();
  expect(result.data.championId).toBe(resource.data.championId);
  expect(result.data.conflict).toBe(false);
  expect(fetcher).toHaveBeenCalledTimes(1);
});
it('rejects unsafe archive paths before fetching and mismatched identities after parsing', async () => {
  const fetcher = vi.fn(); vi.stubGlobal('fetch', fetcher);
  await expect(getFrozenSnapshot('../drivers')).rejects.toThrow();
  expect(fetcher).not.toHaveBeenCalled();
  const files = await import('node:fs');
  const first = files.readdirSync('public/data/snapshots')[0];
  fetcher.mockResolvedValue(new Response(readFileSync(`public/data/snapshots/${first}`, 'utf8')));
  await expect(getFrozenSnapshot('different-snapshot')).rejects.toThrow('Snapshot identity');
});
