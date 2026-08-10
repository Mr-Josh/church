import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { churchApi } from '../services/churchApi';
import './admin.css';
import './admin-refactor.css';

const navigation = [
  ['⌂', 'Dashboard', '/admin', 'dashboard'],
  ['◉', 'Demandes de prière', '/admin/prayer-requests', 'prayer-requests'],
  ['♡', "Demandes d’aide", '/admin/help-requests', 'help-requests'],
  ['▱', 'Témoignages', '/admin/testimonials', 'testimonials'],
  ['▤', 'Contenu du site', '/admin/content', 'content'],
  ['⌂', 'Informations de l’église', '/admin/settings', 'settings'],
];

export default function AdminLayout({ children, counts = {}, title, description, actions, active }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  useEffect(() => setMobileOpen(false), [location.pathname]);

  const logout = async () => { try { await churchApi.logout(); } finally { navigate('/admin/login', { replace: true }); } };

  return <div className="admin-shell">
    <button type="button" className="admin-mobile-toggle" aria-label={mobileOpen ? 'Fermer le menu' : 'Ouvrir le menu'} aria-expanded={mobileOpen} onClick={() => setMobileOpen(value => !value)}>☰</button>
    {mobileOpen && <button type="button" className="admin-sidebar-backdrop" aria-label="Fermer le menu" onClick={() => setMobileOpen(false)} />}
    <aside className={`admin-sidebar ${mobileOpen ? 'is-open' : ''}`}>
      <Link to="/" className="admin-brand"><span className="brand-mark">G+</span><span><strong>GOSPEL BREAK</strong><small>CHAIN MINISTRY</small></span></Link>
      <span className="sidebar-caption">ADMINISTRATION</span>
      <nav aria-label="Administration">
        {navigation.map(([icon, label, to, key]) => {
          const isActive = active ? active === key : (key === 'dashboard' ? location.pathname === '/admin' : location.pathname.startsWith(to));
          const badge = counts[key];
          return <Link className={`sidebar-link ${isActive ? 'active' : ''}`} key={to} to={to}><i aria-hidden="true">{icon}</i><span>{label}</span>{badge > 0 && <b>{badge}</b>}</Link>;
        })}
        <div className="sidebar-link disabled" aria-disabled="true" title="Le module de paiement sera connecté séparément"><i aria-hidden="true">▣</i><span>Dons & Offrandes</span><em>À venir</em></div>
      </nav>
      <button className="admin-logout" type="button" onClick={logout}><i aria-hidden="true">↪</i><span>Déconnexion</span></button>
      <div className="sidebar-verse"><span>“</span><p>Si donc le Fils vous affranchit, vous serez réellement libres.</p><strong>Jean 8:36</strong></div>
      <small className="sidebar-footer">© 2026 Gospel Break Chain Ministry</small>
    </aside>
    <main className="admin-main">
      {(title || actions) && <header className="admin-header"><div><p className="dashboard-eyebrow">ADMINISTRATION</p>{title && <h1>{title}</h1>}{description && <p>{description}</p>}</div><div className="admin-header-actions">{actions || <Link to="/admin" className="btn outline">← Dashboard</Link>}</div></header>}
      {children}
    </main>
  </div>;
}
