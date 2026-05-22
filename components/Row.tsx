'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { CatalogRow } from '@/lib/types';
import Card from './Card';

export default function Row({ row, index = 0 }: { row: CatalogRow; index?: number }) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);

  const updateEdges = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    updateEdges();
    const el = scrollerRef.current;
    if (!el) return;
    el.addEventListener('scroll', updateEdges, { passive: true });
    window.addEventListener('resize', updateEdges);
    return () => {
      el.removeEventListener('scroll', updateEdges);
      window.removeEventListener('resize', updateEdges);
    };
  }, [updateEdges, row.titles.length]);

  const scrollBy = (dir: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * (el.clientWidth * 0.85), behavior: 'smooth' });
  };

  return (
    <section
      className="mt-8 animate-fade-in-up"
      style={{ animationDelay: `${Math.min(index * 80, 400)}ms` }}
    >
      <h2 className="text-lg md:text-xl font-bold mb-3 px-6 md:px-10 lg:px-14">
        {row.label}
      </h2>
      <div className="relative group">
        {canLeft && (
          <button
            aria-label="Scroll left"
            onClick={() => scrollBy(-1)}
            className="hidden md:flex absolute left-0 top-0 bottom-12 z-20 w-14 items-center justify-center bg-gradient-to-r from-black via-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          >
            <span className="text-3xl text-white drop-shadow">‹</span>
          </button>
        )}

        <div
          ref={scrollerRef}
          className="row-scroll flex gap-3 md:gap-4 overflow-x-auto scroll-smooth pb-2 px-6 md:px-10 lg:px-14 snap-x snap-proximity"
          style={{ scrollPaddingLeft: '1.5rem', scrollPaddingRight: '1.5rem' }}
        >
          {row.titles.map((title) => (
            <div key={`${title.source}:${title.id}`} className="snap-start">
              <Card title={title} />
            </div>
          ))}
        </div>

        {canRight && (
          <button
            aria-label="Scroll right"
            onClick={() => scrollBy(1)}
            className="hidden md:flex absolute right-0 top-0 bottom-12 z-20 w-14 items-center justify-center bg-gradient-to-l from-black via-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          >
            <span className="text-3xl text-white drop-shadow">›</span>
          </button>
        )}
      </div>
    </section>
  );
}
