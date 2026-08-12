import { useEffect, useState } from 'react';
import { bibleVerses } from './bibleVerses';

const TEN_SECONDS = 10000;

function randomIndex(exclude = -1) {
  if (bibleVerses.length <= 1) return 0;
  let index = Math.floor(Math.random() * bibleVerses.length);
  while (index === exclude) index = Math.floor(Math.random() * bibleVerses.length);
  return index;
}

export function useBibleVerse(interval = TEN_SECONDS) {
  const [index, setIndex] = useState(() => randomIndex());

  useEffect(() => {
    const timer = window.setInterval(() => {
      setIndex((current) => randomIndex(current));
    }, interval);

    return () => window.clearInterval(timer);
  }, [interval]);

  return bibleVerses[index];
}
