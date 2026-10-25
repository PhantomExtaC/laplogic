import { lazy } from 'react';

export const routes = [
  { path: '/', label: 'Home', component: lazy(() => import('../pages/Home')) },
  { path: '/race-hub', label: 'Race Hub', component: lazy(() => import('../pages/RaceHub')) },
  { path: '/arena', label: 'Arena', pending: 'Versioned evaluation history will be available in the Arena milestone.' },
  { path: '/compare', label: 'Compare', pending: 'Driver comparison awaits normalized metrics and sample sizes in the comparison milestone.' },
  { path: '/simulator', label: 'Simulator', component: lazy(() => import('../pages/Simulator')) },
  { path: '/insights', label: 'Insights', pending: 'The immutable stories and audit archive will be available in the Insights milestone.' },
  { path: '/drivers', label: 'Drivers', component: lazy(() => import('../pages/Drivers')) },
  { path: '/teams', label: 'Teams', component: lazy(() => import('../pages/Teams')) },
  { path: '/tracks', label: 'Tracks', component: lazy(() => import('../pages/Tracks')) },
  { path: '/calendar', label: 'Calendar', component: lazy(() => import('../pages/Calendar')) },
];
