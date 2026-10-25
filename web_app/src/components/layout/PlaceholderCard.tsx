import { Surface } from '../../ui/Surface';
import { EmptyState } from '../../ui/States';
export default function PlaceholderCard({ title }: { title: string }) { return <Surface><EmptyState title={title} description="This resource is not available yet." /></Surface>; }
