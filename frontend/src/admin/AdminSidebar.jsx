import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { churchApi } from '../services/churchApi';
import { useBibleVerse } from '../useBibleVerse';

const navigation = [
  ['⌂', 'Dashboard', '/admin'],
  ['◉', 'Demandes de prière', '/admin/prayer-requests', 'prayer-requests'],
  ['♡', "Demandes d’aide", '/admin/help-requests', 'help-requests'],
  ['▱', 'Témoignages', '/admin/testimonials', 'testimonials'],
  ['▤', 'Contenu du site', '/admin/content'],
  ['⌘', 'Utilisateurs', '/admin/users'],
  ['⌂', 'Église', '/admin/settings'],
  ['⚙', 'Paramètres', null, null, 'À venir'],
];

export default function AdminSidebar({ open = false, onClose }) {
  const location = useLocation();
  const navigate = useNavigate();
  const verse = useBibleVerse(6000);
  const isActive = (to) => to === '/admin' ? location.pathname === '/admin' : Boolean(to && location.pathname.startsWith(to));
  const logout = async () => { try { await churchApi.logout(); } finally { navigate('/admin/login', { replace: true }); onClose?.(); } };

  return <>
    {open && <button className="admin-sidebar-overlay" aria-label="Fermer le menu" onClick={onClose} />}
    <aside className={`admin-sidebar ${open ? 'is-open' : ''}`}>
      <Link to="/" className="admin-brand" onClick={onClose}><span className="brand-mark">G+</span><span><strong>GOSPEL BREAK</strong><small>CHAIN MINISTRY</small></span></Link>
      <span className="sidebar-caption">ADMINISTRATION</span>
      <nav aria-label="Navigation de l’administration">
        {navigation.map(([icon, label, to, key, badgeLabel]) => !to
          ? <div className="sidebar-link disabled" key={label} aria-disabled="true"><i>{icon}</i><span>{label}</span><em>{badgeLabel}</em></div>
          : <Link key={label} className={`sidebar-link ${isActive(to) ? 'active' : ''}`} to={to} onClick={onClose} aria-current={isActive(to) ? 'page' : undefined}><i>{icon}</i><span>{label}</span>{key && <SidebarBadge resource={key} />}</Link>)}
      </nav>
      <button className="admin-logout" onClick={logout}><i>↪</i><span>Déconnexion</span></button>
      <div className="sidebar-verse" key={verse.id}><span>“</span><p>{verse.text}</p><strong>{verse.reference}</strong></div>
      <small className="sidebar-footer">© 2026 Gospel Break Chain Ministry</small>
    </aside>
  </>;
}

function SidebarBadge({ resource }) { return <span className="sidebar-badge-slot" data-resource={resource} aria-hidden="true" />; }
