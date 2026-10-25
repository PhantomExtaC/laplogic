import { useId } from 'react';
import { Num } from '../ui/Indicators';
export function Sparkline({ values, summary }: { values: { label: string; value: number | null }[]; summary: string }) {
  const id = useId();
  const numbers = values.flatMap(row => row.value === null ? [] : [row.value]);
  const min = Math.min(...numbers), max = Math.max(...numbers);
  const point = (value: number, i: number) => `${values.length > 1 ? i / (values.length - 1) * 96 + 2 : 50},${max === min ? 20 : 36 - (value - min) / (max - min) * 32}`;
  // Separate polylines preserve gaps rather than inventing missing observations.
  const paths: string[][] = [[]];
  values.forEach((row, i) => { if (row.value === null) paths.push([]); else paths[paths.length - 1].push(point(row.value, i)); });
  return <figure><figcaption id={id} className="text-xs text-text-muted">{summary}</figcaption>{numbers.length ? <svg viewBox="0 0 100 40" className="my-2 h-12 w-full text-sector-green" role="img" aria-labelledby={id}>{paths.map((path, i) => <polyline key={i} points={path.join(' ')} fill="none" stroke="currentColor" strokeWidth="1.5" />)}</svg> : <p className="py-3 text-xs text-text-muted">No observations</p>}<details><summary className="min-h-11 content-center text-xs text-text-muted">Values</summary><table className="w-full text-xs"><caption className="sr-only">{summary}</caption><thead><tr><th scope="col" className="text-left">Observation</th><th scope="col" className="text-right">Value</th></tr></thead><tbody>{values.map(row => <tr key={row.label}><td>{row.label}</td><td className="text-right"><Num value={row.value} digits={1} /></td></tr>)}</tbody></table></details></figure>;
}
