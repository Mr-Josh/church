import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CTA, PageHero, SectionTitle } from '../components';
import { churchApi } from '../../services/churchApi';
import { ministries as fallbackMinistries, programs as fallbackPrograms, sermons as fallbackSermons } from '../data';

function useRemote(loader, fallbackValue) {
  const [data, setData] = useState(fallbackValue);

  useEffect(() => {
    let active = true;
    loader()
      .then((payload) => {
        if (!active) return;
        const value = Array.isArray(payload) ? payload : payload?.data;
        if (Array.isArray(value)) setData(value);
      })
      .catch(() => {
        // churchApi already exposes the global request/error state; keep the local fallback visible.
      });

    return () => {
      active = false;
    };
  }, [loader]);

  return data;
}

const fallbackEvents = [
  'Campagne de délivrance',
  'Conférence des jeunes',
  'Veillée de prière',
  'Séminaire biblique',
  'Jeûne & prière',
  'Journée d’évangélisation',
];

const fallbackGallery = Array.from({ length: 12 }, (_, index) => ({
  id: `fallback-${index + 1}`,
  title: `Album ${index + 1}`,
}));

function collectionName(item, fallback = '') {
  return item?.name || item?.title || item?.label || fallback;
}

export function Home() {
  const programs = useRemote(churchApi.programs, fallbackPrograms);
  const ministries = useRemote(churchApi.ministries, fallbackMinistries);
  const sermons = useRemote(churchApi.sermons, fallbackSermons);
  const events = useRemote(churchApi.events, []);
  const testimonials = useRemote(churchApi.testimonials, []);

  return (
    <>
      <section className="hero-home">
        <div className="container hero-content">
          <p className="eyebrow">GOSPEL BREAK CHAIN MINISTRY</p>
          <h1>BRISONS LES CHAÎNES<br /><span>PAR LE POUVOIR DE CHRIST</span></h1>
          <p className="verse">« Si le Fils vous affranchit, vous serez réellement libres. » <b>Jean 8:36</b></p>
          <div className="hero-actions">
            <CTA to="/programs">Nous rejoindre</CTA>
            <CTA dark to="/prayer">Faire une demande de prière</CTA>
          </div>
        </div>
      </section>

      <section className="pillars">
        <div className="container pillar-grid">
          {[
            ['ADORER DIEU', 'Célébrer Sa présence et Sa grandeur.', '♬'],
            ['ÉDIFIER LES ÂMES', 'Former des disciples matures en Christ.', '♡'],
            ['ÉVANGÉLISER LE MONDE', 'Partager l’Évangile avec puissance.', '◎'],
            ['IMPACTER LA SOCIÉTÉ', 'Être une lumière dans notre génération.', '✦'],
          ].map((item) => (
            <div className="pillar" key={item[0]}><i>{item[2]}</i><h3>{item[0]}</h3><p>{item[1]}</p></div>
          ))}
        </div>
      </section>

      <section className="section soft">
        <div className="container two-cols">
          <div>
            <SectionTitle eyebrow="NOTRE MISSION" title="Une foi qui transforme" text="Gagner les âmes, faire des disciples, impacter notre génération par la parole de Dieu et l’amour du Christ." />
            <CTA to="/about">Découvrir notre mission</CTA>
          </div>
          <div className="schedule-card">
            <h3>NOS HORAIRES DE CULTE</h3>
            {programs.map((program, index) => (
              <div className="schedule-row" key={program?.id || collectionName(program, `program-${index}`)}>
                <b>{collectionName(program, program?.[0])}</b>
                <span>{program?.day || program?.weekday || program?.[1]} · {program?.time || program?.[2]}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionTitle eyebrow="PROCHAINS ÉVÉNEMENTS" title="Vivons ensemble les temps forts" action={<Link to="/events" className="text-link">Voir tous →</Link>} />
          <div className="event-grid">
            {(events.length ? events : fallbackEvents).slice(0, 3).map((event, index) => {
              const name = collectionName(event, event);
              return (
                <article className="event-card" key={event?.id || name}>
                  <div className="date"><b>{18 + index * 5}</b><span>MAI</span></div>
                  <div><span className="tag">ÉVÉNEMENT</span><h3>{name}</h3><p>{event?.description || 'Temple Principal · à partir de 18h00'}</p></div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section dark-section">
        <div className="container pastor-highlight">
          <div className="pastor-placeholder"><span>PASTEUR</span><b>Jean Emmanuel</b></div>
          <div><span className="gold-label">MOT DU PASTEUR</span><blockquote>« Notre vision est de voir des vies transformées, des foyers rétablis et des destinées accomplies par le pouvoir de Jésus-Christ. »</blockquote><p>Pasteur Jean Emmanuel</p><CTA dark to="/pastor">En savoir plus sur le pasteur</CTA></div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionTitle eyebrow="NOS MINISTÈRES" title="Servir, grandir et impacter" action={<Link to="/ministries" className="text-link">Découvrir tous nos ministères →</Link>} />
          <div className="ministry-grid home-ministry">
            {ministries.slice(0, 6).map((ministry, index) => {
              const name = collectionName(ministry, ministry?.[0] || `ministry-${index}`);
              return <Link to="/ministries" className="ministry-card" key={ministry?.id || name}><i>{ministry?.icon || ministry?.[2] || '✦'}</i><h3>{name}</h3><p>{ministry?.description || ministry?.[1]}</p></Link>;
            })}
          </div>
        </div>
      </section>

      <section className="section soft">
        <div className="container media-grid">
          <div>
            <SectionTitle eyebrow="DERNIÈRES PRÉDICATIONS" title="La Parole au cœur de nos vies" action={<Link to="/sermons" className="text-link">Voir toutes →</Link>} />
            <div className="sermon-grid">
              {sermons.slice(0, 3).map((sermon, index) => {
                const name = collectionName(sermon, sermon?.[0] || `sermon-${index}`);
                return <Link to="/sermons" className="sermon-card" key={sermon?.id || name}><div className="media-thumb"><span>▶</span><em>{sermon?.duration || sermon?.[1]}</em></div><h3>{name}</h3><p>{sermon?.type || sermon?.category || sermon?.[2]} · récemment</p></Link>;
              })}
            </div>
          </div>
          <div>
            <SectionTitle eyebrow="TÉMOIGNAGES" title="Des vies transformées" />
            <div className="quote-card">
              <span>“</span>
              <p>{testimonials[0]?.content || 'Ma vie a été complètement transformée depuis que j’ai rencontré Jésus-Christ dans cette église.'}</p>
              <b>— {testimonials[0]?.name || 'Marie N.'}</b>
              <CTA to="/testimonials">Partager votre témoignage</CTA>
            </div>
          </div>
        </div>
      </section>

      <section className="donation-banner"><div><span className="gold-label">SOUTENEZ L’ŒUVRE DE DIEU</span><h2>Votre don aide à transformer des vies et à propager l’Évangile.</h2></div><CTA to="/donate">Faire un don maintenant</CTA></section>
    </>
  );
}

export function About() {
  return <><PageHero title="À PROPOS DE NOUS" text="Découvrez notre histoire, notre vision, notre mission et les valeurs qui nous guident." /><section className="section"><div className="container three-cards"><article><span>◫</span><h2>NOTRE HISTOIRE</h2><p>Gospel Break Chain Ministry a été fondée par la vision de Dieu pour briser les chaînes et apporter la délivrance, la guérison et la restauration à tous ceux qui sont liés.</p><CTA to="/pastor">Notre parcours</CTA></article><article><span>◎</span><h2>NOTRE VISION</h2><p>Être une église passionnée par la présence de Dieu et la transformation des nations.</p></article><article><span>✦</span><h2>NOTRE MISSION</h2><p>Gagner les âmes, faire des disciples, impacter notre génération par la Parole de Dieu et l’amour du Christ.</p></article></div></section><section className="section soft"><div className="container"><SectionTitle eyebrow="NOS VALEURS" title="Ce qui nous guide" /><div className="values">{['Amour', 'Intégrité', 'Puissance', 'Unité', 'Sainteté', 'Excellence'].map((v) => <div key={v}><i>✓</i><b>{v}</b></div>)}</div></div></section></>;
}

export function Pastor() {
  return <><PageHero eyebrow="NOTRE PASTEUR" title="Pasteur Jean Emmanuel" text="Fondateur & Pasteur Principal de Gospel Break Chain Ministry." /><section className="section"><div className="container pastor-layout"><div className="pastor-photo"><span>PHOTO DU PASTEUR</span><b>Jean Emmanuel</b></div><article className="message-card"><span className="gold-label">MOT DU PASTEUR</span><h2>Une vision pour restaurer des vies</h2><p>La vision de Dieu pour cette église est simple : gagner les âmes, bâtir des disciples et impacter notre génération par la parole de Dieu et l’amour du Christ.</p><p>Dieu nous a appelés à briser les chaînes de la délivrance, de la guérison et de la restauration. Nous croyons que personne n’est trop loin de la grâce de Dieu.</p><p className="signature">Pasteur Jean Emmanuel</p></article></div></section><section className="section soft"><div className="container timeline-cols"><div><SectionTitle eyebrow="PARCOURS" title="Un appel au service" /><div className="timeline">{[['2005', 'Conversion et appel au ministère'], ['2008', 'Formation biblique et théologique'], ['2010', 'Début du ministère de délivrance et d’enseignements'], ['2016', 'Fondation de Gospel Break Chain Ministry'], ['Aujourd’hui', 'Pasteur principal et visionnaire de l’œuvre']].map((x) => <div key={x[0]}><b>{x[0]}</b><span>{x[1]}</span></div>)}</div></div><div><SectionTitle eyebrow="VALEURS PASTORALES" title="Servir avec conviction" /><ul className="check-list">{['La Parole de Dieu comme fondement', 'L’amour pour les âmes', 'L’intégrité et la transparence', 'La puissance du Saint-Esprit', 'L’unité du corps de Christ'].map((v) => <li key={v}>✓ {v}</li>)}</ul></div></div></section></>;
}

function CollectionPage({ loader, title, text, fallbackData, render }) {
  const data = useRemote(loader, fallbackData);
  return <><PageHero title={title} text={text} /><section className="section"><div className="container">{render(data)}</div></section></>;
}

export function Ministries() {
  return <CollectionPage loader={churchApi.ministries} title="NOS MINISTÈRES" text="Découvrir les espaces où chacun peut servir, grandir et contribuer à l’œuvre de Dieu." fallbackData={fallbackMinistries} render={(data) => <div className="ministry-grid">{data.map((ministry, index) => { const name = collectionName(ministry, ministry?.[0] || `ministry-${index}`); return <article className="ministry-card large" key={ministry?.id || name}><i>{ministry?.icon || ministry?.[2] || '✦'}</i><h2>{name}</h2><p>{ministry?.description || ministry?.[1]}</p><Link to="/contact">En savoir plus →</Link></article>; })}</div>} />;
}

export function Programs() {
  return <CollectionPage loader={churchApi.programs} title="NOS PROGRAMMES" text="Retrouvez les rendez-vous réguliers de la communauté." fallbackData={fallbackPrograms} render={(data) => <div className="schedule-list">{data.map((program, index) => <article key={program?.id || collectionName(program, program?.[0] || `program-${index}`)}><div className="program-icon">◷</div><div><span className="gold-label">{program?.day || program?.weekday || program?.[1]}</span><h2>{collectionName(program, program?.[0])}</h2><p>{program?.description || program?.[3]}</p></div><strong>{program?.time || program?.[2]}</strong></article>)}</div>} />;
}

export function Events() {
  return <CollectionPage loader={churchApi.events} title="ÉVÉNEMENTS" text="Les prochains temps forts de Gospel Break Chain Ministry." fallbackData={[]} render={(data) => <div className="event-grid big">{(data.length ? data : fallbackEvents).map((event, index) => { const name = collectionName(event, event); return <article className="event-feature" key={event?.id || name}><div className="event-image"><span>{String(index + 1).padStart(2, '0')}</span></div><div className="event-body"><span className="tag">À VENIR</span><h2>{name}</h2><p>{event?.description || 'Un temps de communion, de prière et d’enseignement autour de la Parole de Dieu.'}</p><b>{event?.time || '18h00'} · {event?.location || 'Temple Principal'}</b><Link to="/contact">Plus d’informations →</Link></div></article>; })}</div>} />;
}

export function Sermons() {
  return <CollectionPage loader={churchApi.sermons} title="PRÉDICATIONS" text="Écoutez, regardez et méditez les enseignements du ministère." fallbackData={fallbackSermons} render={(data) => <><div className="filters"><button className="selected" type="button">Toutes</button><button type="button">Vidéos</button><button type="button">Audios</button><button type="button">PDF</button></div><div className="sermon-grid full">{data.map((sermon, index) => { const name = collectionName(sermon, sermon?.[0] || `sermon-${index}`); return <article className="sermon-card" key={sermon?.id || name}><div className="media-thumb"><span>▶</span><em>{sermon?.duration || sermon?.[1]}</em></div><h2>{name}</h2><p>{sermon?.type || sermon?.category || sermon?.[2]} · Pasteur Jean Emmanuel</p></article>; })}</div></>} />;
}

export function Gallery() {
  const gallery = useRemote(churchApi.gallery, fallbackGallery);

  return <><PageHero title="GALERIE" text="Quelques instants de vie, de service et de communion." /><section className="section"><div className="container gallery-grid">{gallery.map((item, index) => { const title = collectionName(item, `Album ${index + 1}`); const image = item?.image_url || item?.imageUrl || item?.url || item?.src; return <div className="gallery-item" key={item?.id || title}><span>{image ? <img src={image} alt={title} loading="lazy" /> : 'GBCM'}</span><b>{title}</b></div>; })}</div></section></>;
}
