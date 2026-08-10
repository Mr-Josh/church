import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHero, SectionTitle } from '../components';
import { churchApi } from '../../services/churchApi';
import { WHATSAPP_URL } from '../config';

const emptyRequest = {
  name: '',
  phone: '',
  email: '',
  subject: '',
  message: '',
  is_confidential: false,
  is_urgent: false,
};

export function Testimonials() {
  const [testimonials, setTestimonials] = useState([]);
  const [name, setName] = useState('');
  const [content, setContent] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    churchApi.testimonials()
      .then((payload) => {
        if (!active) return;
        const data = Array.isArray(payload) ? payload : payload?.data;
        if (Array.isArray(data)) setTestimonials(data);
      })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setSent(false);
    try {
      await churchApi.submitTestimonial({ name, content });
      setSent(true);
      setName('');
      setContent('');
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const fallback = [
    'Ma vie a été transformée depuis que j’ai rencontré Jésus dans cette église. Gloire à Dieu !',
    'J’ai retrouvé la paix grâce à la prière et à l’accompagnement reçu.',
    'Ma guérison semblait impossible, mais Jésus a fait ce que les médecins n’ont pas pu faire.',
  ];

  return <><PageHero title="TÉMOIGNAGES" text="Découvrez des récits de vies transformées par la grâce de Dieu." /><section className="section"><div className="container testimonials"><div className="testimonial-list">{(testimonials.length ? testimonials : fallback).map((item, index) => { const text = item?.content || item; const author = item?.name || `Témoignage ${index + 1}`; return <blockquote key={item?.id || index}>“<p>{text}</p><b>— {author}</b></blockquote>; })}</div><form className="form-card" onSubmit={submit}><span className="gold-label">PARTAGER</span><h2>Votre témoignage</h2><label>Nom<input required value={name} onChange={(event) => setName(event.target.value)} /></label><label>Votre témoignage<textarea required value={content} onChange={(event) => setContent(event.target.value)} /></label>{error && <p className="form-error" role="alert">{error}</p>}{sent && <p className="form-success" role="status">Votre témoignage a été envoyé pour validation.</p>}<button className="btn" type="submit">{sent ? 'Envoyer un autre témoignage' : 'Envoyer mon témoignage'} <span>→</span></button></form></div></section></>;
}

function RequestForm({ kind }) {
  const [form, setForm] = useState(emptyRequest);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isPrayer = kind === 'prayer';
  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setSent(false);
    setLoading(true);
    try {
      if (isPrayer) await churchApi.submitPrayerRequest(form);
      else await churchApi.submitHelpRequest(form);
      setSent(true);
      setForm(emptyRequest);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  return <form className="form-card" onSubmit={submit}>
    <div className="form-grid">
      <label>Nom{isPrayer ? ' (optionnel)' : ''}<input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label>
      <label>Téléphone *<input required value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} placeholder="Votre numéro" /></label>
      {isPrayer && <>
        <label>Email (optionnel)<input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="Votre email" /></label>
        <label>Sujet de prière *<input required value={form.subject} onChange={(event) => setForm({ ...form, subject: event.target.value })} placeholder="Sujet de votre demande" /></label>
      </>}
    </div>
    <label>{isPrayer ? 'Décrivez votre demande *' : 'Votre demande *'}<textarea required value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} placeholder={isPrayer ? 'Écrivez votre demande de prière ici…' : 'Décrivez votre besoin ici…'} /></label>
    {isPrayer && <div className="choice-row"><label><input type="checkbox" checked={form.is_confidential} onChange={(event) => setForm({ ...form, is_confidential: event.target.checked })} /> Confidentiel</label><label><input type="checkbox" checked={form.is_urgent} onChange={(event) => setForm({ ...form, is_urgent: event.target.checked })} /> Demande urgente</label></div>}
    {error && <p className="form-error" role="alert">{error}</p>}
    {sent && <p className="form-success" role="status">{isPrayer ? 'Votre demande de prière a bien été reçue.' : 'Votre demande d’assistance a bien été reçue.'}</p>}
    <button className="btn" type="submit" disabled={loading}>{loading ? 'Envoi en cours…' : sent ? 'Envoyer une nouvelle demande' : 'Envoyer ma demande'} <span>→</span></button>
  </form>;
}

export function Prayer() {
  return <><PageHero title="DEMANDE DE PRIÈRE" text="Confiez-nous votre sujet de prière. Nous le porterons dans la prière." /><section className="section"><div className="container narrow"><RequestForm kind="prayer" /></div></section></>;
}

