import { lazy } from 'react';

export const routes = [
  { path: '/', label: 'Home', component: lazy(() => import('../features/home')) },
  { path: '/race-hub', label: 'Race Hub', component: lazy(() => import('../features/race-hub')) },
  { path: '/arena', label: 'Arena', pending: 'Versioned evaluation history will be available in the Arena milestone.' },
  { path: '/compare', label: 'Compare', pending: 'Driver comparison awaits normalized metrics and sample sizes in the comparison milestone.' },
  { path: '/simulator', label: 'Simulator', component: lazy(() => import('../pages/Simulator')) },
  { path: '/insights', label: 'Insights', pending: 'The immutable stories and audit archive will be available in the Insights milestone.' },
  { path: '/drivers', label: 'Drivers', component: lazy(() => import('../features/drivers')) },
  { path: '/teams', label: 'Teams', component: lazy(() => import('../features/teams')) },
  { path: '/tracks', label: 'Tracks', component: lazy(() => import('../features/tracks')) },
  { path: '/calendar', label: 'Calendar', component: lazy(() => import('../features/calendar')) },
];
