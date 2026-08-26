import { useState } from 'react';
import { SectionTitle } from './components';
import { churchApi } from '../services/churchApi';
import { WHATSAPP_URL } from './config';

const emptyForm = { name: '', phone: '', email: '', subject: '', message: '', is_confidential: false, is_urgent: false };

function AssistancePrompt({ onClose }) {
  return <div className="assistance-modal-backdrop" role="presentation"><div className="assistance-modal" role="dialog" aria-modal="true" aria-labelledby="prayer-assistance-title"><button className="assistance-modal-close" type="button" onClick={onClose} aria-label="Fermer">×</button><span className="gold-label">DEMANDE ENREGISTRÉE</span><h2 id="prayer-assistance-title">Avez-vous besoin d’assistance ?</h2><p>Votre demande de prière a bien été envoyée. Si vous souhaitez échanger directement avec l’équipe, vous pouvez continuer sur WhatsApp.</p><div className="assistance-modal-actions"><a className="btn" href={WHATSAPP_URL} target="_blank" rel="noreferrer">Oui, contacter sur WhatsApp <span>→</span></a><button className="btn outline" type="button" onClick={onClose}>Non, rester ici</button></div></div></div>;
}

export default function PrayerPage() {
  const [form, setForm] = useState(emptyForm);
  const [state, setState] = useState({ loading: false, error: '', sent: false, assistance: false });
  const change = (name, value) => setForm((current) => ({ ...current, [name]: value }));

  const submit = async (event) => {
    event.preventDefault();
    setState({ loading: true, error: '', sent: false, assistance: false });
    try {
      await churchApi.submitPrayerRequest({ ...form, message: form.subject || form.message });
      setForm(emptyForm);
      setState({ loading: false, error: '', sent: true, assistance: true });
    } catch (error) {
      setState({ loading: false, error: error.message || 'Impossible d’envoyer la demande.', sent: false, assistance: false });
    }
  };

  return <section className="section prayer-page"><div className="container narrow"><SectionTitle eyebrow="PRIÈRE" title="Votre demande de prière" text="Confiez-nous votre sujet de prière. Nous le porterons dans la prière." /><form className="form-card" onSubmit={submit}><div className="form-grid"><label>Nom (optionnel)<input value={form.name} onChange={(e) => change('name', e.target.value)} placeholder="Votre nom" /></label><label>Téléphone *<input required value={form.phone} onChange={(e) => change('phone', e.target.value)} placeholder="Votre numéro" /></label><label>Email (optionnel)<input type="email" value={form.email} onChange={(e) => change('email', e.target.value)} placeholder="Votre email" /></label></div><label style={{ marginTop: 16, display: 'block' }}>Sujet de prière *<textarea required rows={6} value={form.subject} onChange={(e) => { change('subject', e.target.value); change('message', e.target.value); }} placeholder="Écrivez votre sujet et demande de prière ici…" /></label>{state.error && <p className="form-error" role="alert">{state.error}</p>}{state.sent && !state.assistance && <p className="form-success" role="status">Votre demande de prière a bien été reçue.</p>}<button className="btn" type="submit" disabled={state.loading}>{state.loading ? 'Envoi en cours…' : 'Envoyer ma demande'} <span>→</span></button></form>{state.assistance && <AssistancePrompt onClose={() => setState((current) => ({ ...current, assistance: false }))} />}</div></section>;
}