export function Evangelism() {
  return <><PageHero title="JÉSUS PEUT TRANSFORMER VOTRE VIE" text="Découvrez l’Évangile et commencez une relation personnelle avec Jésus-Christ." /><section className="section"><div className="container two-cols evangelism"><div className="steps">{[['COMMENT RECEVOIR JÉSUS ?', 'Découvrez comment donner votre vie à Christ.'], ['PRIÈRE DU SALUT', 'Faites cette prière avec foi et sincérité.'], ['BESOIN D’ACCOMPAGNEMENT ?', 'Nous sommes là pour vous accompagner.'], ['TÉLÉCHARGER UNE BIBLE', 'Lisez la Parole de Dieu chaque jour.']].map((item, index) => <article key={item[0]}><i>{index + 1}</i><div><h3>{item[0]}</h3><p>{item[1]}</p></div></article>)}</div><div className="sunrise-card"><span>« Jésus vous aime »</span><b>Il veut une relation personnelle avec vous.</b><a href={WHATSAPP_URL}>Je veux être contacté →</a></div></div></section></>;
}

export function Help() {
  const [open, setOpen] = useState(0);
  const questions = ['Comment assister aux cultes ?', 'Comment faire une demande de prière ?', 'Comment rejoindre un ministère ?', 'Comment faire un don ?', 'Je ne trouve pas l’information dont j’ai besoin'];
  return <><PageHero title="ASSISTANCE & AIDE" text="Nous sommes là pour vous accompagner dans vos besoins spirituels ou pratiques." /><section className="section"><div className="container help-layout"><div><SectionTitle eyebrow="QUESTIONS FRÉQUENTES" title="Les réponses aux questions courantes" />{questions.map((question, index) => <div className="faq" key={question}><button type="button" onClick={() => setOpen(open === index ? -1 : index)} aria-expanded={open === index}><b>{question}</b><span>{open === index ? '−' : '+'}</span></button>{open === index && <p>Pour cette question, contactez directement l’église sur WhatsApp afin d’obtenir une réponse adaptée.</p>}</div>)}</div><aside className="help-box"><span className="gold-label">BESOIN D’AIDE ?</span><h2>Nous sommes à votre écoute</h2><a href={WHATSAPP_URL}>WhatsApp<br /><b>Discutez avec nous</b></a><Link to="/prayer">Besoin d’une prière ?<br /><b>Demander une prière →</b></Link></aside></div></section><section className="section soft"><div className="container narrow"><SectionTitle eyebrow="CONTACTEZ-NOUS" title="Vous ne trouvez pas votre réponse ?" text="Envoyez-nous directement votre demande d’assistance." /><RequestForm kind="help" /></div></section></>;
}

export function Contact() {
  return <><PageHero title="CONTACT" text="Une question, un besoin particulier ? Nous sommes disponibles." /><section className="section"><div className="container contact-layout"><div className="contact-info"><span className="gold-label">NOUS SOMMES À VOTRE ÉCOUTE</span><h2>Parlons-nous sur WhatsApp</h2><p>Pour une question sur nos activités, une demande d’aide ou un accompagnement, nous vous orientons vers notre canal de communication principal.</p><a className="contact-card" href={WHATSAPP_URL}><i>◉</i><div><b>WhatsApp</b><span>Écrivez-nous directement</span></div><strong>→</strong></a><div className="contact-card"><i>⌖</i><div><b>Adresse</b><span>Quartier Bonamoussadi, Rue 12, Douala</span></div></div><div className="contact-card"><i>✉</i><div><b>Email</b><span>contact@gospelbreakchainministry.org</span></div></div></div><div className="map-placeholder"><span>NOTRE LOCALISATION</span><b>Gospel Break Chain Ministry</b><small>Douala, Cameroun</small><div className="map-pin">⌖</div></div></div></section></>;
}

export function Donate() {
  return <><PageHero title="FAIRE UN DON" text="Soutenez l’œuvre de Dieu et contribuez à impacter davantage de vies." /><section className="section"><div className="container donation-ui"><div className="steps-indicator"><b>1. DON</b><span>2. PAIEMENT</span><span>3. CONFIRMATION</span></div><div className="donation-card"><span className="gold-label">CHOISISSEZ LE TYPE DE DON</span><div className="donation-types">{['Dîme', 'Offrande', 'Action de grâce', 'Mission', 'Construction', 'Autre'].map((type, index) => <button key={type} className={index === 0 ? 'selected' : ''} type="button">{type}</button>)}</div><span className="gold-label">MONTANT</span><div className="amounts">{['1 000 FCFA', '2 500 FCFA', '5 000 FCFA', '10 000 FCFA', 'Autre montant'].map((amount) => <button key={amount} type="button">{amount}</button>)}</div><div className="donation-note">La logique de paiement sera intégrée séparément. Cette interface prépare uniquement le parcours visuel du don.</div><button className="btn disabled" type="button" disabled>Continuer vers le paiement</button></div></div></section></>;
}
