import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { lazy } from 'react';
import AppShell from './app/AppShell';
import NotFound from './app/NotFound';
import { routes, detailRoutes } from './config/routes';
const Methodology = lazy(() => import('./app/Methodology'));

export default function App() {
  return <BrowserRouter basename={import.meta.env.BASE_URL}><Routes><Route element={<AppShell />}>
    {routes.map(route => { const Page = route.component; return <Route key={route.path} path={route.path} element={<Page />} />; })}
    {detailRoutes.map(route => { const Page = route.component; return <Route key={route.path} path={route.path} element={<Page />} />; })}
    <Route path="/methodology" element={<Methodology />} />
    <Route path="*" element={<NotFound />} />
  </Route></Routes></BrowserRouter>;
}
