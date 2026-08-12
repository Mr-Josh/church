import React, { useEffect, useState } from 'react';
import { churchApi } from '../services/churchApi';

const fields = [
  ['church_name', 'Nom de l’église'],
  ['slogan', 'Slogan'],
  ['address', 'Adresse'],
  ['phone', 'Téléphone'],
  ['whatsapp', 'WhatsApp'],
  ['email', 'Email'],
  ['pastor_name', 'Nom du pasteur'],
  ['pastor_title', 'Titre du pasteur'],
  ['pastor_photo', 'Photo du pasteur (URL)'],
];

export default function AdminSettings() {
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    churchApi.admin.churchSettings()
      .then((response) => setForm(response.data || {}))
      .catch((e) => setError(e.message || 'Impossible de charger les informations.'))
      .finally(() => setLoading(false));
  }, []);

  const submit = async (event) => {
    event.preventDefault();
    setSaved(false);
    setError('');
    try {
      await churchApi.admin.updateChurchSettings(form);
      setSaved(true);
    } catch (e) {
      setError(e.message || 'Impossible d’enregistrer les informations.');
    }
  };

  if (loading) return <section className="admin-panel"><p>Chargement...</p></section>;

  return <section className="admin-panel">
    <form className="form-grid" onSubmit={submit}>
      {fields.map(([name, label]) => <label key={name}>{label}<input value={form[name] || ''} onChange={(e) => setForm({ ...form, [name]: e.target.value })} /></label>)}
      <label>Mission<textarea value={form.mission || ''} onChange={(e) => setForm({ ...form, mission: e.target.value })} /></label>
      <label>Vision<textarea value={form.vision || ''} onChange={(e) => setForm({ ...form, vision: e.target.value })} /></label>
      <label>Biographie / mot du pasteur<textarea value={form.pastor_bio || ''} onChange={(e) => setForm({ ...form, pastor_bio: e.target.value })} /></label>
      <button className="btn" type="submit">{saved ? 'Enregistré' : 'Enregistrer'}</button>
      {error && <div className="form-error">{error}</div>}
    </form>
  </section>;
}
