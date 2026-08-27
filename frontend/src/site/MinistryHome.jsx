import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CTA, SectionTitle } from "./components";
import { churchApi } from "../services/churchApi";
import { church } from "./config";
import { eventGallery } from "./eventGallery";
import "./ministry-content.css";

function useSettings() {
  const [settings, setSettings] = useState(church);
  useEffect(() => {
    let active = true;
    churchApi
      .church()
      .then((payload) => {
        const value = payload?.data;
        const data = Array.isArray(value) ? value[0] : value;
        if (active && data) setSettings({ ...church, ...data });
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);
  return settings;
}

function useRemote(loader) {
  const [data, setData] = useState([]);
  useEffect(() => {
    let active = true;
    loader()
      .then((payload) => {
        const value = Array.isArray(payload) ? payload : payload?.data;
        if (active && Array.isArray(value)) setData(value);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [loader]);
  return data;
}

const actions = [
  [
    "Évangélisation & missions",
    "ALLER VERS LES PEUPLES NON ATTEINTS",
    "Évangélisation auprès des populations ayant peu ou pas accès à l’Évangile, dans les zones d’ombre, régions difficiles d’accès et communautés vulnérables.",
  ],
  [
    "Enfance & solidarité",
    "REDONNER UN AVENIR AUX ENFANTS VULNÉRABLES",
    "Scolarisation et prise en charge des orphelins et demi-orphelins victimes de guerre : accompagnement, soutien matériel, encadrement et perspectives d’avenir.",
  ],
  [
    "Relation d’aide chrétienne",
    "ÉCOUTER, ACCOMPAGNER, RESTAURER",
    "Écoute, accompagnement spirituel, soutien émotionnel, orientation, accompagnement en période de crise et prière.",
  ],
];

const projects = [
  [
    "Parrainage d’un enfant",
    "Accompagner les orphelins et demi-orphelins victimes de guerre dans leur scolarité et leur reconstruction.",
    "/donate",
    "Soutenir ce projet",
  ],
  [
    "Missions auprès des non-atteints",
    "Financer et soutenir les missions auprès des communautés difficiles d’accès.",
    "/donate",
    "Soutenir la mission",
  ],
  [
    "Soutenir la relation d’aide",
    "Développer les capacités d’écoute et d’accompagnement.",
    "/help",
    "Être accompagné",
  ],
];

const prayerPoints = [
  "Peuples non atteints",
  "Équipes missionnaires",
  "Enfants victimes des conflits",
  "Familles touchées par la guerre",
  "Nouvelles portes pour l’Évangile",
  "Protection des équipes et ressources nécessaires",
];

function EventPreviewCard({ event }) {
  const photo =
    Array.isArray(event.photos) && event.photos.length ? event.photos[0] : null;
  const image = photo?.image || event.image;
  return (
    <Link to="/events" className="impact-event-card">
      {image ? (
        <div
          className="impact-event-image"
          style={{
            backgroundImage: `url(${image})`,
            backgroundPosition: photo?.position || "center",
          }}
        />
      ) : (
        <div className="impact-event-image impact-event-image-empty">
          <span>PHOTO À VENIR</span>
        </div>
      )}
      <div className="impact-event-content">
        <span className="gold-label">ACTION DE TERRAIN</span>
        <h3>{event.title}</h3>
        <p>
          {event.description ||
            "Découvrez cette action réalisée par le ministère."}
        </p>
        <span className="impact-event-link">Voir les détails →</span>
      </div>
    </Link>
  );
}

export default function MinistryHome() {
  const settings = useSettings();
  const testimonials = useRemote(churchApi.testimonials);
  const events = useRemote(churchApi.events);
  const pastorName = settings.pastor_name || "Jean Emmanuel";
  const whatsapp = settings.whatsapp
    ? `https://wa.me/${String(settings.whatsapp).replace(/\D/g, "")}`
    : "";
  const visibleEvents = events
    .filter((event) => event.status !== "draft")
    .slice(0, 3);
  const impactFallback = eventGallery.slice(0, 3).map((item) => ({
    id: item.eventTitle,
    title: item.eventTitle,
    description: item.description,
    image: item.photos[0]?.image,
  }));

  return (
    <>
      <section className="hero-home ministry-hero">
        <div className="container hero-content">
          <p className="eyebrow">GOSPEL BREAK CHAIN MINISTRY</p>
          <h1>BRISONS LES CHAÎNES PAR LE POUVOIR DE CHRIST</h1>
          <p className="hero-positioning">
            Porter l’Évangile là où il est encore peu connu, restaurer les vies
            et apporter l’espérance de Christ aux communautés qui en ont le plus
            besoin.
          </p>
          <p className="hero-description">
            Gospel Break Chain Ministry est un ministère chrétien consacré à
            l’évangélisation, aux missions sur le terrain et à la restauration
            des vies.
          </p>
          <div className="hero-actions">
            <CTA to="/prayer">Faire une demande de prière</CTA>
            <CTA dark to="/donate">
              Soutenir notre mission
            </CTA>
          </div>
        </div>
      </section>

      <section className="section soft" id="a-propos">
        <div className="container">
          <SectionTitle
            eyebrow="À PROPOS"
            title="UN MINISTÈRE ENVOYÉ SUR LE TERRAIN"
            text="Nous sommes un ministère chrétien dédié à l’évangélisation et aux missions, avec pour vocation d’aller à la rencontre des populations et communautés qui se trouvent dans des situations difficiles ou qui ont encore peu accès à l’Évangile."
          />
          <div className="about-editorial-grid">
            <article>
              <span className="gold-label">QUI SOMMES-NOUS ?</span>
              <p>
                Notre mission ne se limite pas à annoncer un message. Nous
                voulons être présents là où les besoins humains, sociaux,
                spirituels et émotionnels sont les plus importants.
              </p>
              <p>
                L’Évangile doit être annoncé, mais également vécu à travers
                l’amour, le service, la compassion et l’action.
              </p>
            </article>
            <article>
              <span className="gold-label">MISSION</span>
              <h3>
                Porter l’Évangile du Seigneur Jésus-Christ partout où le besoin
                se fait sentir.
              </h3>
              <p>Fondement biblique : Luc 4:18-19.</p>
            </article>
            <article>
              <span className="gold-label">VISION</span>
              <h3>Restaurer, libérer et impacter.</h3>
              <p>
                Restauration des vies, libération des captifs, guérison des
                cœurs brisés, restauration des familles et transformation
                spirituelle et sociale des communautés.
              </p>
            </article>
            <article>
              <span className="gold-label">L’ÉVANGILE</span>
              <h3>L’Évangile est simple, complet et puissant.</h3>
              <ul>
                <li>
                  <b>Simple :</b> accessible à tous.
                </li>
                <li>
                  <b>Complet :</b> il concerne l’être humain dans toute sa
                  dimension.
                </li>
                <li>
                  <b>Puissant :</b> la Parole de Dieu transforme profondément
                  les vies.
                </li>
              </ul>
            </article>
          </div>
        </div>
      </section>

      <section className="section" id="ministeres">
        <div className="container">
          <SectionTitle
            eyebrow="NOS DOMAINES DE SERVICE"
            title="Servir là où le besoin se fait sentir"
          />
          <div className="action-grid">
            {actions.map(([label, title, text, icon]) => (
              <article className="action-card" key={label}>
                <i>{icon}</i>
                <span className="gold-label">{label}</span>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section dark-section" id="pasteur">
        <div className="container pastor-highlight ministry-pastor">
          <img
            src={settings.pastor_photo || "/past.png"}
            alt={pastorName}
            className="pastor-photo"
          />
          <div>
            <span className="gold-label">LE MISSIONAIRE</span>
            <h2>{pastorName}</h2>
            <h3>
              {settings.pastor_title || "Fondateur & visionnaire du ministère"}
            </h3>
            <p>
              {settings.pastor_bio ||
                "Porter l’Évangile sur le terrain, accompagner les personnes vulnérables et contribuer à la restauration des vies."}
            </p>
          </div>
        </div>
      </section>

      <section className="section soft">
        <div className="container">
          <SectionTitle
            eyebrow="NOS PROJETS"
            title="DES PROJETS QUI ONT BESOIN DE VOUS"
          />
          <div className="project-grid">
            {projects.map(([title, text, to, action]) => (
              <article className="project-card" key={title}>
                <h3>{title}</h3>
                <p>{text}</p>
                <Link className="text-action" to="/prayer">
                  Appel à la prière →
                </Link>
                <CTA to={to}>{action}</CTA>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionTitle
            eyebrow="IMPACT / ACTIONS RÉALISÉES"
            title="ILS ONT VU L’ACTION"
            text="Découvrez ce que Dieu accomplit sur le terrain."
          />
          <div className="impact-grid impact-events-grid">
            {(visibleEvents.length ? visibleEvents : impactFallback).map(
              (event) => (
                <EventPreviewCard key={event.id} event={event} />
              ),
            )}
          </div>
          <div className="impact-events-more">
            <CTA to="/events">Voir tous les événements →</CTA>
          </div>
        </div>
      </section>

      <section className="section soft">
        <div className="container">
          <SectionTitle eyebrow="TÉMOIGNAGES" title="Des vies transformées" />
          <div className="quote-card">
            <span>“</span>
            {testimonials.length ? (
              <>
                <p>{testimonials[0].content}</p>
                <b>— {testimonials[0].name}</b>
              </>
            ) : (
              <p>
                Les témoignages des personnes accompagnées seront publiés ici
                après validation.
              </p>
            )}
            <CTA to="/testimonials">Partager votre témoignage</CTA>
          </div>
        </div>
      </section>

      <section className="section prayer-call">
        <div className="container prayer-call-grid">
          <div>
            <span className="gold-label">PRIÈRE</span>
            <h2>NOUS AVONS BESOIN DE VOUS DANS LA PRIÈRE</h2>
            <p>
              Portons ensemble l’œuvre missionnaire, les équipes et les
              personnes touchées par les conflits et la vulnérabilité.
            </p>
          </div>
          <ul>
            {prayerPoints.map((point) => (
              <li key={point}>✓ {point}</li>
            ))}
          </ul>
          <CTA to="/prayer">Faire une demande de prière</CTA>
        </div>
      </section>

      <section className="donation-banner ministry-donation">
        <div>
          <span className="gold-label">APPEL AU DON</span>
          <h2>VOTRE DON PEUT DEVENIR UNE MISSION</h2>
          <p>
            Vos dons peuvent contribuer aux missions, à l’éducation, à
            l’accompagnement et à l’évangélisation.
          </p>
        </div>
        <CTA to="/donate">Soutenir la mission</CTA>
      </section>

      <section className="section contact-page" id="contact">
        <div className="container contact-layout">
          <div className="contact-info">
            <SectionTitle
              eyebrow="CONTACT"
              title="Restons en relation"
              text="Une question, une demande de prière ou un besoin d’accompagnement ?"
            />
            {whatsapp && (
              <a className="contact-card" href={whatsapp}>
                <i>◉</i>
                <div>
                  <b>WhatsApp</b>
                  <span>Écrivez-nous directement</span>
                </div>
                <strong>→</strong>
              </a>
            )}
            <div className="contact-card">
              <i>☎</i>
              <div>
                <b>Téléphone</b>
                <span>{settings.phone || ""}</span>
              </div>
            </div>
            <div className="contact-card">
              <i>⌖</i>
              <div>
                <b>Adresse</b>
                <span>{settings.address || church.address}</span>
              </div>
            </div>
            <div className="contact-card">
              <i>✉</i>
              <div>
                <b>Email</b>
                <span>{settings.email || church.email}</span>
              </div>
            </div>
          </div>
          <div className="map-placeholder">
            <span>NOUS CONTACTER</span>
            <b>{settings.church_name || "Gospel Break Chain Ministry"}</b>
            <small>{settings.address || church.address}</small>
            <div className="map-pin">⌖</div>
          </div>
        </div>
      </section>
    </>
  );
}
