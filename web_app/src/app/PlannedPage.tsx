import { Link } from 'react-router-dom';
import { Surface, SectionHeader } from '../ui/Surface';
import { EmptyState } from '../ui/States';
import { Badge } from '../ui/Indicators';

export default function PlannedPage({ title, description }: { title: string; description: string }) {
  return <div className="page space-y-6"><SectionHeader title={title} level={1} kicker="LapLogic / Workspace" actions={<Badge>Not available yet</Badge>} /><Surface><EmptyState title="This workspace is being prepared" description={description} action={<Link className="button" to="/">Back to Home</Link>} /></Surface></div>;
}
