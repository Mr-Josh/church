import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PageHero, SectionTitle } from "../components";
import { TestimonialCarousel } from "../TestimonialCarousel";
import { churchApi } from "../../services/churchApi";
import { WHATSAPP_URL } from "../config";

const emptyRequest = {
  name: "",
  phone: "",
  email: "",
  subject: "",
  message: "",
  is_confidential: false,
  is_urgent: false,
};

function normalizeSettings(payload) {
  const value = payload?.data;
  return Array.isArray(value) ? value[0] || {} : value || {};
}

function useChurchSettings() {
  const [settings, setSettings] = useState({});
  useEffect(() => {
    let active = true;
    churchApi
      .church()
      .then((payload) => {
        if (active) setSettings(normalizeSettings(payload));
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);
  return settings;
}

function getWhatsAppUrl(settings) {
  return settings?.whatsapp
    ? `https://wa.me/${String(settings.whatsapp).replace(/\D/g, "")}`
    : WHATSAPP_URL;
}

export function Testimonials() {
  const [testimonials, setTestimonials] = useState([]),
    [name, setName] = useState(""),
    [content, setContent] = useState(""),
    [sent, setSent] = useState(false),
    [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    churchApi
      .testimonials()
      .then((payload) => {
        if (!active) return;
        const data = Array.isArray(payload) ? payload : payload?.data;
        if (Array.isArray(data)) setTestimonials(data);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);
  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setSent(false);
    try {
      await churchApi.submitTestimonial({ name, content });
      setSent(true);
      setName("");
      setContent("");
    } catch (requestError) {
      setError(requestError.message);
    }
  };
  return (
    <>
      <PageHero
        title="TÉMOIGNAGES"
        text="Découvrez des récits de vies transformées par la grâce de Dieu."
      />
      <section className="section">
        <div className="container testimonials">
          <div className="testimonial-list">
            <TestimonialCarousel items={testimonials} />
          </div>
          <form className="form-card" onSubmit={submit}>
            <span className="gold-label">PARTAGER</span>
            <h2>Votre témoignage</h2>
            <label>
              Nom
              <input
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </label>
            <label>
              Votre témoignage
              <textarea
                required
                value={content}
                onChange={(event) => setContent(event.target.value)}
              />
            </label>
            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
            {sent && (
              <p className="form-success" role="status">
                Votre témoignage a été envoyé pour validation.
              </p>
            )}
            <button className="btn" type="submit">
              {sent ? "Envoyer un autre témoignage" : "Envoyer mon témoignage"}{" "}
              <span>→</span>
            </button>
          </form>
        </div>
      </section>
    </>
  );
}

function AssistancePrompt({ whatsappUrl, onClose }) {
  const openWhatsApp = () => {
    window.location.href = whatsappUrl;
  };
  return (
    <div className="assistance-modal-backdrop" role="presentation">
      <div
        className="assistance-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="assistance-title"
      >
        <button
          className="assistance-modal-close"
          type="button"
          onClick={onClose}
          aria-label="Fermer"
        >
          ×
        </button>
        <span className="gold-label">DEMANDE ENREGISTRÉE</span>
        <h2 id="assistance-title">Avez-vous besoin d'assistance ?</h2>
        <p>
          Votre demande a bien été envoyée. Si vous souhaitez échanger
          directement avec l'équipe, nous pouvons vous rediriger vers WhatsApp.
        </p>
        <div className="assistance-modal-actions">
          <button className="btn" type="button" onClick={openWhatsApp}>
            Oui, contacter sur WhatsApp <span>→</span>
          </button>
          <button className="btn outline" type="button" onClick={onClose}>
            Non, rester ici
          </button>
        </div>
      </div>
    </div>
  );
}

function RequestForm({ kind }) {
  const [form, setForm] = useState(emptyRequest),
    [sent, setSent] = useState(false),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(false),
    [showAssistance, setShowAssistance] = useState(false);
  const settings = useChurchSettings();
  const isPrayer = kind === "prayer";
  const whatsappUrl = getWhatsAppUrl(settings);

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setSent(false);
    setLoading(true);

    const prayerSubject = (form.subject || form.message || "").trim();
    const prayerName = (form.name || "").trim();

    try {
      if (isPrayer) {
        await churchApi.submitPrayerRequest({
          ...form,
          message: prayerSubject,
        });

        // Pre-crafted structured WhatsApp message
        const greeting = "Bonjour,";
        const namePart = prayerName ? `Moi c'est ${prayerName}.` : "Moi c'est un(e) fidèle / ami(e) en Christ.";
        const subjectPart = `Voici mon sujet de prière :\n${prayerSubject}`;

        const fullMessage = `${greeting}\n\n${namePart}\n\n${subjectPart}`;
        const targetPhone = "237692765158";
        const targetUrl = `https://wa.me/${targetPhone}?text=${encodeURIComponent(fullMessage)}`;

        setSent(true);
        setForm(emptyRequest);

        // Redirect user to WhatsApp
        window.location.href = targetUrl;
      } else {
        await churchApi.submitHelpRequest(form);
        setSent(true);
        setForm(emptyRequest);
        setShowAssistance(true);
      }
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form className="form-card" onSubmit={submit}>
        <div className="form-grid">
          <label>
            Nom{isPrayer ? " (optionnel)" : ""}
            <input
              value={form.name}
              onChange={(event) =>
                setForm({ ...form, name: event.target.value })
              }
              placeholder="Votre nom"
            />
          </label>
          <label>
            Téléphone *
            <input
              required
              value={form.phone}
              onChange={(event) =>
                setForm({ ...form, phone: event.target.value })
              }
              placeholder="Votre numéro"
            />
          </label>
          {isPrayer && (
            <label>
              Email (optionnel)
              <input
                type="email"
                value={form.email}
                onChange={(event) =>
                  setForm({ ...form, email: event.target.value })
                }
                placeholder="Votre email"
              />
            </label>
          )}
        </div>

        {isPrayer ? (
          <label style={{ marginTop: 16, display: 'block' }}>
            Sujet de prière *
            <textarea
              required
              rows={4}
              value={form.subject}
              onChange={(event) =>
                setForm({ ...form, subject: event.target.value, message: event.target.value })
              }
              placeholder="Écrivez votre sujet et demande de prière ici…"
            />
          </label>
        ) : (
          <label style={{ marginTop: 16, display: 'block' }}>
            Votre demande *
            <textarea
              required
              rows={4}
              value={form.message}
              onChange={(event) =>
                setForm({ ...form, message: event.target.value })
              }
              placeholder="Décrivez votre besoin ici…"
            />
          </label>
        )}
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        {sent && !showAssistance && (
          <p className="form-success" role="status">
            {isPrayer
              ? "Votre demande de prière a bien été reçue."
              : "Votre demande d'assistance a bien été reçue."}
          </p>
        )}
        <button className="btn" type="submit" disabled={loading}>
          {loading
            ? "Envoi en cours…"
            : sent
              ? "Envoyer une nouvelle demande"
              : "Envoyer ma demande"}{" "}
          <span>→</span>
        </button>
      </form>
      {showAssistance && (
        <AssistancePrompt
          whatsappUrl={whatsappUrl}
          onClose={() => setShowAssistance(false)}
        />
      )}
    </>
  );
}

export function Prayer() {
  return (
    <>
      <section className="section prayer-page">
        <div className="container narrow">
          <SectionTitle
            eyebrow="PRIÈRE"
            title="Votre demande de prière"
            text="Confiez-nous votre sujet de prière. Nous le porterons dans la prière."
          />
          <RequestForm kind="prayer" />
        </div>
      </section>
    </>
  );
}

export function Evangelism() {
  return (
    <>
      <section className="section evangelism-page">
        <div className="container two-cols evangelism">
          <div>
            <SectionTitle
              eyebrow="ÉVANGÉLISATION"
              title="JÉSUS PEUT TRANSFORMER VOTRE VIE"
              text="Découvrez l'Évangile et commencez une relation personnelle avec Jésus-Christ."
            />
            <div className="steps">
              {[
                [
                  "COMMENT RECEVOIR JÉSUS ?",
                  "Découvrez comment donner votre vie à Christ.",
                ],
                [
                  "PRIÈRE DU SALUT",
                  "Faites cette prière avec foi et sincérité.",
                ],
                [
                  "BESOIN D'ACCOMPAGNEMENT ?",
                  "Nous sommes là pour vous accompagner.",
                ],
                [
                  "TÉLÉCHARGER UNE BIBLE",
                  "Lisez la Parole de Dieu chaque jour.",
                ],
              ].map((item, index) => (
                <article key={item[0]}>
                  <i>{index + 1}</i>
                  <div>
                    <h3>{item[0]}</h3>
                    <p>{item[1]}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
          <div className="sunrise-card">
            <span>« Jésus vous aime »</span>
            <b>Il veut une relation personnelle avec vous.</b>
            <a href={WHATSAPP_URL}>Je veux être contacté →</a>
          </div>
        </div>
      </section>
    </>
  );
}

export function Help() {
  const [open, setOpen] = useState(0);
  const questions = [
    "Comment assister aux cultes ?",
    "Comment faire une demande de prière ?",
    "Comment rejoindre un ministère ?",
    "Comment faire un don ?",
    "Je ne trouve pas l'information dont j'ai besoin",
  ];

  const getHelpWhatsAppUrl = (topic = "") => {
    const text = topic
      ? `Bonjour,\n\nJ'ai besoin d'assistance et d'accompagnement concernant : "${topic}".\n\nMerci de bien vouloir m'éclairer. Que Dieu vous bénisse !`
      : `Bonjour,\n\nJ'ai besoin d'un accompagnement / d'une assistance auprès du ministère.\n\nPouvons-nous échanger ? Merci et que Dieu vous bénisse !`;
    return `https://wa.me/237692765158?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="help-page" style={{ paddingTop: 40, paddingBottom: 80 }}>
      <div className="container help-layout">
        <div>
          <SectionTitle
            eyebrow="ASSISTANCE & ACCOMPAGNEMENT"
            title="Nous sommes là pour vous accompagner"
            text="Besoin d'une information, d'un accompagnement ou d'une aide pratique ?"
          />
          {questions.map((question, index) => (
            <div className="faq" key={question}>
              <button
                type="button"
                onClick={() => setOpen(open === index ? -1 : index)}
                aria-expanded={open === index}
              >
                <b>{question}</b>
                <span>{open === index ? "−" : "+"}</span>
              </button>
              {open === index && (
                <div style={{ marginTop: 8 }}>
                  <p style={{ margin: "0 0 12px 0" }}>
                    Pour cette question, contactez directement l'équipe de l'église sur WhatsApp afin d'obtenir une réponse personnalisée.
                  </p>
                  <a
                    className="btn outline"
                    style={{ display: "inline-flex", padding: "8px 14px", fontSize: 13 }}
                    href={getHelpWhatsAppUrl(question)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Poser cette question sur WhatsApp <span>→</span>
                  </a>
                </div>
              )}
            </div>
          ))}

        </div>
        <aside className="help-box">
          <span className="gold-label">BESOIN D'ACCOMPAGNEMENT ?</span>
          <h2>Nous sommes à votre écoute</h2>
          <a href={getHelpWhatsAppUrl()} target="_blank" rel="noreferrer">
            WhatsApp
            <br />
            <b>Discutez avec nous</b>
          </a>
          <Link to="/prayer">
            Besoin d'une prière ?<br />
            <b>Demander une prière →</b>
          </Link>
        </aside>
      </div>
    </div>
  );
}

export function Contact() {
  const [settings, setSettings] = useState({});
  useEffect(() => {
    churchApi
      .church()
      .then((response) => setSettings(response.data || {}))
      .catch(() => {});
  }, []);
  const whatsapp = settings.whatsapp
    ? `https://wa.me/${String(settings.whatsapp).replace(/\D/g, "")}`
    : WHATSAPP_URL;
  return (
    <>
      <section className="section contact-page">
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
                <span>Mora, Extrême-Nord, Cameroun</span>
              </div>
            </div>
            <div className="contact-card">
              <i>✉</i>
              <div>
                <b>Email</b>
                <span>{settings.email || "narcisse.arenthes@yahoo.fr"}</span>
              </div>
            </div>
          </div>
          <div className="map-placeholder">
            <span>NOTRE LOCALISATION</span>
            <b>{settings.church_name || "Gospel Break Chain Ministry"}</b>
            <small>Mora, Extrême-Nord, Cameroun</small>
            <div className="map-pin">⌖</div>
          </div>
        </div>
      </section>
    </>
  );
}

export function Donate() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: '', amount: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Read return status from Genius Pay redirect (?status=success|cancelled)
  const params = new URLSearchParams(window.location.search);
  const returnStatus = params.get('status');
  const returnRef    = params.get('ref');

  const PRESET_AMOUNTS = [1000, 2500, 5000, 10000, 25000];

  const handleAmountSelect = (val) => {
    setForm((f) => ({ ...f, amount: String(val) }));
    setError('');
  };

  const handleStep1Submit = (e) => {
    e.preventDefault();
    if (!form.amount || Number(form.amount) <= 0) {
      setError('Veuillez saisir un montant valide.');
      return;
    }
    if (!form.phone.trim()) {
      setError('Le numéro de téléphone est requis.');
      return;
    }
    setError('');
    setStep(2);
  };

  const handlePay = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await churchApi.initiateDonation({
        name:   form.name.trim() || null,
        amount: Number(form.amount),
        phone:  form.phone.trim(),
      });
      // Redirect to Genius Pay checkout
      window.location.href = res.checkout_url;
    } catch (err) {
      setError(err.message || 'Une erreur est survenue. Veuillez réessayer.');
      setLoading(false);
    }
  };

  const fmt = (n) =>
    Number(n).toLocaleString('fr-FR') + ' FCFA';

  // ── Return screen after payment ──────────────────────────────────────────
  if (returnStatus === 'success') {
    return (
      <section className="section donate-page">
        <div className="container donation-ui">
          <SectionTitle eyebrow="SOUTENIR L'ŒUVRE" title="Faire un don"
            text="Soutenez l'œuvre de Dieu et contribuez à impacter davantage de vies." />
          <div className="donation-card" style={{ maxWidth: 520, margin: '0 auto', textAlign: 'center' }}>
            <div style={{ fontSize: 52, marginBottom: 12 }}>🙏</div>
            <h2 style={{ font: '700 22px Georgia,serif', color: 'var(--navy)', marginBottom: 8 }}>Don reçu avec succès !</h2>
            <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.7, marginBottom: 8 }}>
              Merci pour votre générosité. Que Dieu bénisse votre libéralité.
            </p>
            {returnRef && (
              <p style={{ fontSize: 11, color: '#64748b', marginBottom: 20 }}>
                Référence : <strong style={{ color: 'var(--navy)' }}>{returnRef}</strong>
              </p>
            )}
            <button className="btn" type="button"
              onClick={() => { setStep(1); setForm({ name: '', amount: '', phone: '' }); window.history.replaceState({}, '', '/donate'); }}>
              Faire un autre don
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (returnStatus === 'cancelled') {
    return (
      <section className="section donate-page">
        <div className="container donation-ui">
          <SectionTitle eyebrow="SOUTENIR L'ŒUVRE" title="Faire un don"
            text="Soutenez l'œuvre de Dieu et contribuez à impacter davantage de vies." />
          <div className="donation-card" style={{ maxWidth: 520, margin: '0 auto', textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>↩</div>
            <h2 style={{ font: '700 20px Georgia,serif', color: 'var(--navy)', marginBottom: 8 }}>Paiement annulé</h2>
            <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.7, marginBottom: 20 }}>
              Vous avez annulé le paiement. Aucun montant n'a été débité.
            </p>
            <button className="btn" type="button"
              onClick={() => { window.history.replaceState({}, '', '/donate'); setStep(1); }}>
              Réessayer
            </button>
          </div>
        </div>
      </section>
    );
  }

  // ── Step indicator ────────────────────────────────────────────────────────
  const StepBar = () => (
    <div className="donation-stepbar">
      <button
        type="button"
        className={`donation-step-btn ${step === 1 ? 'active' : 'done'}`}
        onClick={() => { setStep(1); setError(''); }}
        title="Revenir à l'étape 1"
      >
        <b>1</b> Vos informations
      </button>
      <span className="donation-stepbar-sep">→</span>
      <button
        type="button"
        className={`donation-step-btn ${step === 2 ? 'active' : ''}`}
        disabled={step < 2}
      >
        <b>2</b> Récapitulatif
      </button>
    </div>
  );

  return (
    <section className="section donate-page">
      <div className="container donation-ui">
        <SectionTitle
          eyebrow="SOUTENIR L'ŒUVRE"
          title="Faire un don"
          text="Soutenez l'œuvre de Dieu et contribuez à impacter davantage de vies."
        />

        <div className="donation-card" style={{ maxWidth: 540, margin: '0 auto' }}>
          <StepBar />

          {error && (
            <p className="form-error" role="alert" style={{ marginBottom: 16 }}>{error}</p>
          )}

          {/* ── STEP 1 ── */}
          {step === 1 && (
            <form onSubmit={handleStep1Submit}>
              <label className="donation-label">
                Nom complet <span style={{ fontWeight: 400, color: '#94a3b8', fontSize: 11 }}>(optionnel)</span>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Votre nom"
                  className="donation-input"
                />
              </label>

              <label className="donation-label">
                Montant <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div className="donation-amounts">
                {PRESET_AMOUNTS.map((v) => (
                  <button
                    key={v}
                    type="button"
                    className={`donation-chip${form.amount === String(v) ? ' selected' : ''}`}
                    onClick={() => handleAmountSelect(v)}
                  >
                    {v.toLocaleString('fr-FR')} FCFA
                  </button>
                ))}
              </div>
              <input
                type="number"
                min="100"
                value={form.amount}
                onChange={(e) => { setForm((f) => ({ ...f, amount: e.target.value })); setError(''); }}
                placeholder="Ou saisissez un montant personnalisé"
                className="donation-input"
                style={{ marginTop: 10 }}
              />

              <label className="donation-label" style={{ marginTop: 18 }}>
                Numéro de téléphone <span style={{ color: '#ef4444' }}>*</span>
                <input
                  type="tel"
                  required
                  value={form.phone}
                  onChange={(e) => { setForm((f) => ({ ...f, phone: e.target.value })); setError(''); }}
                  placeholder="Ex : 6XXXXXXXX"
                  className="donation-input"
                />
              </label>

              <button className="btn" type="submit" style={{ width: '100%', marginTop: 24 }}>
                Continuer <span>→</span>
              </button>
            </form>
          )}

          {/* ── STEP 2 – Review ── */}
          {step === 2 && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
                <span style={{ fontSize: 12, color: 'var(--muted)' }}>Étape 2 sur 2</span>
              </div>

              <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 20, lineHeight: 1.6 }}>
                Veuillez vérifier vos informations avant de poursuivre vers le paiement sécurisé.
              </p>

              <div className="donation-summary">
                <div className="donation-summary-row">
                  <span>Nom</span>
                  <strong>{form.name.trim() || '—'}</strong>
                </div>
                <div className="donation-summary-row">
                  <span>Montant</span>
                  <strong style={{ color: 'var(--gold)', fontSize: 16 }}>{fmt(form.amount)}</strong>
                </div>
                <div className="donation-summary-row">
                  <span>Téléphone</span>
                  <strong>{form.phone}</strong>
                </div>
                
              </div>

              <div className="donation-notice">
                Après confirmation, vous serez redirigé vers la page de paiement sécurisée pour finaliser la transaction.
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                <button
                  className="btn outline"
                  type="button"
                  onClick={() => { setStep(1); setError(''); }}
                  style={{ flex: 1, justifyContent: 'center', textAlign: 'center' }}
                  disabled={loading}
                >
                  ← Revenir en arrière
                </button>
                <button
                  className="btn"
                  type="button"
                  onClick={handlePay}
                  disabled={loading}
                  style={{ flex: 1, justifyContent: 'center', textAlign: 'center' }}
                >
                  {loading ? 'Redirection...' : 'Payer →'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}


