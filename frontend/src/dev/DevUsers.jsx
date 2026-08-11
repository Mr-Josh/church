import React, { useEffect, useState } from 'react';
import { churchApi } from '../services/churchApi';

export default function DevUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    churchApi.admin.list('users')
      .then((payload) => {
        if (!mounted) return;
        const items = Array.isArray(payload) ? payload : (payload.users || payload.data || []);
        setUsers(items);
      })
      .catch((err) => mounted && setError(err?.message || 'Impossible de charger les utilisateurs.'))
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, []);

  return (
    <div className="dev-page">
      <div className="dev-page-heading"><div><span>ACCESS CONTROL</span><h2>Utilisateurs</h2><p>Consultez les comptes gérés par l'application.</p></div></div>
      {loading && <div className="dev-panel">Chargement des utilisateurs...</div>}
      {error && <div className="dev-error">{error}<small>Le backend doit exposer la ressource /admin/users avant que le CRUD puisse être utilisé.</small></div>}
      {!loading && !error && (
        <div className="dev-panel">
          <div className="dev-table-head"><strong>Comptes</strong><span>{users.length} utilisateur(s)</span></div>
          {users.length === 0 ? <p className="dev-empty">Aucun utilisateur retourné par l'API.</p> : (
            <div className="dev-table-wrap"><table><thead><tr><th>ID</th><th>Email</th><th>Rôle</th><th>Statut</th></tr></thead><tbody>
              {users.map((user) => <tr key={user.id ?? user.email}><td>{user.id ?? '—'}</td><td>{user.email ?? '—'}</td><td>{user.role ?? '—'}</td><td>{user.is_active === false ? 'Désactivé' : 'Actif'}</td></tr>)}
            </tbody></table></div>
          )}
        </div>
      )}
    </div>
  );
}
