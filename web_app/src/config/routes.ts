import { lazy } from 'react';

export const routes = [
  { path: '/', label: 'Home', component: lazy(() => import('../features/home')) },
  { path: '/race-hub', label: 'Race Hub', component: lazy(() => import('../features/race-hub')) },
  { path: '/arena', label: 'Arena', component: lazy(() => import('../features/arena')) },
  { path: '/compare', label: 'Compare', component: lazy(() => import('../features/compare')) },
  { path: '/simulator', label: 'Simulator', component: lazy(() => import('../pages/Simulator')) },
  { path: '/insights', label: 'Insights', pending: 'The immutable stories and audit archive will be available in the Insights milestone.' },
  { path: '/drivers', label: 'Drivers', component: lazy(() => import('../features/drivers')) },
  { path: '/teams', label: 'Teams', component: lazy(() => import('../features/teams')) },
  { path: '/tracks', label: 'Tracks', component: lazy(() => import('../features/tracks')) },
  { path: '/calendar', label: 'Calendar', component: lazy(() => import('../features/calendar')) },
];

export const detailRoutes = [
  { path: '/arena/snapshots/:snapshotId', component: lazy(() => import('../features/arena')) },
  { path: '/arena/outcomes/:outcomeId', component: lazy(() => import('../features/arena')) },
];
