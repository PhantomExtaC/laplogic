import { Component } from 'react';
import type { ReactNode } from 'react';
import { Surface, SectionHeader } from '../ui/Surface';

export class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    if (this.state.failed) return <div className="page" role="alert"><Surface><SectionHeader title="This view could not be displayed" level={1} /><p className="mb-5 text-text-muted">Reload the page to try again, or return to Home.</p><div className="flex flex-wrap gap-3"><button className="button" onClick={() => window.location.reload()}>Reload page</button><a className="button" href={import.meta.env.BASE_URL}>Back to Home</a></div></Surface></div>;
    return this.props.children;
  }
}
