import React, { useEffect, useState } from 'react';
import { churchApi } from '../services/churchApi';

export default function AdminSettings() {
  const [form, setForm] = useState({}), [loading, setLoading] = useState(true), [saved, setSaved] = useState(false), [error, setError] = useState('');
  useEffect(() => { churchApi.admin.churchSettings().then(r => setForm(r.data || {})).catch(e => setError(e.message || 'Impossible de charger les informations.')).finally(() => setLoading(false)); }, []);
  const submit = async e => { e.preventDefault(); setSaved(false); setError(''); try { await churchApi.admin.updateChurchSettings(form); setSaved(true); } catch (e) { setError(e.message || 'Impossible d’enregistrer les informations.'); } };
  if (loading) return <section className="admin-panel"><p>Chargement...</p></section>;
  return <section className="admin-panel"><form className="form-grid" onSubmit={submit}>{[['church_name','Nom de l’église'],['slogan','Slogan'],['address','Adresse'],['phone','Téléphone'],['whatsapp','WhatsApp'],['email','Email']].map(([name,label]) => <label key={name}>{label}<input value={form[name] || ''} onChange={e => setForm({ ...form, [name]: e.target.value })} /></label>)}<label>Mission<textarea value={form.mission || ''} onChange={e => setForm({ ...form, mission: e.target.value })} /></label><label>Vision<textarea value={form.vision || ''} onChange={e => setForm({ ...form, vision: e.target.value })} /></label><button className="btn">{saved ? 'Enregistré' : 'Enregistrer'}</button>{error && <div className="form-error">{error}</div>}</form></section>;
}
