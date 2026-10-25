import { fetchJson, DataError } from '../client/fetchJson';
import { simulatorSchema, simulationResultSchema } from '../schemas/simulation';
import type { SimulationProvider, SimulationInput } from '../../domain/types/simulation';
import { features } from '../../config/features';
export const getSimulator = (signal?: AbortSignal) => fetchJson('data/simulator_scenarios.json', simulatorSchema, signal);
export class PlaceholderSimulationProvider implements SimulationProvider {
  async run(input: SimulationInput & { signal: AbortSignal }) {
    const resource = await getSimulator(input.signal);
    const result = resource.data.scenarios.find(row => row.snapshotId === input.snapshotId && row.driverId === input.driverId && row.gridPenalty === input.gridPenalty);
    if (!result) throw new DataError('unavailable', 'This driver or penalty is unavailable in sample mode. Choose another driver or reset.');
    return result;
  }
}
export class HttpSimulationProvider implements SimulationProvider {
  async run(input: SimulationInput & { signal: AbortSignal }) {
    // Backend integration point: a GET inference endpoint accepting these public parameters.
    const endpoint = import.meta.env.VITE_SIM_API_URL;
    if (!endpoint) throw new DataError('configuration', 'Simulation API is not configured.');
    const url = new URL(endpoint, window.location.origin);
    if (!['http:', 'https:'].includes(url.protocol)) throw new DataError('configuration', 'Simulation API must use HTTP or HTTPS.');
    url.searchParams.set('snapshotId', input.snapshotId); url.searchParams.set('driverId', input.driverId); url.searchParams.set('gridPenalty', String(input.gridPenalty));
    // The shared client supplies timeout, abort, HTTP and runtime schema validation.
    const result = await fetchJson(url.href, simulationResultSchema, input.signal);
    if (result.snapshotId !== input.snapshotId || result.driverId !== input.driverId || result.gridPenalty !== input.gridPenalty) throw new DataError('schema', 'Simulation response does not match the requested inputs.');
    return result;
  }
}
export const simulationProvider: SimulationProvider = features.simulationProvider === 'http' ? new HttpSimulationProvider() : new PlaceholderSimulationProvider();
