// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Navbar from './Navbar';
import { routes } from '../config/routes';

beforeEach(() => {
  vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }));
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

it('consumes the route registry and links the brand to Home', () => {
  render(<MemoryRouter><Navbar /></MemoryRouter>);
  expect(screen.getByRole('link', { name: 'LapLogic Home' }).getAttribute('href')).toBe('/');
  for (const route of routes) expect(screen.getByRole('link', { name: route.label }).getAttribute('href')).toBe(route.path);
});

it('traps mobile focus, restores background access and closes with Escape', () => {
  render(<MemoryRouter><Navbar /><main>Workspace</main><footer>Footer</footer></MemoryRouter>);
  const toggle = screen.getByRole('button', { name: 'Open navigation' });
  fireEvent.click(toggle);
  expect(toggle.getAttribute('aria-expanded')).toBe('true');
  const close = screen.getByRole('button', { name: 'Close navigation' });
  expect(document.activeElement).toBe(close);
  expect(screen.getByRole('main').inert).toBe(true);
  fireEvent.keyDown(close, { key: 'Tab', shiftKey: true });
  expect(document.activeElement?.textContent).toBe('Calendar');
  fireEvent.keyDown(document.activeElement!, { key: 'Tab' });
  expect(document.activeElement).toBe(close);
  fireEvent.keyDown(close, { key: 'Escape' });
  expect(screen.queryByRole('dialog')).toBeNull();
  expect(toggle.getAttribute('aria-expanded')).toBe('false');
  expect(document.activeElement).toBe(toggle);
  expect(screen.getByRole('main').inert).toBe(false);
});
