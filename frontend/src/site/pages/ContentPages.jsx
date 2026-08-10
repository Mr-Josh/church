import { Link } from 'react-router-dom';
import { CTA, PageHero, SectionTitle } from '../components';
import { ministries, programs, sermons } from '../data';

export function Home() {
  return (
    <>
      <section className="hero-home">
        <div className="hero-overlay" />
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
            {programs.map((p) => <div className="schedule-row" key={p[0]}><b>{p[0]}</b><span>{p[1]} · {p[2]}</span></div>)}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionTitle eyebrow="PROCHAINS ÉVÉNEMENTS" title="Vivons ensemble les temps forts" action={<Link to="/events" className="text-link">Voir tous →</Link>} />
          <div className="event-grid">
            {['Campagne de délivrance', 'Conférence des jeunes', 'Veillée de prière'].map((x, i) => (
              <article className="event-card" key={x}>
                <div className="date"><b>{18 + i * 5}</b><span>MAI</span></div>
                <div><span className="tag">ÉVÉNEMENT</span><h3>{x}</h3><p>{i === 0 ? 'Du 15 au 20 Juin · 18h00' : 'Temple Principal · à partir de 18h00'}</p></div>
              </article>
            ))}
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
          <div className="ministry-grid home-ministry">{ministries.slice(0, 6).map((m) => <Link to="/ministries" className="ministry-card" key={m[0]}><i>{m[2]}</i><h3>{m[0]}</h3><p>{m[1]}</p></Link>)}</div>
        </div>
      </section>

      <section className="section soft">
        <div className="container media-grid">
          <div><SectionTitle eyebrow="DERNIÈRES PRÉDICATIONS" title="La Parole au cœur de nos vies" action={<Link to="/sermons" className="text-link">Voir toutes →</Link>} /><div className="sermon-grid">{sermons.map((s) => <Link to="/sermons" className="sermon-card" key={s[0]}><div className="media-thumb"><span>▶</span><em>{s[1]}</em></div><h3>{s[0]}</h3><p>{s[2]} · récemment</p></Link>)}</div></div>
          <div><SectionTitle eyebrow="TÉMOIGNAGES" title="Des vies transformées" /><div className="quote-card"><span>“</span><p>Ma vie a été complètement transformée depuis que j’ai rencontré Jésus-Christ dans cette église.</p><b>— Marie N.</b><CTA to="/testimonials">Partager votre témoignage</CTA></div></div>
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

export function Ministries() {
  return <><PageHero title="NOS MINISTÈRES" text="Découvrir les espaces où chacun peut servir, grandir et contribuer à l’œuvre de Dieu." /><section className="section"><div className="container ministry-grid">{ministries.map((m) => <article className="ministry-card large" key={m[0]}><i>{m[2]}</i><h2>{m[0]}</h2><p>{m[1]}</p><Link to="/contact">En savoir plus →</Link></article>)}</div></section></>;
}

export function Programs() {
  return <><PageHero title="NOS PROGRAMMES" text="Retrouvez les rendez-vous réguliers de la communauté." /><section className="section"><div className="container schedule-list">{programs.map((p) => <article key={p[0]}><div className="program-icon">◷</div><div><span className="gold-label">{p[1]}</span><h2>{p[0]}</h2><p>{p[3]}</p></div><strong>{p[2]}</strong></article>)}</div></section></>;
}

export function Events() {
  return <><PageHero title="ÉVÉNEMENTS" text="Les prochains temps forts de Gospel Break Chain Ministry." /><section className="section"><div className="container event-grid big">{['Campagne de délivrance', 'Conférence des jeunes', 'Veillée de prière', 'Séminaire biblique', 'Jeûne & prière', 'Journée d’évangélisation'].map((e, i) => <article className="event-feature" key={e}><div className="event-image"><span>{String(i + 1).padStart(2, '0')}</span></div><div className="event-body"><span className="tag">À VENIR</span><h2>{e}</h2><p>Un temps de communion, de prière et d’enseignement autour de la Parole de Dieu.</p><b>18h00 · Temple Principal</b><Link to="/contact">Plus d’informations →</Link></div></article>)}</div></section></>;
}

export function Sermons() {
  return <><PageHero title="PRÉDICATIONS" text="Écoutez, regardez et méditez les enseignements du ministère." /><section className="section"><div className="container filters"><button className="selected">Toutes</button><button>Vidéos</button><button>Audios</button><button>PDF</button></div><div className="container sermon-grid full">{sermons.concat([['La foi qui déplace les montagnes', '52:11', 'Prédication']]).map((s) => <article className="sermon-card" key={s[0]}><div className="media-thumb"><span>▶</span><em>{s[1]}</em></div><h2>{s[0]}</h2><p>{s[2]} · Pasteur Jean Emmanuel</p></article>)}</div></section></>;
}

export function Gallery() {
  return <><PageHero title="GALERIE" text="Quelques instants de vie, de service et de communion." /><section className="section"><div className="container gallery-grid">{Array.from({ length: 12 }, (_, i) => <div className="gallery-item" key={i}><span>GBCM</span><b>Album {i + 1}</b></div>)}</div></section></>;
}
