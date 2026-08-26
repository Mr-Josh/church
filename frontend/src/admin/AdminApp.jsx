import { Navigate, Route, Routes } from 'react-router-dom';
import AdminLogin from './AdminLogin';
import AdminDashboard from './AdminDashboard';
import AdminResourcePage from './AdminResourcePage';
import AdminSettings from './AdminSettings';
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
          <Route path="/admin/testimonials" element={<AdminResourcePage resource="testimonials" />} />
          <Route path="/admin/donations" element={<AdminDonationsPage />} />
          <Route path="/admin/events" element={<AdminResourcePage resource="events" />} />
          <Route path="/admin/event-photos" element={<AdminResourcePage resource="event-photos" />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/admin/login" replace />} />
    </Routes>
  );
}
