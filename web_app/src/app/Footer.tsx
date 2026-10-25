import { Link } from 'react-router-dom';
import { useResource } from '../data/hooks/useResource';
import { getManifest } from '../data/services';

export default function Footer() {
  const manifest = useResource(getManifest);
  const generatedAt = manifest.status === 'ready' ? manifest.meta.generatedAt : null;
  return <footer className="border-t border-line"><div className="mx-auto grid max-w-7xl gap-6 px-6 py-8 sm:grid-cols-2 lg:grid-cols-3">
    <div><Link className="inline-flex min-h-11 items-center text-lg font-semibold" to="/">LapLogic</Link><p className="text-xs text-text-muted">Formula 1, through the numbers.</p><p className="mt-3 text-xs text-text-muted">© {new Date().getFullYear()} LapLogic</p></div>
    <nav aria-label="Resources" className="flex flex-wrap items-start gap-x-5 gap-y-2 text-sm text-text-muted"><Link className="inline-flex min-h-11 items-center hover:text-text" to="/methodology">Methodology</Link><Link className="inline-flex min-h-11 items-center hover:text-text" to="/methodology#sources">Data sources</Link><Link className="inline-flex min-h-11 items-center hover:text-text" to="/insights">Audit archive</Link></nav>
    <div className="sm:col-span-2 lg:col-span-1"><p className="kicker mb-2">Dataset freshness</p><p className="text-xs text-text-muted">{generatedAt ? `Exported ${generatedAt}` : 'Unverified — export timestamps unavailable'}</p><p className="mt-2 text-xs text-text-muted">Historical exports are not a live feed.</p></div>
  </div></footer>;
}
