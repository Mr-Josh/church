import { useEffect, useState } from 'react';
import { CTA, SectionTitle } from './components';
import { churchApi } from '../services/churchApi';
import { eventGallery } from './eventGallery';
import './event-gallery.css';

// Helper to preload an array of image URLs
function preloadImages(urls) {
  urls.forEach((src) => {
    const img = new Image();
    img.src = src;
  });
}

function EventGalleryBlock({ event }) {
  return (
    <article className="event-gallery-block">
      <div className="event-gallery-copy">
        <span className="gold-label">ACTION DE TERRAIN</span>
        <h2>{event.eventTitle}</h2>
        <p>{event.description}</p>
      </div>
      <div className="event-gallery-scroll" aria-label={`Photos de ${event.eventTitle}`}>
        {event.photos.map((photo) => (
          <figure className="event-gallery-photo" key={`${event.eventTitle}-${photo.image}`}>
            <div
              className="event-gallery-photo-image"
              role="img"
              aria-label={photo.caption}
              style={{ backgroundImage: `url(${photo.image})`, backgroundPosition: photo.position || 'center' }}
            />
            <figcaption>{photo.caption}</figcaption>
          </figure>
        ))}
      </div>
    </article>
  );
}

export default function EventsPage() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    let active = true;
    churchApi.events().then((payload) => {
      const data = Array.isArray(payload) ? payload : payload?.data;
      if (active && Array.isArray(data)) setEvents(data);
    }).catch(() => {});
    return () => { active = false; };
  }, []);

  // Preload all images (both remote and fallback) after events are set
  useEffect(() => {
    const remoteImages = events.flatMap((e) => (Array.isArray(e.photos) ? e.photos.map((p) => p.image) : []));
    const fallbackImages = eventGallery.flatMap((e) => e.photos.map((p) => p.image));
    preloadImages([...remoteImages, ...fallbackImages]);
  }, [events]);

  const remoteEvents = events.filter((event) => Array.isArray(event.photos) && event.photos.length);

  return (
    <>
      <section className="section page-title-simple">
        <div className="container">
          <SectionTitle
            eyebrow="GOSPEL BREAK CHAIN MINISTRY"
            title="ÉVÉNEMENTS & ACTIONS DE TERRAIN"
            text="Retrouvez les temps forts du ministère, leurs descriptions et les images qui témoignent des actions réalisées sur le terrain."
          />
        </div>
      </section>

      <section className="section">
        <div className="container events-gallery-list">
          {remoteEvents.length > 0 ? (
            remoteEvents.map((event) => (
              <EventGalleryBlock
                key={event.id}
                event={{ eventTitle: event.title, description: event.description, photos: event.photos }}
              />
            ))
          ) : (
            eventGallery.map((event) => <EventGalleryBlock key={event.eventTitle} event={event} />)
          )}

          <div className="event-gallery-cta">
            <h2>Une action à soutenir</h2>
            <p>La mission continue. Vous pouvez porter ces actions dans la prière ou contribuer à leur réalisation.</p>
            <div>
              <CTA to="/prayer">Prier pour la mission</CTA>
              <CTA dark to="/donate">Soutenir la mission</CTA>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
