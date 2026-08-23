import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CTA, SectionTitle } from "../components";
import { churchApi } from "../../services/churchApi";
import { useBibleVerse } from "../../useBibleVerse";
import { church } from "../config";

function useRemote(loader, initialValue = []) {
  const [data, setData] = useState(initialValue);
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

function useChurchSettings() {
  const [settings, setSettings] = useState(church);
  useEffect(() => {
    let active = true;
    churchApi
      .church()
      .then((payload) => {
        const data = Array.isArray(payload?.data)
          ? payload.data[0]
          : payload?.data;
        if (active && data && typeof data === "object")
          setSettings({ ...church, ...data });
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);
  return settings;
}

function formatTime(value) {
  return value ? String(value).slice(0, 5) : "";
}
function formatEventDate(value) {
  if (!value) return { day: "", month: "", time: "" };
  const date = new Date(String(value).replace(" ", "T"));
  if (Number.isNaN(date.getTime())) return { day: "", month: "", time: "" };
  return {
    day: String(date.getDate()).padStart(2, "0"),
    month: date
      .toLocaleDateString("fr-FR", { month: "short" })
      .replace(".", "")
      .toUpperCase(),
    time: date.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
}

export function Home() {
  const settings = useChurchSettings();
  // const programs = useRemote(churchApi.programs); // désactivé
  const ministries = useRemote(churchApi.ministries);
  // const events = useRemote(churchApi.events);     // désactivé
  const testimonials = useRemote(churchApi.testimonials);
  const verse = useBibleVerse(6000);
  const pastorName = settings.pastor_name || "Jean Emmanuel";
  const whatsapp = settings.whatsapp
    ? `https://wa.me/${String(settings.whatsapp).replace(/\D/g, "")}`
    : "";

  return (
    <>
      <section className="hero-home">
        <div className="container hero-content">
          <p className="eyebrow">
            {settings.church_name || "GOSPEL BREAK CHAIN MINISTRY"}
          </p>
          <h1>
            {(settings.slogan || "PAR LE POUVOIR DE CHRIST").toUpperCase()}
          </h1>
          <div className="hero-verse" key={verse.id}>
            <p className="verse">« {verse.text} »</p>
            <b>{verse.reference}</b>
          </div>
          <div className="hero-actions">
            <CTA to="/">Nous rejoindre</CTA>
            <CTA dark to="/prayer">
              Faire une demande de prière
            </CTA>
          </div>
        </div>
      </section>

      <section className="section soft" id="a-propos">
        <div className="container about-home">
          <div>
            <SectionTitle
              eyebrow="À PROPOS"
              title="Notre Mission"
              text={settings.mission || church.mission}
            />
            <div className="vision-box" style={{ marginTop: 20 }}>
              <span
                className="gold-label"
                style={{
                  fontWeight: "bold",
                  display: "block",
                  marginBottom: 8,
                }}
              >
                NOTRE VISION (LUC 4:18-19)
              </span>
              <p style={{ fontStyle: "italic", lineHeight: 1.7 }}>
                {settings.vision || church.vision}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section dark-section" id="pasteur">
        <div className="container pastor-highlight">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <img src="/past.png" alt={pastorName} className="pastor-photo" />
          </div>
          <div>
            <span className="gold-label">MOT DU PASTEUR & VISION</span>
            <blockquote>{settings.vision || church.vision}</blockquote>
            <p>{pastorName}</p>
          </div>
        </div>
      </section>

      <section className="section" id="ministeres">
        <div className="container">
          <SectionTitle
            eyebrow="NOS MINISTÈRES"
            title="Servir, grandir et impacter"
          />
          <div className="ministry-grid home-ministry">
            {ministries.length === 0 ? (
              <p>Aucun ministère publié.</p>
            ) : (
              ministries.slice(0, 9).map((ministry) => (
                <article className="ministry-card" key={ministry.id}>
                  <i>✦</i>
                  <h3>{ministry.name}</h3>
                  <p>{ministry.description}</p>
                </article>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="section soft">
        <div className="container">
          <SectionTitle eyebrow="TÉMOIGNAGES" title="Des vies transformées" />
          <div className="quote-card">
            <span>“</span>
            {testimonials.length === 0 ? (
              <p>Aucun témoignage publié pour le moment.</p>
            ) : (
              <>
                <p>{testimonials[0].content}</p>
                <b>— {testimonials[0].name}</b>
              </>
            )}
            <CTA to="/testimonials">Partager votre témoignage</CTA>
          </div>
        </div>
      </section>

      <section className="section contact-page" id="contact">
        <div className="container contact-layout">
          <div className="contact-info">
            <SectionTitle
              eyebrow="CONTACT"
              title="Parlons-nous"
              text="Une question, un besoin particulier ? Nous sommes disponibles."
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
                <span>694880056</span>
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
            <span>NOTRE LOCALISATION</span>
            <b>{settings.church_name || "Gospel Break Chain Ministry"}</b>
            <small>{settings.address || church.address}</small>
            <div className="map-pin">⌖</div>
          </div>
        </div>
      </section>

      <section className="donation-banner">
        <div>
          <span className="gold-label">SOUTENEZ L’ŒUVRE DE DIEU</span>
          <h2>
            Votre don aide à transformer des vies et à propager l’Évangile.
          </h2>
        </div>
        <CTA to="/donate">Faire un don maintenant</CTA>
      </section>
    </>
  );
}

export function About() {
  return null;
}
export function Programs() {
  return (
    <CollectionPage
      loader={churchApi.programs}
      title="NOS PROGRAMMES"
      text="Retrouvez les rendez-vous réguliers de la communauté."
      render={(data) =>
        data.length === 0 ? (
          <p>Aucun programme publié.</p>
        ) : (
          <div className="schedule-list">
            {data.map((program) => (
              <article key={program.id}>
                <div className="program-icon">◷</div>
                <div>
                  <span className="gold-label">{program.day || ""}</span>
                  <h2>{program.title}</h2>
                  <p>{program.description}</p>
                </div>
                <strong>
                  {formatTime(program.start_time)}
                  {program.end_time ? ` – ${formatTime(program.end_time)}` : ""}
                </strong>
              </article>
            ))}
          </div>
        )
      }
    />
  );
}
export function Events() {
  return (
    <CollectionPage
      loader={churchApi.events}
      title="ÉVÉNEMENTS"
      text="Les prochains temps forts de Gospel Break Chain Ministry."
      render={(data) =>
        data.length === 0 ? (
          <p>Aucun événement publié.</p>
        ) : (
          <div className="event-grid big">
            {data.map((event, index) => {
              const date = formatEventDate(event.event_date);
              return (
                <article className="event-feature" key={event.id}>
                  <div className="event-image">
                    {event.image ? (
                      <img src={event.image} alt={event.title} />
                    ) : (
                      <span>{String(index + 1).padStart(2, "0")}</span>
                    )}
                  </div>
                  <div className="event-body">
                    <span className="tag">À VENIR</span>
                    <h2>{event.title}</h2>
                    <p>{event.description}</p>
                    <b>
                      {date.time}
                      {event.location ? ` · ${event.location}` : ""}
                    </b>
                  </div>
                </article>
              );
            })}
          </div>
        )
      }
    />
  );
}

function CollectionPage({ loader, title, text, render }) {
  const data = useRemote(loader);
  return (
    <>
      <section className="section page-title-simple">
        <div className="container">
          <SectionTitle
            eyebrow="GOSPEL BREAK CHAIN MINISTRY"
            title={title}
            text={text}
          />
        </div>
      </section>
      <section className="section">
        <div className="container">{render(data)}</div>
      </section>
    </>
  );
}
