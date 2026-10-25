import { Link } from 'react-router-dom';
import { Surface, SectionHeader } from '../ui/Surface';
import { EmptyState } from '../ui/States';

export default function NotFound() {
  return <div className="page"><SectionHeader title="Page not found" level={1} kicker="LapLogic / 404" /><Surface><EmptyState title="Outside the racing line" description="This address does not match a LapLogic page. Use the navigation or return to the prediction desk." action={<Link to="/" className="button">Back to Home</Link>} /></Surface></div>;
}
