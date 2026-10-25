import { useEffect, useState, useCallback } from 'react';
import { DataError } from '../client/fetchJson';
import type { Resource, ResourceState } from '../../domain/types/resource';
import { getManifest } from '../services';
export type { ResourceState } from '../../domain/types/resource';

export function useResource<T>(loader: (signal: AbortSignal) => Promise<Resource<T>>): ResourceState<T> {
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<{ loader: typeof loader; attempt: number; state: ResourceState<T> } | null>(null);
  const retry = useCallback(() => setAttempt(n => n + 1), []);
  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const manifest = await getManifest(controller.signal).catch(() => null);
        if (controller.signal.aborted) return;
        const resource = await loader(controller.signal);
        if (controller.signal.aborted) return;
        const isStale = !resource.meta.snapshotId || !resource.meta.generatedAt ||
          !manifest?.data.snapshotId || resource.meta.snapshotId !== manifest.data.snapshotId ||
          (manifest.meta.dataThrough !== null && manifest.meta.dataThrough !== resource.meta.dataThrough);
        setResult({ loader, attempt, state: { status: 'ready', ...resource,
          isPlaceholder: resource.meta.placeholder, isStale, manifestMissing: manifest === null,
        } });
      } catch (error: unknown) {
        if (!controller.signal.aborted) setResult({ loader, attempt, state: {
          status: 'error', error: error instanceof DataError ? error : new DataError('schema', error instanceof Error ? error.message : 'Invalid resource'), retry,
        } });
      }
    }
    void load();
    return () => controller.abort();
  }, [loader, attempt, retry]);
  return result?.loader === loader && result.attempt === attempt ? result.state : { status: 'loading' };
}
