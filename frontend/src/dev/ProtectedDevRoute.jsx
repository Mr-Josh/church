import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

export default function ProtectedDevRoute() {
  const location = useLocation();
  const role = sessionStorage.getItem('church-auth-role');
  if (role !== 'developer') {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }
  return <Outlet />;
}
