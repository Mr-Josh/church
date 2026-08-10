import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './styles.css';
import './responsive.css';
import './hero-logo-fix.css';
import AdminApp from './admin/AdminApp';
import PublicApp from './site/PublicApp';

function AppEntry() {
  const isAdminRoute = window.location.pathname.startsWith('/admin');
  return isAdminRoute ? <AdminApp /> : <PublicApp />;
}

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <AppEntry />
  </BrowserRouter>,
);
