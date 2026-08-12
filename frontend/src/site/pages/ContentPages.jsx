import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CTA, PageHero, SectionTitle } from '../components';
import { churchApi } from '../../services/churchApi';
import { useBibleVerse } from '../../useBibleVerse';

function useRemote(loader, initialValue = []) {
  const [data, setData] = useState(initialValue);
  useEffect(() => {
    let active = true;
    loader().then((payload) => {
      const value = Array.isArray(payload) ? payload : payload?.data;
      if (active && Array.isArray(value)) setData(value);
    }).catch(() => {});
    return () => { active = false; };
  }, [loader]);
  return data;
}

function useChurchSettings() {
  const [settings, setSettings] = useState({});
  useEffect(() => {
    let active = true;
    churchApi.church().then((payload) => {
      if (active && payload?.data) setSettings(payload.data);
    }).catch(() => {});
    return () => { active = false; };
  }, []);
  return settings;
}

function formatTime(value) { return value ? String(value).slice(0, 5) : ''; }
function formatEventDate(value) {
  if (!value) return { day: '', month: '', time: '' };
  const date = new Date(String(value).replace(' ', 'T'));
  if (Number.isNaN(date.getTime())) return { day: '', month: '', time: '' };
  return {
    day: String(date.getDate()).padStart(2, '0'),
    month: date.toLocaleDateString('fr-FR', { month: 'short' }).replace('.', '').toUpperCase(),
    time: date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
  };
}

export function Home() {
  const settings = useChurchSettings();
  const programs = useRemote(churchApi.programs);
  const ministries = useRemote(churchApi.ministries);
  const sermons = useRemote(churchApi.sermons);
  const events = useRemote(churchApi.events);
  const testimonials = useRemote(churchApi.testimonials);
  const verse = useBibleVerse(6000);
  return <>
    <section className="hero-home"><div className="container hero-content"><p className="eyebrow">{settings.church_name || 'GOSPEL BREAK CHAIN MINISTRY'}</p><h1>{(settings.slogan || 'PAR LE POUVOIR DE CHRIST').toUpperCase()}</h1><div className="hero-verse" key={verse.id}><p className="verse">« {verse.text} »</p><b>{verse.reference}</b></div><div className="hero-actions"><CTA to="/programs">Nous rejoindre</CTA><CTA dark to="/prayer">Faire une demande de prière</CTA></div></div></section>
    <section className="pillars"><div className="container pillar-grid">{[['ADORER DIEU','Célébrer Sa présence et Sa grandeur.','♬'],['ÉDIFIER LES ÂMES','Former des disciples matures en Christ.','♡'],['ÉVANGÉLISER LE MONDE','Partager l’Évangile avec puissance.','◎'],['IMPACTER LA SOCIÉTÉ','Être une lumière dans notre génération.','✦']].map((item) => <div className="pillar" key={item[0]}><i>{item[2]}</i><h3>{item[0]}</h3><p>{item[1]}</p></div>)}</div></section>
    <section className="section soft"><div className="container two-cols"><div><SectionTitle eyebrow="NOTRE MISSION" title="Une foi qui transforme" text={settings.mission || 'Mission non renseignée.'} /><CTA to="/about">Découvrir notre mission</CTA></div><div className="schedule-card"><h3>NOS HORAIRES DE CULTE</h3>{programs.length === 0 ? <p>Aucun programme publié.</p> : programs.map((program) => <div className="schedule-row" key={program.id}><b>{program.title}</b><span>{program.day || ''}{program.start_time ? ` · ${formatTime(program.start_time)}` : ''}{program.end_time ? ` – ${formatTime(program.end_time)}` : ''}</span></div>)}</div></div></section>
    <section className="section"><div className="container"><SectionTitle eyebrow="PROCHAINS ÉVÉNEMENTS" title="Vivons ensemble les temps forts" action={<Link to="/events" className="text-link">Voir tous →</Link>} /><div className="event-grid">{events.length === 0 ? <p>Aucun événement publié.</p> : events.slice(0, 3).map((event) => { const date = formatEventDate(event.event_date); return <article className="event-card" key={event.id}><div className="date"><b>{date.day}</b><span>{date.month}</span></div><div><span className="tag">ÉVÉNEMENT</span><h3>{event.title}</h3><p>{event.description || `${date.time}${event.location ? ` · ${event.location}` : ''}`}</p></div></article>; })}</div></div></section>
    <section className="section dark-section"><div className="container pastor-highlight"><div className="pastor-placeholder"><span>PASTEUR</span><b>{settings.pastor_name || 'Jean Emmanuel'}</b></div><div><span className="gold-label">MOT DU PASTEUR</span><blockquote>{settings.pastor_bio || settings.vision || 'Notre vision est de voir des vies transformées et des destinées accomplies par le pouvoir de Jésus-Christ.'}</blockquote><p>{settings.pastor_name || 'Pasteur Jean Emmanuel'}</p><CTA dark to="/pastor">En savoir plus sur le pasteur</CTA></div></div></section>
    <section className="section"><div className="container"><SectionTitle eyebrow="NOS MINISTÈRES" title="Servir, grandir et impacter" action={<Link to="/ministries" className="text-link">Découvrir tous nos ministères →</Link>} /><div className="ministry-grid home-ministry">{ministries.length === 0 ? <p>Aucun ministère publié.</p> : ministries.slice(0, 6).map((ministry) => <Link to="/ministries" className="ministry-card" key={ministry.id}><i>✦</i><h3>{ministry.name}</h3><p>{ministry.description}</p></Link>)}</div></div></section>
    <section className="section soft"><div className="container media-grid"><div><SectionTitle eyebrow="DERNIÈRES PRÉDICATIONS" title="La Parole au cœur de nos vies" action={<Link to="/sermons" className="text-link">Voir toutes →</Link>} /><div className="sermon-grid">{sermons.length === 0 ? <p>Aucune prédication publiée.</p> : sermons.slice(0, 3).map((sermon) => <a href={sermon.video_url || sermon.audio_url || sermon.pdf_url || '#'} className="sermon-card" key={sermon.id}><div className="media-thumb"><span>▶</span></div><h3>{sermon.title}</h3><p>{sermon.preacher || 'Prédication'} · récemment</p></a>)}</div></div><div><SectionTitle eyebrow="TÉMOIGNAGES" title="Des vies transformées" /><div className="quote-card"><span>“</span>{testimonials.length === 0 ? <p>Aucun témoignage publié pour le moment.</p> : <><p>{testimonials[0].content}</p><b>— {testimonials[0].name}</b></>}<CTA to="/testimonials">Partager votre témoignage</CTA></div></div></div></section>
    <section className="donation-banner"><div><span className="gold-label">SOUTENEZ L’ŒUVRE DE DIEU</span><h2>Votre don aide à transformer des vies et à propager l’Évangile.</h2></div><CTA to="/donate">Faire un don maintenant</CTA></section>
  </>;
}

