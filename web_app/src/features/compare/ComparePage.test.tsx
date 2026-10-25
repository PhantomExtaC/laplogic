// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { comparisonSchema } from '../../data/schemas/arena';
import ComparePage from './ComparePage';

vi.mock('../../charts/RadarCompare', () => ({ RadarCompare: () => <div>Accessible comparison chart</div> }));
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });
function fixture() {
  vi.stubGlobal('fetch', vi.fn(async (url: string) => new Response(readFileSync(resolve('public/data', url.split('/').at(-1) ?? ''), 'utf8').replaceAll('"placeholder": true', '"placeholder": false'))));
  return comparisonSchema.parse(JSON.parse(readFileSync('public/data/head_to_head.json', 'utf8'))).data;
}
it('guards equal-driver deep links while keeping controls usable', async () => {
  const data = fixture(), id = data.drivers[0].driverId;
  render(<MemoryRouter initialEntries={[`/compare?a=${id}&b=${id}`]}><ComparePage /></MemoryRouter>);
  expect(await screen.findByText('Choose two different drivers.')).toBeTruthy();
  expect(screen.queryByText('Accessible comparison chart')).toBeNull();
  expect(screen.getByLabelText('Driver A')).toBeTruthy();
});
it('withholds sparse metrics and keeps empty selections explicit', async () => {
  const data = fixture();
  render(<MemoryRouter initialEntries={[`/compare?a=${data.drivers[0].driverId}&b=${data.drivers.at(-1)?.driverId}`]}><ComparePage /></MemoryRouter>);
  expect((await screen.findAllByText('Insufficient sample')).length).toBeGreaterThan(0);
  expect(screen.getAllByLabelText('Unavailable').length).toBeGreaterThan(0);
  fireEvent.change(screen.getByLabelText('Driver A'), { target: { value: '' } });
  expect(screen.getByText('Choose two drivers present in this dataset.')).toBeTruthy();
});
