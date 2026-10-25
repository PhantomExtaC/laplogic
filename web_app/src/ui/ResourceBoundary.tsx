import type { ReactNode } from 'react';
import type { ResourceState } from '../domain/types/resource';
import { Skeleton, ErrorState, StaleBanner } from './States';
import { SampleDataChip } from './Indicators';

export function ResourceBoundary<T>({ state, children }: { state: ResourceState<T>; children: (data: T) => ReactNode }) {
  if (state.status === 'loading') return <Skeleton />;
  if (state.status === 'error') return <ErrorState message={state.error.message} retry={state.retry} />;
  return <>
    <div className="mb-4 flex flex-wrap items-center gap-3 text-xs text-text-muted">
      {state.isPlaceholder && <SampleDataChip />}
      <span>{state.meta.season === null ? 'Season unverified' : `Season ${state.meta.season}`}</span>
      <span>{state.meta.generatedAt ? `As of ${state.meta.generatedAt}` : 'As-of unavailable'}</span>
      {state.meta.raceId && <span>Event {state.meta.raceId}</span>}
      {state.meta.snapshotId && <span className="break-all">Snapshot {state.meta.snapshotId}</span>}
    </div>
    {import.meta.env.DEV && state.manifestMissing && <p className="mb-3 text-xs text-text-muted">No manifest — using per-file metadata.</p>}
    {state.isStale && <StaleBanner />}
    {children(state.data)}
  </>;
}