export function About() {
  const settings = useChurchSettings();
  return <><PageHero title="À PROPOS DE NOUS" text="Découvrez notre histoire, notre vision, notre mission et les valeurs qui nous guident." /><section className="section"><div className="container three-cards"><article><span>◫</span><h2>NOTRE ÉGLISE</h2><p>{settings.church_name || 'Notre église'}</p><CTA to="/pastor">Notre parcours</CTA></article><article><span>◎</span><h2>NOTRE VISION</h2><p>{settings.vision || 'Vision non renseignée.'}</p></article><article><span>✦</span><h2>NOTRE MISSION</h2><p>{settings.mission || 'Mission non renseignée.'}</p></article></div></section><section className="section soft"><div className="container"><SectionTitle eyebrow="NOTRE ENGAGEMENT" title={settings.slogan || 'Une foi qui transforme'} text={settings.mission || settings.vision || 'Notre engagement est de servir Dieu et les personnes qui nous sont confiées.'} /></div></section></>;
}

export function Pastor() {
  const settings = useChurchSettings();
  const name = settings.pastor_name || 'Jean Emmanuel';
  const title = settings.pastor_title || 'Fondateur & Pasteur Principal';
  const bio = settings.pastor_bio || settings.vision || 'La vision de Dieu pour cette église est de gagner les âmes, bâtir des disciples et impacter notre génération.';
  return <><PageHero eyebrow="NOTRE PASTEUR" title={name} text={title} /><section className="section"><div className="container pastor-layout"><div className="pastor-photo">{settings.pastor_photo ? <img src={settings.pastor_photo} alt={name} /> : <><span>PHOTO DU PASTEUR</span><b>{name}</b></>}</div><article className="message-card"><span className="gold-label">MOT DU PASTEUR</span><h2>Une vision pour restaurer des vies</h2><p>{bio}</p><p>{settings.mission || 'Servir avec amour, intégrité et excellence.'}</p><p className="signature">{name}</p></article></div></section><section className="section soft"><div className="container timeline-cols"><div><SectionTitle eyebrow="VISION" title="Servir avec conviction" /><p>{settings.vision || 'Vision non renseignée.'}</p></div><div><SectionTitle eyebrow="MISSION" title="Une mission claire" /><p>{settings.mission || 'Mission non renseignée.'}</p></div></div></section></>;
}

