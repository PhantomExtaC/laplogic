// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { useState } from 'react';
import { Num, Delta } from './Indicators';
import { DataTable } from './DataTable';
import { Slider, Tabs } from './Controls';
import { Avatar } from './Avatar';
import { Surface } from './Surface';

afterEach(cleanup);

describe('numeric semantics', () => {
  it('distinguishes a measured zero from unavailable', () => {
    render(<><Num value={0} /><Num value={null} /><Num value={0.125} digits={3} /></>);
    expect(screen.getByText('0').textContent).toBe('0');
    expect(screen.getByLabelText('Unavailable').textContent).toBe('—');
    expect(screen.getByText('0.125').textContent).toBe('0.125');
  });
  it('shows pp units and a textual direction', () => {
    render(<><Delta before={0.1} after={0.15} /><Delta before={0.1} after={0.1} /><Delta before={null} after={0} /></>);
    expect(screen.getByText(/\+5.0 pp/)).toBeTruthy();
    expect(screen.getByText('improvement')).toBeTruthy();
    expect(screen.getByText('unchanged')).toBeTruthy();
    expect(screen.getByLabelText('Unavailable')).toBeTruthy();
  });
});

it('sorts table data in both directions with unavailable values last', () => {
  render(<DataTable caption="Sample observations" rows={[{ id: 'missing', n: null }, { id: 'high', n: 3 }, { id: 'zero', n: 0 }]} rowKey={row => row.id} columns={[{ key: 'id', label: 'ID', render: row => row.id }, { key: 'n', label: 'Value', sortValue: row => row.n, render: row => <Num value={row.n} /> }]} />);
  fireEvent.click(screen.getByRole('button', { name: 'Value' }));
  expect(screen.getAllByRole('row').slice(1).map(row => within(row).getAllByRole('cell')[0].textContent)).toEqual(['zero', 'high', 'missing']);
  fireEvent.click(screen.getByRole('button', { name: 'Value' }));
  expect(screen.getAllByRole('row').slice(1).map(row => within(row).getAllByRole('cell')[0].textContent)).toEqual(['high', 'zero', 'missing']);
  expect(screen.getByRole('columnheader', { name: 'Value' }).getAttribute('aria-sort')).toBe('descending');
  expect(screen.getByRole('region', { name: 'Sample observations' }).tabIndex).toBe(0);
});

it('supports keyboard tab selection and focus', () => {
  function Fixture() {
    const [value, setValue] = useState('first');
    return <Tabs label="Stages" value={value} onChange={setValue} tabs={[{ id: 'first', label: 'First', content: 'First view' }, { id: 'second', label: 'Second', content: 'Second view' }]} />;
  }
  render(<Fixture />);
  fireEvent.keyDown(screen.getByRole('tab', { name: 'First' }), { key: 'ArrowRight' });
  expect(screen.getByRole('tab', { name: 'Second' }).getAttribute('aria-selected')).toBe('true');
  expect(document.activeElement).toBe(screen.getByRole('tab', { name: 'Second' }));
  expect(screen.getByRole('tabpanel').textContent).toBe('Second view');
});

it('bounds numeric slider input and keeps its range input in sync', () => {
  const changed = vi.fn();
  render(<Slider label="Grid penalty" value={0} min={0} max={10} onChange={changed} />);
  fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '12' } });
  expect(changed).toHaveBeenLastCalledWith(10);
  fireEvent.change(screen.getByRole('slider'), { target: { value: '3' } });
  expect(changed).toHaveBeenLastCalledWith(3);
});

it('falls back accessibly when an avatar image fails', () => {
  render(<Avatar src="/unavailable.png" name="Test Driver" />);
  fireEvent.error(screen.getByRole('img', { name: 'Test Driver' }));
  expect(screen.getByRole('img', { name: 'Test Driver — image unavailable' })).toBeTruthy();
});

it('does not imply that a static card is live', () => {
  const { container } = render(<Surface title="Static export">Observed values</Surface>);
  expect(container.querySelector('.animate-pulse')).toBeNull();
  expect(screen.getByRole('heading', { name: 'Static export', level: 2 })).toBeTruthy();
});
