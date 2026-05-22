'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import type { Title } from '@/lib/types';
import TrailerModal from './TrailerModal';

const ROTATE_MS = 8000;

export default function Hero({
  titles,
  eyebrowLabel = 'TOP ON NETFLIX • PH',
}: {
  titles: Title[];
  eyebrowLabel?: string;
}) {
  const [idx, setIdx] = useState(0);
  const [trailerOpen, setTrailerOpen] = useState(false);
  const [paused, setPaused] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (titles.length <= 1 || paused || trailerOpen) return;
    const t = window.setInterval(
      () => setIdx((i) => (i + 1) % titles.length),
      ROTATE_MS,
    );
    return () => window.clearInterval(t);
  }, [titles.length, paused, trailerOpen]);

  if (titles.length === 0) {
    return (
      <div className="h-[40vh] grid place-items-center text-zinc-500">
        No featured titles available.
      </div>
    );
  }

  const title = titles[idx];
  const hasStreams = (title.streams?.length ?? 0) > 0;
  const playHref = hasStreams
    ? `/watch/${title.source}/${title.id}`
    : title.justWatchUrl ?? '#';
  const ratingDisplay = title.rating?.toFixed(1);

  return (
    <section
      ref={rootRef}
      className="relative h-[62vh] min-h-[440px] w-full overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {titles.map((t, i) => (
        <div
          key={`${t.source}:${t.id}`}
          aria-hidden={i !== idx}
          className={
            'absolute inset-0 transition-opacity duration-1000 ease-out ' +
            (i === idx ? 'opacity-100' : 'opacity-0')
          }
        >
          {t.backdrop ? (
            <div className="absolute inset-0 animate-ken-burns">
              <Image
                src={t.backdrop}
                alt=""
                fill
                priority={i === 0}
                sizes="100vw"
                className="object-cover object-center"
                unoptimized={t.source !== 'tmdb'}
              />
            </div>
          ) : (
            <div className="absolute inset-0 bg-zinc-900" />
          )}
        </div>
      ))}

      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

      <div
        key={`copy-${idx}`}
        className="relative z-10 flex flex-col justify-end h-full px-6 md:px-10 lg:px-14 pb-12 max-w-2xl animate-fade-in-up"
      >
        <div className="flex items-center gap-2 mb-3 text-xs tracking-[0.4em] text-zinc-300">
          <span className="text-brand-red font-bold text-base tracking-normal">N</span>
          <span>{eyebrowLabel}</span>
          {title.mediaType === 'tv' && (
            <span className="text-zinc-500">• SERIES</span>
          )}
        </div>
        <h1 className="text-4xl md:text-6xl font-black uppercase leading-none tracking-tight">
          {title.title}
        </h1>
        <div className="mt-3 h-1 w-24 bg-brand-red rounded-full animate-red-bar" />
        {ratingDisplay && (
          <div className="mt-4 flex items-center gap-3 text-sm">
            <span className="bg-yellow-400 text-black font-bold px-2 py-0.5 rounded text-xs">
              IMDb {ratingDisplay}
            </span>
            <span className="text-brand-red font-semibold">
              {hasStreams ? 'Playable now' : 'Find legal stream'}
            </span>
          </div>
        )}
        <p className="mt-4 text-zinc-300 max-w-lg line-clamp-3 text-sm md:text-base">
          {title.overview}
        </p>

        <div className="mt-6 flex items-center gap-3">
          <Link
            href={playHref}
            target={hasStreams ? undefined : '_blank'}
            rel={hasStreams ? undefined : 'noopener noreferrer'}
            className="inline-flex items-center gap-2 bg-brand-red hover:bg-red-700 transition-colors text-white font-semibold rounded-full px-7 py-3"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M5 3l16 9-16 9V3z" />
            </svg>
            Play
          </Link>
          <button
            onClick={() => setTrailerOpen(true)}
            disabled={!title.trailerYoutubeId && !title.tmdbId}
            className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-white font-semibold rounded-full px-6 py-3 backdrop-blur"
          >
            Watch Trailer
          </button>
        </div>
      </div>

      {titles.length > 1 && (
        <div className="absolute bottom-5 right-6 md:right-14 z-10 flex items-center gap-1.5">
          {titles.map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              aria-label={`Show featured title ${i + 1}`}
              className={
                'h-1 rounded-full transition-all duration-300 ' +
                (i === idx
                  ? 'w-8 bg-white'
                  : 'w-4 bg-white/40 hover:bg-white/70')
              }
            />
          ))}
        </div>
      )}

      {trailerOpen && (
        <TrailerModal title={title} onClose={() => setTrailerOpen(false)} />
      )}
    </section>
  );
}
