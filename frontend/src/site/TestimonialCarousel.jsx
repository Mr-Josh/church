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
  const [itemsPerPage, setItemsPerPage] = useState(2);

  // Update items per page based on viewport width
  useEffect(() => {
    const updateItemsPerPage = () => {
      const width = window.innerWidth;
      setItemsPerPage(width < 600 ? 1 : 2);
    };
    updateItemsPerPage();
    window.addEventListener('resize', updateItemsPerPage);
    return () => window.removeEventListener('resize', updateItemsPerPage);
  }, []);

  const pages = useMemo(() => {
    const result = [];
    for (let index = 0; index < testimonials.length; index += itemsPerPage) {
      result.push(testimonials.slice(index, index + itemsPerPage));
    }
    return result;
  }, [testimonials, itemsPerPage]);

  const pageCount = pages.length;
  const [page, setPage] = useState(0);
  const [direction, setDirection] = useState('next');

  useEffect(() => {
    setPage((current) => Math.min(current, Math.max(0, pageCount - 1)));
  }, [pageCount]);

  const goTo = (nextPage, nextDirection) => {
    if (pageCount <= 1) return;
    setDirection(nextDirection);
    setPage((nextPage + pageCount) % pageCount);
  };

  useEffect(() => {
    if (!autoPlay || pageCount <= 1) return undefined;
    const timer = window.setInterval(() => {
      setDirection('next');
      setPage((current) => (current + 1) % pageCount);
    }, 6000);
    return () => window.clearInterval(timer);
  }, [autoPlay, pageCount]);

  return (
    <div className="testimonial-carousel">
      <div className={`testimonial-carousel__viewport testimonial-carousel__viewport--${direction}`} aria-live="polite">
        <div
          className="testimonial-carousel__track"
          style={{ transform: `translate3d(-${page * 100}%, 0, 0)` }}
        >
          {pages.map((pair, pageIndex) => (
            <div className="testimonial-carousel__page" key={`page-${pageIndex}`}>
              {pair.map((item, index) => (
                <blockquote
                  className={`testimonial-slide${index === 0 ? ' testimonial-slide--featured' : ''}`}
                  key={item.id}
                >
                  <span>“</span>
                  <p>{item.text}</p>
                  <b>— {item.author}</b>
                </blockquote>
              ))}
            </div>
          ))}
        </div>
      </div>

      {pageCount > 1 && (
        <div className="testimonial-carousel__controls">
          <button
            type="button"
            aria-label="Témoignages précédents"
            onClick={() => goTo(page - 1, 'previous')}
          >
            ←
          </button>
          <div className="testimonial-carousel__dots" aria-label="Pages de témoignages">
            {pages.map((_, index) => (
              <button
                key={index}
                type="button"
                className={index === page ? 'active' : ''}
                aria-label={`Afficher les témoignages ${index * 2 + 1} à ${Math.min(index * 2 + 2, testimonials.length)}`}
                onClick={() => goTo(index, index > page ? 'next' : 'previous')}
              />
            ))}
          </div>
          <button
            type="button"
            aria-label="Témoignages suivants"
            onClick={() => goTo(page + 1, 'next')}
          >
            →
          </button>
        </div>
      )}
    </div>
  );
}