function CollectionPage({ loader, title, text, render }) { const data = useRemote(loader); return <><PageHero title={title} text={text} /><section className="section"><div className="container">{render(data)}</div></section></>; }

export function Ministries() { return <CollectionPage loader={churchApi.ministries} title="NOS MINISTÈRES" text="Découvrir les espaces où chacun peut servir, grandir et contribuer à l’œuvre de Dieu." render={(data) => data.length === 0 ? <p>Aucun ministère publié.</p> : <div className="ministry-grid">{data.map((ministry) => <article className="ministry-card large" key={ministry.id}><i>✦</i><h2>{ministry.name}</h2><p>{ministry.description}</p><Link to="/contact">En savoir plus →</Link></article>)}</div>} />; }
export function Programs() { return <CollectionPage loader={churchApi.programs} title="NOS PROGRAMMES" text="Retrouvez les rendez-vous réguliers de la communauté." render={(data) => data.length === 0 ? <p>Aucun programme publié.</p> : <div className="schedule-list">{data.map((program) => <article key={program.id}><div className="program-icon">◷</div><div><span className="gold-label">{program.day || ''}</span><h2>{program.title}</h2><p>{program.description}</p></div><strong>{formatTime(program.start_time)}{program.end_time ? ` – ${formatTime(program.end_time)}` : ''}</strong></article>)}</div>} />; }
export function Events() { return <CollectionPage loader={churchApi.events} title="ÉVÉNEMENTS" text="Les prochains temps forts de Gospel Break Chain Ministry." render={(data) => data.length === 0 ? <p>Aucun événement publié.</p> : <div className="event-grid big">{data.map((event, index) => { const date = formatEventDate(event.event_date); return <article className="event-feature" key={event.id}><div className="event-image">{event.image ? <img src={event.image} alt={event.title} /> : <span>{String(index + 1).padStart(2, '0')}</span>}</div><div className="event-body"><span className="tag">À VENIR</span><h2>{event.title}</h2><p>{event.description}</p><b>{date.time}{event.location ? ` · ${event.location}` : ''}</b><Link to="/contact">Plus d’informations →</Link></div></article>; })}</div>} />; }
export function Sermons() { return <CollectionPage loader={churchApi.sermons} title="PRÉDICATIONS" text="Écoutez, regardez et méditez les enseignements du ministère." render={(data) => data.length === 0 ? <p>Aucune prédication publiée.</p> : <div className="sermon-grid full">{data.map((sermon) => { const href = sermon.video_url || sermon.audio_url || sermon.pdf_url; return <article className="sermon-card" key={sermon.id}><div className="media-thumb"><span>▶</span></div><h2>{sermon.title}</h2><p>{sermon.preacher || 'Prédication'}</p>{sermon.description && <p>{sermon.description}</p>}{href && <a href={href} target="_blank" rel="noreferrer">Accéder au contenu →</a>}</article>; })}</div>} />; }
export function Gallery() { return <CollectionPage loader={churchApi.gallery} title="GALERIE" text="Découvrez les images et vidéos de la vie de l’église." render={(data) => data.length === 0 ? <p>Aucun élément dans la galerie.</p> : <div className="gallery-grid">{data.map((item) => <article className="gallery-item" key={item.id}>{item.type === 'video' ? <video controls src={item.file_url} /> : <img src={item.file_url} alt={item.title || 'Galerie'} />}{item.title && <h3>{item.title}</h3>}</article>)}</div>} />; }
