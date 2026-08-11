import React, { useState } from 'react';
import { useLocation, Outlet } from 'react-router-dom';
import AdminHeader, { pageMeta } from './AdminHeader';
import AdminSidebar from './AdminSidebar';
import './admin.css';
import './admin-layout.css';

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { pathname } = useLocation();
  const meta = pageMeta[pathname];
  const isDashboard = pathname === '/admin';

  return (
    <div className="admin-shell">
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="admin-main">
        <AdminHeader onMenu={() => setSidebarOpen(true)} />
        <div className={`admin-page-content ${isDashboard ? 'is-dashboard-content' : 'is-inner-page-content'}`}>
          {!isDashboard && meta && (
            <section className="admin-content-heading">
              <p className="admin-content-eyebrow">{meta[0]}</p>
              <h1>{meta[1]}</h1>
              <p>{meta[2]}</p>
            </section>
          )}
          <Outlet />
        </div>
      </main>
    </div>
  );
}
