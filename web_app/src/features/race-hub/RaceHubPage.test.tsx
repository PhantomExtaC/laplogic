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
  render(<MemoryRouter initialEntries={['/race-hub?source=stages&stage=post-quali']}><RaceHubPage /></MemoryRouter>);
  expect(await screen.findByText('A verified forecast has not been published for this event yet.')).toBeTruthy();
  expect(screen.queryByLabelText('Prediction source')).toBeNull();
  expect(screen.queryByLabelText('Prediction stage')).toBeNull();
  expect(screen.queryByRole('table', { name: /Published field/ })).toBeNull();
});
