import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { SimulationInput, SimulationProvider, SimulationResult } from '../../domain/types/simulation';
export function useSimulation(provider: SimulationProvider, input: SimulationInput) {
  const sequence = useRef(0), controller = useRef<AbortController | null>(null);
  const [state, setState] = useState<{ result: SimulationResult | null; busy: boolean; requestKey: string; error: string | null }>({ result: null, busy: false, requestKey: '', error: null });
  const key = JSON.stringify(input);
  const activeKey = useRef(key);
  useLayoutEffect(() => { if (activeKey.current !== key) { sequence.current++; controller.current?.abort(); } }, [key]);
  useEffect(() => () => { sequence.current++; controller.current?.abort(); }, []);
  async function run(next = input) {
    activeKey.current = JSON.stringify(next);
    controller.current?.abort(); controller.current = new AbortController();
    const signal = controller.current.signal, id = ++sequence.current;
    setState(previous => ({ ...previous, busy: true, requestKey: JSON.stringify(next), error: null }));
    try {
      const result = await provider.run({ ...next, signal });
      if (sequence.current === id && !signal.aborted) setState({ result, busy: false, requestKey: JSON.stringify(next), error: null });
    } catch (error: unknown) {
      if (sequence.current === id && !signal.aborted) setState(previous => ({ ...previous, busy: false, error: error instanceof Error ? error.message : 'Simulation unavailable.' }));
    }
  }
  const stale = state.result !== null && (state.error !== null || state.result.snapshotId !== input.snapshotId || state.result.driverId !== input.driverId || state.result.gridPenalty !== input.gridPenalty);
  // An input edit supersedes in-flight work immediately; obsolete work cannot commit.
  return { ...state, busy: state.busy && state.requestKey === key, stale, run };
}
