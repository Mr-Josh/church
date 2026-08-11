import React, { useEffect, useState } from 'react';
import { churchApi } from '../services/churchApi';

export const resourceConfigs = {
  ministries: { title: 'Ministères', fields: [['name','Nom','text'],['slug','Slug','text'],['description','Description','textarea'],['status','Statut','select']] },
  programs: { title: 'Programmes', fields: [['title','Titre','text'],['description','Description','textarea'],['day','Jour','text'],['start_time','Heure de début','time'],['end_time','Heure de fin','time'],['status','Statut','select']] },
  events: { title: 'Événements', fields: [['title','Titre','text'],['description','Description','textarea'],['event_date','Date et heure','datetime-local'],['location','Lieu','text'],['status','Statut','select']] },
  testimonials: { title: 'Témoignages', fields: [['name','Nom','text'],['content','Témoignage','textarea'],['photo','Photo URL','text'],['status','Statut','select']] },
};
const emptyFor = fields => Object.fromEntries(fields.map(([name]) => [name, name === 'status' ? 'published' : '']));

export default function AdminResourcePage({ resource }) {
  const config = resourceConfigs[resource];
  const [items, setItems] = useState([]), [form, setForm] = useState(emptyFor(config.fields));
  const [editing, setEditing] = useState(null), [loading, setLoading] = useState(true), [saving, setSaving] = useState(false), [error, setError] = useState('');
  const load = async () => { setLoading(true); try { const r = await churchApi.admin.list(resource); setItems(r.data || []); } catch (e) { setError(e.message); } finally { setLoading(false); } };
  useEffect(() => { load(); }, [resource]);
  const submit = async e => { e.preventDefault(); setSaving(true); setError(''); try { const payload = { ...form }; if (resource === 'ministries' && !payload.slug) payload.slug = payload.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); if (editing) await churchApi.admin.update(resource, editing, payload); else await churchApi.admin.create(resource, payload); setEditing(null); setForm(emptyFor(config.fields)); await load(); } catch (e) { setError(e.message); } finally { setSaving(false); } };
  const edit = item => { setEditing(item.id); setForm(Object.fromEntries(config.fields.map(([n]) => [n, item[n] ?? '']))); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const remove = async id => { if (!window.confirm('Supprimer définitivement cet élément ?')) return; try { await churchApi.admin.remove(resource, id); await load(); } catch (e) { setError(e.message); } };

  return <>
    {error && <div className="form-error dashboard-error">{error}</div>}
    <section className="admin-panel admin-form-panel"><h2>{editing ? 'Modifier' : 'Ajouter'} {config.title.toLowerCase()}</h2><form className="form-grid" onSubmit={submit}>{config.fields.map(([name, label, type]) => <label key={name}>{label}{type === 'textarea' ? <textarea value={form[name]} onChange={e => setForm({ ...form, [name]: e.target.value })} /> : type === 'select' ? <select value={form[name]} onChange={e => setForm({ ...form, [name]: e.target.value })}><option value="published">Publié</option><option value="draft">Brouillon</option></select> : <input type={type} value={form[name]} onChange={e => setForm({ ...form, [name]: e.target.value })} required={['name','title','day'].includes(name)} />}</label>)}<div className="form-actions"><button className="btn" disabled={saving}>{saving ? 'Enregistrement...' : editing ? 'Enregistrer les modifications' : 'Ajouter'}</button>{editing && <button type="button" className="btn outline" onClick={() => { setEditing(null); setForm(emptyFor(config.fields)); }}>Annuler</button>}</div></form></section>
    <section className="admin-panel"><div className="admin-list-head"><div><h2>Éléments existants</h2><p className="admin-muted">Les plus récents apparaissent en premier.</p></div><span>{items.length}</span></div>{loading ? <p className="admin-muted">Chargement...</p> : items.length === 0 ? <p className="admin-muted">Aucun élément pour le moment.</p> : <div className="admin-table">{items.map(item => <article key={item.id}><div><strong>{item.name || item.title}</strong><small>{item.content || item.description || item.day || item.location || '—'}</small></div><span className={`status ${item.status || 'published'}`}>{item.status || 'published'}</span><div className="row-actions"><button onClick={() => edit(item)}>Modifier</button><button onClick={() => remove(item.id)}>Supprimer</button></div></article>)}</div>}</section>
  </>;
}
