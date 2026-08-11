import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { churchApi } from '../services/churchApi';

export default function ProtectedAdminRoute() {
  const location = useLocation();
  const [state, setState] = useState('checking');

  useEffect(() => {
    let mounted = true;
    churchApi.admin.dashboard()
      .then(() => mounted && setState('authenticated'))
      .catch(() => mounted && setState('unauthenticated'));
    return () => { mounted = false; };
  }, []);

  if (state === 'checking') {
    return <main className="admin-auth-loading"><p>Vérification de la session...</p></main>;
  }

  if (state === 'unauthenticated') {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
