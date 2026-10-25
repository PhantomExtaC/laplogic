import { useEffect, useRef, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Activity, Menu, X } from 'lucide-react';
import { routes } from '../config/routes';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    const toggleButton = toggle.current;
    const background = document.querySelectorAll<HTMLElement>('main, footer, .skip-link');
    background.forEach(element => { element.inert = true; });
    document.body.style.overflow = 'hidden';
    const first = panel.current?.querySelector<HTMLButtonElement>('button');
    first?.focus();
    const closeOnDesktop = (event: MediaQueryListEvent) => { if (event.matches) setOpen(false); };
    const media = window.matchMedia('(min-width: 1024px)');
    media.addEventListener('change', closeOnDesktop);
    return () => {
      document.body.style.overflow = previousOverflow;
      media.removeEventListener('change', closeOnDesktop);
      background.forEach(element => { element.inert = false; });
      toggleButton?.focus();
    };
  }, [open]);

  const links = routes.map(route => <NavLink key={route.path} to={route.path} end={route.path === '/'} onClick={() => setOpen(false)} className={({ isActive }) => `flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm ${isActive ? 'bg-telemetry-red/10 font-semibold text-red-400' : 'text-text-muted hover:bg-charcoal-2 hover:text-text'}`}>{route.label}</NavLink>);

  return <header className="sticky top-0 z-40 border-b border-line bg-obsidian/95 backdrop-blur-md">
    <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
      <Link to="/" className="flex min-h-11 items-center gap-3" aria-label="LapLogic Home"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-telemetry-red text-white"><Activity size={21} aria-hidden="true" /></span><span className="text-xl font-bold tracking-tight">Lap<span className="text-text-muted">Logic</span></span></Link>
      <span className="hidden font-mono text-[11px] uppercase tracking-widest text-text-muted sm:block">Formula 1 / Prediction & analysis</span>
      <button ref={toggle} className="button lg:hidden" aria-label="Open navigation" aria-expanded={open} aria-controls="mobile-navigation" onClick={() => setOpen(true)}><Menu size={20} aria-hidden="true" /><span className="hidden sm:inline">Menu</span></button>
      <span className="hidden text-xs text-text-muted lg:block">Telemetry Terminal</span>
    </div>
    <nav aria-label="Primary navigation" className="mx-auto hidden max-w-7xl gap-1 px-6 pb-3 lg:flex">{links}</nav>
    {open && <div className="fixed inset-0 z-50 h-dvh bg-obsidian/80 lg:hidden" onClick={e => { if (e.target === e.currentTarget) setOpen(false); }}>
      <div ref={panel} id="mobile-navigation" role="dialog" aria-modal="true" aria-labelledby="navigation-title" className="ml-auto flex h-full w-full max-w-sm flex-col overflow-y-auto border-l border-line bg-charcoal p-5" onKeyDown={e => {
        if (e.key === 'Escape') { e.preventDefault(); setOpen(false); }
        if (e.key === 'Tab') {
          const focusable = panel.current?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])');
          if (!focusable?.length) return;
          const first = focusable[0], last = focusable[focusable.length - 1];
          if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
          else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
        }
      }}>
        <div className="mb-5 flex items-center justify-between"><h2 id="navigation-title" className="text-xl font-semibold">Workspace</h2><button className="button" aria-label="Close navigation" onClick={() => setOpen(false)}><X size={20} aria-hidden="true" /></button></div>
        <nav aria-label="Mobile navigation" className="space-y-1">{links}</nav>
      </div>
    </div>}
  </header>;
}
