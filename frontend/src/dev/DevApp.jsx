import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import DevDashboard from './DevDashboard';
import DevLayout from './DevLayout';
import DevUsers from './DevUsers';
import DevDatabase from './DevDatabase';
import DevSecurity from './DevSecurity';
import DevAudit from './DevAudit';
import DevSystem from './DevSystem';
import DevDiagnostics from './DevDiagnostics';
import DevSession from './DevSession';
import ProtectedDevRoute from './ProtectedDevRoute';
import './dev.css';

export default function DevApp() {
  return <Routes><Route element={<ProtectedDevRoute />}><Route element={<DevLayout />}>
    <Route path="/dev" element={<DevDashboard />} />
    <Route path="/dev/users" element={<DevUsers />} />
    <Route path="/dev/database" element={<DevDatabase />} />
    <Route path="/dev/system" element={<DevSystem />} />
    <Route path="/dev/security" element={<DevSecurity />} />
    <Route path="/dev/session" element={<DevSession />} />
    <Route path="/dev/audit" element={<DevAudit />} />
    <Route path="/dev/diagnostics" element={<DevDiagnostics />} />
  </Route></Route><Route path="*" element={<Navigate to="/admin/login" replace />} /></Routes>;
}
