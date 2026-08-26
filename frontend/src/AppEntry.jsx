import { createRoot } from 'react-dom/client';
import { BrowserRouter, useLocation } from 'react-router-dom';
import './styles.css';
import './typography.css';
import './motion.css';
import './responsive.css';
import './hero-logo-fix.css';
import './hero-layout.css';
import './public-layout.css';
import AdminApp from './admin/AdminApp';
import DevApp from './dev/DevApp';
import PublicApp from './site/PublicApp';

function AppEntry() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isDevRoute = location.pathname.startsWith('/dev');

  if (isDevRoute) return <DevApp />;
  return isAdminRoute ? <AdminApp /> : <PublicApp />;
}

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <AppEntry />
  </BrowserRouter>,
);
