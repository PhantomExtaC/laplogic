// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import TracksPage from './TracksPage';
vi.mock('../../ui/TrackCard', () => ({ default: ({ track }: { track: { name: string } }) => <div data-testid="track-card">{track.name}</div> }));
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });
it('shows mapped calendar circuits even when another event lacks a profile', async () => {
  vi.stubGlobal('fetch', vi.fn(async (url: string) => new Response(readFileSync(resolve('public/data', url.split('/').at(-1) ?? ''), 'utf8'))));
  render(<MemoryRouter><TracksPage /></MemoryRouter>);
  expect((await screen.findAllByTestId('track-card')).length).toBeGreaterThan(0);
  expect(screen.queryByText('Calendar track mapping unavailable')).toBeNull();
  expect(screen.getByText(/Directory profile unavailable for:/)).toBeTruthy();
});
