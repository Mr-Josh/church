import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import DevDashboard from './DevDashboard';
import DevLayout from './DevLayout';
import DevUsers from './DevUsers';
import ProtectedDevRoute from './ProtectedDevRoute';
import './dev.css';

export default function DevApp() {
  return (
    <Routes>
      <Route element={<ProtectedDevRoute />}>
        <Route element={<DevLayout />}>
          <Route path="/dev" element={<DevDashboard />} />
          <Route path="/dev/users" element={<DevUsers />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/admin/login" replace />} />
    </Routes>
  );
}
