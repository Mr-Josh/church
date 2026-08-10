import React, { useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';
import { churchApi } from '../services/churchApi';
import './admin.css';

const fields = [
  ['church_name', 'Nom de l’église', 'text'],
  ['slogan', 'Slogan', 'text'],
  ['address', 'Adresse', 'text'],
  ['phone', 'Téléphone', 'tel'],
  ['whatsapp', 'WhatsApp', 'tel'],
  ['email', 'Email', 'email'],
];

export default function AdminSettings() {
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true); setError('');
    try { const response = await churchApi.admin.churchSettings(); setForm(response.data || {}); }
    catch (e) { setError(e.message || 'Impossible de charger les informations de l’église.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const update = (name, value) => { setSaved(false); setForm(current => ({ ...current, [name]: value })); };
  const submit = async event => {
    event.preventDefault(); setSaving(true); setSaved(false); setError('');
    try { await churchApi.admin.updateChurchSettings(form); setSaved(true); }
    catch (e) { setError(e.message || 'Impossible d’enregistrer les modifications.'); }
    finally { setSaving(false); }
  };

  return <AdminLayout active="settings" title="Informations de l’église" description="Ces informations alimentent les coordonnées et les liens publics du site.">
    <section className="admin-panel">
      {loading ? <div className="admin-form-skeleton"><span/><span/><span/><span/></div> : <form className="form-grid" onSubmit={submit}>
        {fields.map(([name, label, type]) => <label key={name}>{label}<input type={type} value={form[name] || ''} onChange={e => update(name, e.target.value)} autoComplete="off" /></label>)}
        <label>Mission<textarea value={form.mission || ''} onChange={e => update('mission', e.target.value)} /></label>
        <label>Vision<textarea value={form.vision || ''} onChange={e => update('vision', e.target.value)} /></label>
        {error && <div className="form-error" role="alert">{error}<button type="button" onClick={load}>Réessayer</button></div>}
        <div className="form-actions"><button className="btn" type="submit" disabled={saving}>{saving ? 'Enregistrement…' : saved ? '✓ Enregistré' : 'Enregistrer'}</button></div>
      </form>}
    </section>
  </AdminLayout>;
}
