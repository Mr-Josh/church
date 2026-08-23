import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import AdminLogin from './AdminLogin';
import AdminDashboard from './AdminDashboard';
import AdminResourcePage from './AdminResourcePage';
import AdminSettings from './AdminSettings';
import AdminRequestsPage from './AdminRequestsPage';
import AdminContentPage from './AdminContentPage';
import AdminUsers from './AdminUsers';
import AdminLayout from './AdminLayout';
import ProtectedAdminRoute from './ProtectedAdminRoute';
import AdminDonationsPage from './AdminDonationsPage';

export default function AdminApp() {
  return (
    <Routes>
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route element={<ProtectedAdminRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminDashboard />} />
          {/* <Route path="/admin/prayer-requests" element={<AdminRequestsPage resource="prayer-requests" />} /> */}
          {/* <Route path="/admin/help-requests" element={<AdminRequestsPage resource="help-requests" />} /> */}
          <Route path="/admin/testimonials" element={<AdminResourcePage resource="testimonials" />} />
          <Route path="/admin/donations" element={<AdminDonationsPage />} />
          {/* <Route path="/admin/content" element={<AdminContentPage />} /> */}
          {/* <Route path="/admin/ministries" element={<AdminResourcePage resource="ministries" />} /> */}
          {/* <Route path="/admin/programs" element={<AdminResourcePage resource="programs" />} /> */}
          {/* <Route path="/admin/events" element={<AdminResourcePage resource="events" />} /> */}
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/admin/login" replace />} />
    </Routes>
  );
}
