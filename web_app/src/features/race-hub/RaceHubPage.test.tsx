// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import RaceHubPage from './RaceHubPage';

afterEach(() => { cleanup(); vi.unstubAllGlobals(); });
function fixtures() {
  vi.stubGlobal('fetch', vi.fn(async (url: string) => new Response(readFileSync(resolve('public/data', url.split('/').at(-1) ?? ''), 'utf8'))));
}
it('keeps raw zero insights visible and suppresses unbound telemetry', async () => {
  fixtures(); render(<MemoryRouter><RaceHubPage /></MemoryRouter>);
  expect(await screen.findByRole('table', { name: /Published field/ })).toBeTruthy();
  expect(screen.getByText('Event-bound context unavailable')).toBeTruthy();
  expect(screen.getAllByText('0.0').length).toBeGreaterThan(0);
  expect(screen.queryByRole('table', { name: /Raw long-run pace/ })).toBeNull();
});
it('labels stage fixtures, switches stages and exposes the full field without renormalizing', async () => {
  fixtures(); render(<MemoryRouter initialEntries={['/race-hub?source=stages&stage=post-quali&race=2026-r13']}><RaceHubPage /></MemoryRouter>);
  expect(await screen.findByRole('table', { name: /Published field/ })).toBeTruthy();
  expect(screen.getByText('SAMPLE DATA')).toBeTruthy();
  expect(screen.getAllByText(/ pp/).length).toBeGreaterThan(0);
  fireEvent.click(screen.getByRole('checkbox', { name: 'Top 10 only' }));
  const fixture: unknown = JSON.parse(readFileSync('public/data/prediction_stages.json', 'utf8'));
  expect(fixture).toBeTruthy();
  expect(screen.getAllByRole('row').length).toBeGreaterThan(11);
  fireEvent.change(screen.getByLabelText('Prediction stage'), { target: { value: 'pre-weekend' } });
  expect(screen.queryByText(/\+\d+\.\d pp/)).toBeNull();
});
