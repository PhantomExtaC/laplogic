import { useState } from 'react';
import type { ReactNode } from 'react';
import { ArrowDown, ArrowUp, ChevronsUpDown } from 'lucide-react';
import { ScrollRegion } from './ScrollRegion';

export interface Column<T> { key: string; label: string; render: (row: T) => ReactNode; sortValue?: (row: T) => string | number | null; numeric?: boolean }
export function DataTable<T>({ rows, columns, rowKey, caption }: { rows: T[]; columns: Column<T>[]; rowKey: (row: T) => string | number; caption: string }) {
  const [sort, setSort] = useState<{ key: string; descending: boolean } | null>(null);
  const column = columns.find(c => c.key === sort?.key);
  const sorted = [...rows];
  if (column?.sortValue && sort) {
    const value = column.sortValue;
    sorted.sort((a, b) => {
      const x = value(a), y = value(b);
      if (x === null) return y === null ? 0 : 1;
      if (y === null) return -1;
      const order = typeof x === 'number' && typeof y === 'number' ? x - y : String(x).localeCompare(String(y));
      return sort.descending ? -order : order;
    });
  }
  return <ScrollRegion label={caption}><table className="w-full min-w-[480px] border-collapse text-left text-sm"><caption className="pb-4 text-left text-xs text-text-muted">{caption}</caption>
    <thead className="sticky top-0 z-10 bg-charcoal-2"><tr>{columns.map(c => <th key={c.key} scope="col" aria-sort={sort?.key === c.key ? sort.descending ? 'descending' : 'ascending' : undefined} className={`px-3 py-2 font-medium text-text-muted ${c.numeric ? 'text-right' : ''}`}>
      {c.sortValue ? <button className="inline-flex min-h-11 items-center gap-2" onClick={() => setSort({ key: c.key, descending: sort?.key === c.key && !sort.descending })}>{c.label}{sort?.key === c.key ? sort.descending ? <ArrowDown size={12} /> : <ArrowUp size={12} /> : <ChevronsUpDown size={12} />}</button> : c.label}
    </th>)}</tr></thead><tbody>{sorted.map(row => <tr key={rowKey(row)} className="border-b border-line last:border-0 hover:bg-charcoal-2/60">{columns.map(c => <td key={c.key} className={`px-3 py-3 ${c.numeric ? 'text-right font-mono' : ''}`}>{c.render(row)}</td>)}</tr>)}</tbody>
  </table>{rows.length === 0 && <p className="py-6 text-text-muted">No rows available.</p>}</ScrollRegion>;
}
