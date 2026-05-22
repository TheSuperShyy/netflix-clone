'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { Title } from '@/lib/types';
import TrailerModal from './TrailerModal';

export default function Card({ title }: { title: Title }) {
  const router = useRouter();
  const [trailerOpen, setTrailerOpen] = useState(false);

  const hasStreams =
    (title.streams?.length ?? 0) > 0 ||
    title.source === 'archive' ||
    title.source === 'blender' ||
    title.source === 'pluto';
  const playHref = hasStreams ? `/watch/${title.source}/${title.id}` : title.justWatchUrl ?? '#';
  const trailerHref =
    title.source === 'tmdb' && title.mediaType === 'tv'
      ? `/trailer/${title.source}/${title.id}?media=tv`
      : `/trailer/${title.source}/${title.id}`;
  const isExternal = !hasStreams;
  const subtitle = title.year ?? title.source.toUpperCase();

  const goToTrailerPage = () => router.push(trailerHref);

  const stop = (e: React.MouseEvent | React.SyntheticEvent) => e.stopPropagation();

  return (
    <>
      <div className="group relative w-[160px] md:w-[180px] shrink-0">
        <div
          role="link"
          tabIndex={0}
          onClick={goToTrailerPage}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && goToTrailerPage()}
          className="relative aspect-[2/3] rounded-md overflow-hidden bg-zinc-900 ring-1 ring-white/5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-red"
        >
          {title.poster ? (
            <Image
              src={title.poster}
              alt={title.title}
              fill
              sizes="180px"
              className="object-cover transition-transform duration-200 group-hover:scale-[1.04]"
              unoptimized={title.source !== 'tmdb'}
            />
          ) : (
            <div className="absolute inset-0 grid place-items-center text-zinc-500 text-xs p-3 text-center">
              {title.title}
            </div>
          )}

          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-t from-black via-black/60 to-transparent">
            <div className="absolute inset-x-0 bottom-0 p-3 flex flex-col gap-2">
              <div className="text-xs text-zinc-300 line-clamp-3">{title.overview}</div>
              <div className="flex items-center gap-2">
                <Link
                  href={playHref}
                  target={isExternal ? '_blank' : undefined}
                  rel={isExternal ? 'noopener noreferrer' : undefined}
                  onClick={stop}
                  className="flex items-center justify-center w-8 h-8 rounded-full bg-white text-black hover:bg-zinc-200"
                  aria-label="Play"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                    <path d="M5 3l16 9-16 9V3z" />
                  </svg>
                </Link>
                {(title.trailerYoutubeId || title.tmdbId) && (
                  <button
                    onClick={(e) => {
                      stop(e);
                      setTrailerOpen(true);
                    }}
                    className="flex items-center justify-center w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white border border-white/40"
                    aria-label="Watch trailer (quick preview)"
                    title="Quick trailer preview"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                      <path d="M7 4v16M17 4v16M3 8h4M3 16h4M17 8h4M17 16h4M9 12h6" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="mt-2 px-0.5">
          <div className="text-sm font-medium truncate">{title.title}</div>
          <div className="text-xs text-zinc-500">{subtitle}</div>
        </div>
      </div>

      {trailerOpen && <TrailerModal title={title} onClose={() => setTrailerOpen(false)} />}
    </>
  );
}
