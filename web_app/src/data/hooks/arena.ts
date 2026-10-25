import { useCallback } from 'react';
import { useResource } from './useResource';
import { getArenaHistory, getComparison, getFrozenSnapshot, getOutcome, getDriverNames } from '../services/arena';
import { legacy } from '../adapters';

export const useArenaHistory = () => useResource(getArenaHistory);
export const useComparison = () => useResource(getComparison);
const loadNames = async (signal: AbortSignal) => legacy(await getDriverNames(signal));
export const useDriverNames = () => useResource(loadNames);
export function useFrozenSnapshot(id: string) {
  return useResource(useCallback((signal: AbortSignal) => getFrozenSnapshot(id, signal), [id]));
}
export function useOutcome(id: string) {
  return useResource(useCallback((signal: AbortSignal) => getOutcome(id, signal), [id]));
}
