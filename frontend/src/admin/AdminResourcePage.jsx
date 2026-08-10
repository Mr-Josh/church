import React, { useEffect, useMemo, useState } from 'react';
import AdminLayout from './AdminLayout';
import { churchApi } from '../services/churchApi';
import './admin.css';

export const resourceConfigs = {
  ministries: { title: 'Ministères', fields: [['name','Nom','text'],['slug','Slug','text'],['description','Description','textarea'],['image','Image URL','url'],['status','Statut','select']] },
  programs: { title: 'Programmes', fields: [['title','Titre','text'],['description','Description','textarea'],['day','Jour','text'],['start_time','Heure de début','time'],['end_time','Heure de fin','time'],['status','Statut','select']] },
  events: { title: 'Événements', fields: [['title','Titre','text'],['description','Description','textarea'],['image','Image URL','url'],['event_date','Date et heure','datetime-local'],['location','Lieu','text'],['status','Statut','select']] },
  sermons: { title: 'Prédications', fields: [['title','Titre','text'],['description','Description','textarea'],['preacher','Prédicateur','text'],['video_url','Vidéo URL','url'],['audio_url','Audio URL','url'],['pdf_url','PDF URL','url'],['published_at','Date de publication','datetime-local'],['status','Statut','select']] },
  gallery: { title: 'Galerie', fields: [['title','Titre','text'],['type','Type','text'],['file_url','Fichier URL','url']] },
  testimonials: { title: 'Témoignages', fields: [['name','Nom','text'],['content','Témoignage','textarea'],['photo','Photo URL','url'],['status','Statut','select']] },
};

const emptyFor = fields => Object.fromEntries(fields.map(([name]) => [name, name === 'status' ? 'published' : '']));

export default function AdminResourcePage({ resource }) {
  const config = resourceConfigs[resource];
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyFor(config.fields));
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');

  const load = async () => {
    setLoading(true); setError('');
    try { const response = await churchApi.admin.list(resource); setItems(response.data || []); }
    catch (e) { setError(e.message || 'Impossible de charger les éléments.'); }
    finally { setLoading(false); }
  };
  useEffect(() => { setForm(emptyFor(config.fields)); load(); }, [resource]);

  const visibleItems = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return items.filter(item => !needle || Object.values(item).filter(v => typeof v === 'string').join(' ').toLowerCase().includes(needle));
  }, [items, query]);

  const submit = async event => {
    event.preventDefault(); setSaving(true); setError('');
    try {
      const payload = { ...form };
      if (resource === 'ministries' && !payload.slug) payload.slug = payload.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      if (editing) await churchApi.admin.update(resource, editing, payload); else await churchApi.admin.create(resource, payload);
      setEditing(null); setForm(emptyFor(config.fields)); await load();
    } catch (e) { setError(e.message || 'Impossible d’enregistrer.'); }
    finally { setSaving(false); }
  };

  const edit = item => { setEditing(item.id); setForm(Object.fromEntries(config.fields.map(([name]) => [name, item[name] ?? '']))); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const remove = async id => { if (!window.confirm('Supprimer définitivement cet élément ?')) return; try { await churchApi.admin.remove(resource, id); setItems(current => current.filter(item => item.id !== id)); } catch (e) { setError(e.message || 'Impossible de supprimer.'); } };

  return <AdminLayout active={resource === 'testimonials' ? 'testimonials' : 'content'} title={config.title} description="Gérez les éléments publiés sur le site.">
    <section className="admin-panel admin-form-panel">
      <div className="admin-list-head"><div><h2>{editing ? 'Modifier' : 'Ajouter'} {config.title.toLowerCase()}</h2><p className="admin-muted">Les champs sont enregistrés directement dans la base de données.</p></div></div>
      <form className="form-grid" onSubmit={submit}>{config.fields.map(([name, label, type]) => <label key={name}>{label}{type === 'textarea' ? <textarea value={form[name]} onChange={e => setForm({ ...form, [name]: e.target.value })} /> : type === 'select' ? <select value={form[name]} onChange={e => setForm({ ...form, [name]: e.target.value })}><option value="published">Publié</option><option value="draft">Brouillon</option></select> : <input type={type} value={form[name]} onChange={e => setForm({ ...form, [name]: e.target.value })} required={['name','title'].includes(name)} />}</label>)}
        {error && <div className="form-error" role="alert">{error}</div>}
        <div className="form-actions"><button className="btn" disabled={saving}>{saving ? 'Enregistrement…' : editing ? 'Enregistrer les modifications' : 'Ajouter'}</button>{editing && <button type="button" className="btn outline" onClick={() => { setEditing(null); setForm(emptyFor(config.fields)); }}>Annuler</button>}</div>
      </form>
    </section>
    <section className="admin-panel">
      <div className="admin-list-head"><div><h2>Éléments existants</h2><p className="admin-muted">{visibleItems.length} résultat{visibleItems.length > 1 ? 's' : ''}</p></div><span>{items.length}</span></div>
      <div className="admin-toolbar"><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Rechercher..." aria-label={`Rechercher dans ${config.title}`} /></div>
      {loading ? <div className="admin-list-skeleton"><span/><span/><span/></div> : visibleItems.length === 0 ? <div className="empty-state"><strong>Aucun élément trouvé</strong><span>Créez le premier élément ou modifiez votre recherche.</span></div> : <div className="admin-table">{visibleItems.map(item => <article key={item.id}><div><strong>{item.name || item.title || item.file_url}</strong><small>{item.content || item.description || item.day || item.location || item.preacher || '—'}</small></div>{item.status && <span className={`status ${item.status}`}>{item.status === 'published' ? 'Publié' : 'Brouillon'}</span>}<div className="row-actions"><button type="button" onClick={() => edit(item)}>Modifier</button><button type="button" onClick={() => remove(item.id)}>Supprimer</button></div></article>)}</div>}
    </section>
  </AdminLayout>;
}
