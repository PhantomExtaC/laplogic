import { DataTable } from './DataTable';
import { Num } from './Indicators';
interface StandingRow { id: string; position: number; name: string; points: number; wins: number }
export default function StandingsTable({ title, rows }: { title: string; rows: StandingRow[] }) {
  return <DataTable rows={rows} rowKey={row => row.id} caption={`${title} · legacy export; as-of unavailable`} columns={[
    { key: 'position', label: 'Pos', render: row => <Num value={row.position} />, numeric: true, sortValue: row => row.position },
    { key: 'name', label: 'Name', render: row => row.name, sortValue: row => row.name },
    { key: 'points', label: 'Points', render: row => <Num value={row.points} />, numeric: true, sortValue: row => row.points },
    { key: 'wins', label: 'Wins', render: row => <Num value={row.wins} />, numeric: true, sortValue: row => row.wins },
  ]} />;
}
