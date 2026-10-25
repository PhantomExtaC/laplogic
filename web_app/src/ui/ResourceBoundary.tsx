import type { ReactNode } from 'react';
import type { ResourceState } from '../domain/types/resource';
import { Skeleton, ErrorState, EmptyState } from './States';
import { SampleDataChip } from './Indicators';
import { DataError } from '../data/client/fetchJson';

export function ResourceBoundary<T>({ state, children }: { state: ResourceState<T>; children: (data: T) => ReactNode }) {
  if (state.status === 'loading') return <Skeleton />;
  if (state.status === 'error') return state.error instanceof DataError && state.error.kind === 'unavailable' ? <EmptyState title="Data coming soon" description={state.error.message} /> : <ErrorState message={state.error.message} retry={state.retry} />;
  return <>
    <div className="mb-4 flex flex-wrap items-center gap-3 text-xs text-text-muted">
      {state.isPlaceholder && <SampleDataChip />}
      {state.meta.season !== null && <span>Season {state.meta.season}</span>}
      <span>{state.meta.dataThrough ? `Results through ${state.meta.dataThrough.slice(0, 10)}` : 'Historical directory · update date unavailable'}</span>
      {state.meta.raceId && <span>Event {state.meta.raceId}</span>}
    </div>
    {import.meta.env.DEV && state.manifestMissing && <p className="mb-3 text-xs text-text-muted">No manifest — using per-file metadata.</p>}
    {state.isStale && state.meta.dataThrough && <p className="mb-3 text-xs text-text-muted">Coverage differs from the latest published release.</p>}
    {children(state.data)}
  </>;
}
