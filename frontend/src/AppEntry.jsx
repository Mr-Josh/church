import { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, useLocation } from 'react-router-dom';
import './styles.css';
import './responsive.css';
import './hero-logo-fix.css';
import './hero-layout.css';
import AdminApp from './admin/AdminApp';
import DevApp from './dev/DevApp';
import PublicApp from './site/PublicApp';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function AppEntry() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isDevRoute = location.pathname.startsWith('/dev');

  if (isDevRoute) return <DevApp />;
  return isAdminRoute ? <AdminApp /> : <PublicApp />;
}

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <ScrollToTop />
    <AppEntry />
  </BrowserRouter>,
);
