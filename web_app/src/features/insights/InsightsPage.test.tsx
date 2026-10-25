// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { readFileSync } from 'node:fs';
import InsightsPage from './InsightsPage';
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });
it('deep-links to the original model and snapshot without loading the current evaluation', async () => {
 const requested: string[] = [];
 vi.stubGlobal('fetch', vi.fn(async (url: string) => {
  requested.push(url);
  const raw: unknown = JSON.parse(readFileSync(`public/${url.replace(/^\//, '')}`, 'utf8'));
  return { ok: true, json: async () => raw };
 }));
 render(<MemoryRouter initialEntries={['/insights/sample-projection-v1']}><Routes><Route path="/insights/:storyId" element={<InsightsPage />} /></Routes></MemoryRouter>);
 await screen.findByRole('heading', { name: 'A frozen projection' });
 await waitFor(() => expect(screen.getByRole('table')).toBeTruthy());
 expect(screen.getByRole('link', { name: 'Open original snapshot' }).getAttribute('href')).toContain('sample-2026-r8-pre-weekend');
 expect(document.title).toBe('A frozen projection — LapLogic');
 expect(document.head.querySelector('meta[property="og:type"]')?.getAttribute('content')).toBe('article');
 expect(requested.some(url => url.includes('evaluation'))).toBe(false);
 expect(screen.getAllByText('SAMPLE DATA').length).toBeGreaterThan(0);
 cleanup();
 expect(document.head.querySelector('meta[property="og:type"]')).toBeNull();
});
