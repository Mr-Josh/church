import { useEffect } from 'react';

const SELECTOR = [
  'main section',
  '.section-title',
  '.about-editorial-grid article',
  '.action-card',
  '.project-card',
  '.impact-placeholder',
  '.ministry-card',
  '.event-card',
  '.testimonial-card',
  '.prayer-call-grid',
  '.donation-card',
  '.form-card',
  '.help-card',
  '.contact-card',
].join(',');

export function useScrollReveal() {
  useEffect(() => {
    const root = document.querySelector('.public-site');
    if (!root) return undefined;

    root.classList.add('motion-enabled');
    const elements = [...root.querySelectorAll(SELECTOR)];
    elements.forEach((element, index) => {
      element.classList.add('motion-reveal');
      element.style.setProperty('--motion-delay', `${Math.min(index % 5, 4) * 70}ms`);
    });

    if (!('IntersectionObserver' in window)) {
      elements.forEach((element) => element.classList.add('is-visible'));
      return undefined;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);
}
