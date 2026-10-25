import { Suspense, useLayoutEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { ErrorBoundary } from './ErrorBoundary';
import { Skeleton } from '../ui/States';
import { routes } from '../config/routes';

function RouteContent() {
  const { pathname, hash } = useLocation();
  const main = useRef<HTMLElement>(null);
  useLayoutEffect(() => {
    const node = main.current;
    if (!node) return;
    const focusHeading = () => {
      if (hash) {
        const target = document.getElementById(decodeURIComponent(hash.slice(1)));
        if (target) { target.tabIndex = -1; target.focus(); target.scrollIntoView(); return true; }
      }
      const heading = node.querySelector('h1');
      if (!heading) return false;
      heading.tabIndex = -1;
      heading.focus({ preventScroll: true });
      return true;
    };
    const route = routes.find(row => row.path === pathname);
    document.title = `${route?.label ?? (pathname === '/methodology' ? 'Methodology' : 'Workspace')} — LapLogic`;
    window.scrollTo(0, 0);
    if (focusHeading()) return;
    const observer = new MutationObserver(() => { if (focusHeading()) observer.disconnect(); });
    observer.observe(node, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [pathname, hash]);
  return <main ref={main} id="main-content" tabIndex={-1} className="min-w-0 flex-1"><ErrorBoundary key={pathname}><Suspense fallback={<div className="page"><Skeleton label="Loading workspace…" /></div>}><Outlet /></Suspense></ErrorBoundary></main>;
}
export default function AppShell() {
  const location = useLocation();
  return <div className="flex min-h-screen flex-col"><a className="skip-link" href="#main-content">Skip to content</a><Navbar /><RouteContent key={location.pathname} /><Footer /></div>;
}
