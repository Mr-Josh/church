import React, { useEffect, useState } from 'react';
import { churchApi } from '../services/churchApi';

const emptyForm = { email: '', password: '', role: 'admin', is_active: true };

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const load = async () => {
    setLoading(true); setError('');
    try {
      const payload = await churchApi.admin.list('users');
      setUsers(Array.isArray(payload) ? payload : (payload.users || payload.data || []));
    } catch (err) { setError(err?.message || 'Impossible de charger les utilisateurs.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const create = async (event) => {
    event.preventDefault(); setSaving(true); setError(''); setMessage('');
    try {
      await churchApi.admin.create('users', form);
      setForm(emptyForm);
      setMessage('Utilisateur administrateur créé.');
      await load();
    } catch (err) { setError(err?.message || 'Impossible de créer cet utilisateur.'); }
    finally { setSaving(false); }
  };

  const toggle = async (user) => {
    setError('');
    try { await churchApi.admin.update('users', user.id, { is_active: user.is_active === false }); await load(); }
    catch (err) { setError(err?.message || 'Impossible de modifier le statut.'); }
  };

  return <div className="admin-users-page">
    <div className="admin-page-heading"><div><span>ACCÈS</span><h1>Utilisateurs</h1><p>Gérez les personnes qui administrent l’interface de l’église.</p></div></div>
    <div className="admin-users-grid">
      <form className="admin-users-form" onSubmit={create}>
        <h2>Ajouter un administrateur</h2>
        <p>Ce compte pourra administrer l’espace de l’église. Il ne pourra pas gérer les comptes développeur.</p>
        <label>Email<input type="email" required value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></label>
        <label>Mot de passe<input type="password" minLength="8" required value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/></label>
        <button className="btn primary" disabled={saving}>{saving ? 'Création...' : 'Créer le compte'}</button>
      </form>
      <section className="admin-users-list">
        <div className="admin-users-list-head"><strong>Comptes</strong><span>{users.length}</span></div>
        {loading ? <p>Chargement...</p> : users.length === 0 ? <p>Aucun compte.</p> : users.map(user => <article key={user.id ?? user.email}>
          <div><strong>{user.email || '—'}</strong><small>{user.role || 'admin'} · {user.is_active === false ? 'Désactivé' : 'Actif'}</small></div>
          <button type="button" onClick={()=>toggle(user)}>{user.is_active === false ? 'Activer' : 'Désactiver'}</button>
        </article>)}
      </section>
    </div>
    {message && <div className="admin-users-success">{message}</div>}
    {error && <div className="admin-users-error">{error}</div>}
  </div>;
}
