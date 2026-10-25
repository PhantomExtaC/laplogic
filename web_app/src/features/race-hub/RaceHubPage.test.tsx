// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import RaceHubPage from './RaceHubPage';
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });
it('uses one published view and ignores obsolete source/stage controls', async () => {
  vi.stubGlobal('fetch', vi.fn(async (url: string) => new Response(readFileSync(resolve('public/data', url.split('/').at(-1) ?? ''), 'utf8'))));
  const forecast = JSON.parse(readFileSync('public/data/predictions.json', 'utf8')) as { meta: { raceId: string } };
  render(<MemoryRouter initialEntries={[`/race-hub?race=${forecast.meta.raceId}&source=stages&stage=post-quali`]}><RaceHubPage /></MemoryRouter>);
  expect(await screen.findByText(/Provisional statistical baseline:/)).toBeTruthy();
  expect(screen.queryByLabelText('Prediction source')).toBeNull();
  expect(screen.queryByLabelText('Prediction stage')).toBeNull();
  expect(screen.getByRole('table', { name: /Published field/ })).toBeTruthy();
});
