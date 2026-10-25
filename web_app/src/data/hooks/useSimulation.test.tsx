// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useState } from 'react';
import { readFileSync } from 'node:fs';
import { simulatorSchema } from '../schemas/simulation';
import type { SimulationInput, SimulationProvider, SimulationResult } from '../../domain/types/simulation';
import { useSimulation } from './useSimulation';
import { SimulatorForm } from '../../features/simulator/SimulatorForm';
const fixture = simulatorSchema.parse(JSON.parse(readFileSync('public/data/simulator_scenarios.json', 'utf8')));
const first = fixture.data.scenarios[0], second = fixture.data.scenarios[1];
function Harness({ provider }: { provider: SimulationProvider }) {
  const [input, setInput] = useState<SimulationInput>({ snapshotId: first.snapshotId, driverId: first.driverId, gridPenalty: 0 });
  const result = useSimulation(provider, input);
  return <><SimulatorForm input={input} events={fixture.data.events} drivers={fixture.data.drivers} busy={result.busy} onChange={setInput} onRun={() => void result.run()} onReset={() => { const next = { ...input, gridPenalty: 0 }; setInput(next); void result.run(next); }} /><p data-testid="status">{result.busy ? 'busy' : result.error ?? 'ready'}</p><p data-testid="result">{result.result?.gridPenalty ?? 'none'} / {result.stale ? 'stale' : 'current'}</p></>;
}
afterEach(cleanup);
describe('simulation request lifecycle', () => {
 it('ignores superseded responses even if a provider ignores abort; reset restores baseline', async () => {
  const pending: { resolve: (result: SimulationResult) => void; signal: AbortSignal }[] = [];
  const provider: SimulationProvider = { run: vi.fn<SimulationProvider['run']>(input => new Promise<SimulationResult>(resolve => pending.push({ resolve, signal: input.signal }))) };
  render(<Harness provider={provider} />);
  fireEvent.click(screen.getByText('Run scenario'));
  fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '1' } });
  expect(pending[0].signal.aborted).toBe(true);
  fireEvent.click(screen.getByText('Run scenario'));
  await act(async () => pending[1].resolve(second));
  expect(screen.getByTestId('result').textContent).toBe('1 / current');
  await act(async () => pending[0].resolve(first));
  expect(screen.getByTestId('result').textContent).toBe('1 / current');
  fireEvent.click(screen.getByText('Reset to baseline'));
  expect(screen.getByRole('spinbutton').getAttribute('value')).toBe('0');
  await act(async () => pending[2].resolve(first));
  expect(screen.getByTestId('result').textContent).toBe('0 / current');
 });
 it('marks edited inputs stale and preserves the previous result on failure', async () => {
  const provider = { run: vi.fn<SimulationProvider['run']>().mockResolvedValueOnce(first).mockRejectedValueOnce(new Error('Unavailable sample')) };
  render(<Harness provider={provider} />);
  fireEvent.click(screen.getByText('Run scenario'));
  await waitFor(() => expect(screen.getByTestId('result').textContent).toBe('0 / current'));
  fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '1' } });
  expect(screen.getByTestId('result').textContent).toBe('0 / stale');
  fireEvent.click(screen.getByText('Run scenario'));
  await waitFor(() => expect(screen.getByTestId('status').textContent).toBe('Unavailable sample'));
  expect(screen.getByTestId('result').textContent).toBe('0 / stale');
 });
});
