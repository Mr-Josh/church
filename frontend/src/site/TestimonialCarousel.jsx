import { useEffect, useMemo, useState } from 'react';
import './testimonials.css';

const FALLBACK = [
  'Ma vie a été transformée depuis que j’ai rencontré Jésus dans cette église. Gloire à Dieu !',
  'J’ai retrouvé la paix grâce à la prière et à l’accompagnement reçu.',
  'Ma guérison semblait impossible, mais Jésus a fait ce que les médecins n’ont pas pu faire.',
];

function normalize(items) {
  const source = Array.isArray(items) && items.length ? items : FALLBACK;
  return source.map((item, index) => ({
    id: item?.id ?? `fallback-${index}`,
    text: item?.content || item,
    author: item?.name || `Témoignage ${index + 1}`,
  }));
}

export function TestimonialCarousel({ items = [], autoPlay = true }) {
  const testimonials = useMemo(() => normalize(items), [items]);
  const pairCount = Math.ceil(testimonials.length / 2);
  const [page, setPage] = useState(0);

  useEffect(() => {
    setPage((current) => Math.min(current, Math.max(0, pairCount - 1)));
  }, [pairCount]);

  useEffect(() => {
    if (!autoPlay || pairCount <= 1) return undefined;
    const timer = window.setInterval(() => {
      setPage((current) => (current + 1) % pairCount);
    }, 6000);
    return () => window.clearInterval(timer);
  }, [autoPlay, pairCount]);

  const visible = testimonials.slice(page * 2, page * 2 + 2);

  return (
    <div className="testimonial-carousel">
      <div className="testimonial-carousel__viewport" aria-live="polite">
        <div className="testimonial-carousel__pair">
          {visible.map((item) => (
            <blockquote className="testimonial-slide" key={item.id}>
              <span>“</span>
              <p>{item.text}</p>
              <b>— {item.author}</b>
            </blockquote>
          ))}
        </div>
      </div>
      {pairCount > 1 && (
        <div className="testimonial-carousel__controls">
          <button type="button" aria-label="Témoignages précédents" onClick={() => setPage((current) => (current - 1 + pairCount) % pairCount)}>←</button>
          <div className="testimonial-carousel__dots" aria-label="Pages de témoignages">
            {Array.from({ length: pairCount }, (_, index) => (
              <button key={index} type="button" className={index === page ? 'active' : ''} aria-label={`Afficher les témoignages ${index * 2 + 1} à ${Math.min(index * 2 + 2, testimonials.length)}`} onClick={() => setPage(index)} />
            ))}
          </div>
          <button type="button" aria-label="Témoignages suivants" onClick={() => setPage((current) => (current + 1) % pairCount)}>→</button>
        </div>
      )}
    </div>
  );
}
