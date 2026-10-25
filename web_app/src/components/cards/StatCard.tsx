import { Surface } from '../../ui/Surface';
import { Stat } from '../../ui/Indicators';
export default function StatCard({ title, value }: { title: string; value: number | null }) { return <Surface><Stat label={title} value={value} scope="Scope unverified" /></Surface>; }
