import React, { useEffect, useState } from 'react';
import { churchApi } from '../services/churchApi';

const emptyForm = { email: '', password: '', role: 'developer', is_active: true };

export default function DevUsers() {
  const [users, setUsers] = useState([]), [form, setForm] = useState(emptyForm), [loading, setLoading] = useState(true), [saving, setSaving] = useState(false), [error, setError] = useState(''), [message, setMessage] = useState('');
  const load = async () => { setLoading(true); setError(''); try { const payload = await churchApi.admin.list('users'); const items = Array.isArray(payload) ? payload : (payload.users || payload.data || []); setUsers(items.filter(user => ['developer','dev'].includes(String(user.role || '').toLowerCase()))); } catch (err) { setError(err?.message || 'Impossible de charger les développeurs.'); } finally { setLoading(false); } };
  useEffect(() => { load(); }, []);
  const create = async (event) => { event.preventDefault(); setSaving(true); setError(''); setMessage(''); try { await churchApi.admin.create('users', form); setForm(emptyForm); setMessage('Compte développeur créé.'); await load(); } catch (err) { setError(err?.message || 'Impossible de créer ce compte.'); } finally { setSaving(false); } };
  const toggle = async (user) => { try { await churchApi.admin.update('users', user.id, { is_active: user.is_active === false }); await load(); } catch (err) { setError(err?.message || 'Impossible de modifier le statut.'); } };
  return <div className="dev-page">
    <div className="dev-page-heading"><div><span>ACCESS CONTROL</span><h2>Développeurs</h2><p>Les comptes qui administrent la console technique. Seuls les comptes développeur sont affichés ici.</p></div></div>
    <form className="dev-users-form" onSubmit={create}><label>Email<input type="email" required value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></label><label>Mot de passe<input type="password" minLength="8" required value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/></label><button disabled={saving}>{saving ? 'Création...' : 'Ajouter le développeur'}</button></form>
    {message && <div className="dev-notice"><strong>{message}</strong></div>}{error && <div className="dev-error">{error}<small>Le backend doit autoriser la ressource /admin/users et appliquer les rôles côté serveur.</small></div>}
    <div className="dev-panel"><div className="dev-table-head"><strong>Comptes développeur</strong><span>{users.length}</span></div>{loading ? <p className="dev-empty">Chargement...</p> : users.length === 0 ? <p className="dev-empty">Aucun développeur retourné par l’API.</p> : <div className="dev-table-wrap"><table><thead><tr><th>ID</th><th>Email</th><th>Statut</th><th /></tr></thead><tbody>{users.map(user=><tr key={user.id ?? user.email}><td>{user.id ?? '—'}</td><td>{user.email ?? '—'}</td><td>{user.is_active === false ? 'Désactivé' : 'Actif'}</td><td><button type="button" onClick={()=>toggle(user)}>{user.is_active === false ? 'Activer' : 'Désactiver'}</button></td></tr>)}</tbody></table></div>}</div>
  </div>;
}
