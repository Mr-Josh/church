import React from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { churchApi } from '../services/churchApi';

const links = [
  { to: '/dev', label: 'Vue générale', end: true },
  { to: '/dev/users', label: 'Utilisateurs' },
];

export default function DevLayout() {
  const navigate = useNavigate();

  const logout = async () => {
    try { await churchApi.logout(); } finally {
      sessionStorage.removeItem('church-auth-role');
      navigate('/admin/login', { replace: true });
    }
  };

  return (
    <div className="dev-shell">
      <aside className="dev-sidebar">
        <Link className="dev-brand" to="/dev">
          <span className="dev-brand-mark">&lt;/&gt;</span>
          <span>Developer Console</span>
        </Link>
        <nav className="dev-nav" aria-label="Administration technique">
          <p>CONSOLE</p>
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end}>{link.label}</NavLink>
          ))}
        </nav>
        <button className="dev-logout" type="button" onClick={logout}>Déconnexion</button>
      </aside>
      <main className="dev-main">
        <header className="dev-header">
          <div>
            <span>DEVELOPER CONSOLE</span>
            <h1>Administration technique</h1>
          </div>
          <div className="dev-status"><i /> Session développeur</div>
        </header>
        <section className="dev-content"><Outlet /></section>
      </main>
    </div>
  );
}
