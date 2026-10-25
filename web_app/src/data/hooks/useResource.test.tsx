// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest';
import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { useResource } from './useResource';
import { legacy } from '../adapters';
import type { Resource } from '../../domain/types/resource';

vi.mock('../services', () => ({ getManifest: vi.fn(async () => null) }));
afterEach(cleanup);
it('withholds sample values from the final UI', async () => {
  const loader = async () => ({ ...legacy('dummy'), meta: { ...legacy('dummy').meta, placeholder: true } });
  const hook = renderHook(() => useResource(loader));
  await waitFor(() => expect(hook.result.current.status).toBe('error'));
  expect(hook.result.current).toMatchObject({ status: 'error', error: { kind: 'unavailable' } });
});
it('discards superseded responses and never presents an old loader result as current', async () => {
  let first: ((value: Resource<string>) => void) | undefined;
  const older = () => new Promise<Resource<string>>(resolve => { first = resolve; });
  const newer = async () => legacy('new');
  const hook = renderHook(({ loader }) => useResource(loader), { initialProps: { loader: older } });
  await waitFor(() => expect(first).toBeTruthy());
  hook.rerender({ loader: newer });
  expect(hook.result.current.status).toBe('loading');
  await waitFor(() => expect(hook.result.current.status).toBe('ready'));
  await act(async () => first?.(legacy('old')));
  expect(hook.result.current.status === 'ready' && hook.result.current.data).toBe('new');
});
