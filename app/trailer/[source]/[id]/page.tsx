import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { resolveTitle } from '@/lib/sources';
import { getTrailerYoutubeId } from '@/lib/sources/tmdb';

export const revalidate = 3600;

function formatRuntime(mins?: number): string | undefined {
  if (!mins || mins <= 0) return undefined;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

function formatReleaseDate(iso?: string): string | undefined {
  if (!iso) return undefined;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default async function TrailerPage({
  params,
  searchParams,
}: {
  params: Promise<{ source: string; id: string }>;
  searchParams: Promise<{ media?: string }>;
}) {
  const { source, id } = await params;
  const sp = await searchParams;
  const mediaType: 'movie' | 'tv' = sp.media === 'tv' ? 'tv' : 'movie';
  const title = await resolveTitle(source, id, { mediaType });
  if (!title) notFound();

  let trailerYoutubeId = title.trailerYoutubeId;
  if (!trailerYoutubeId && title.tmdbId) {
    trailerYoutubeId = await getTrailerYoutubeId(title.tmdbId, title.mediaType ?? mediaType).catch(() => undefined);
  }

  const imdbHref = title.imdbId
    ? `https://www.playimdb.com/title/${title.imdbId}/`
    : `https://www.playimdb.com/find/?q=${encodeURIComponent(title.title)}`;

  const ratingDisplay = title.rating?.toFixed(1);
  const hasOurStream = (title.streams?.length ?? 0) > 0;
  const runtime = formatRuntime(title.runtimeMinutes);
  const releaseDate = formatReleaseDate(title.releaseDate);
  const genreLine = title.genres?.slice(0, 4).join(' • ');
  const metaLine = [
    title.year ? String(title.year) : undefined,
    runtime,
    title.certification,
    title.mediaType === 'tv' ? 'Series' : 'Movie',
  ]
    .filter(Boolean)
    .join('   •   ');

  return (
    <div className="relative min-h-screen bg-black text-white">
      {title.backdrop && (
        <div aria-hidden className="fixed inset-0 z-0 pointer-events-none">
          <Image
            src={title.backdrop}
            alt=""
            fill
            sizes="100vw"
            className="object-cover opacity-30 blur-2xl scale-110"
            unoptimized={title.source !== 'tmdb'}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/85 to-black" />
        </div>
      )}

      <div className="relative z-10">
        <header className="flex items-center justify-between px-6 py-4 border-b border-white/5 backdrop-blur-sm bg-black/30">
          <Link href="/" className="flex items-center gap-2 text-zinc-300 hover:text-white">
            <span className="text-lg">←</span>
            <span className="text-brand-red font-bold tracking-widest">NETFLIX NI YUL</span>
          </Link>
          <Link
            href={imdbHref}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-zinc-400 hover:text-white"
          >
            View on IMDb ↗
          </Link>
        </header>

        <main className="max-w-7xl mx-auto px-4 md:px-8 py-6 lg:py-10 animate-fade-in-up">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 lg:gap-10">
            <section>
              <div className="aspect-video w-full bg-zinc-950 rounded-xl overflow-hidden ring-1 ring-white/10 relative shadow-2xl shadow-black/60">
                {trailerYoutubeId ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${trailerYoutubeId}?autoplay=1&rel=0&modestbranding=1`}
                    title={`${title.title} trailer`}
                    allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full"
                  />
                ) : title.backdrop ? (
                  <>
                    <Image
                      src={title.backdrop}
                      alt={title.title}
                      fill
                      sizes="(min-width: 1024px) 70vw, 100vw"
                      className="object-cover"
                      unoptimized={title.source !== 'tmdb'}
                    />
                    <div className="absolute inset-0 grid place-items-center bg-black/60 text-zinc-300 text-sm">
                      No trailer available
                    </div>
                  </>
                ) : (
                  <div className="absolute inset-0 grid place-items-center text-zinc-500">
                    No trailer available
                  </div>
                )}
              </div>

              <div className="mt-8">
                <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.4em] text-zinc-500 mb-3">
                  <span className="h-px w-8 bg-brand-red" />
                  Official Trailer
                </div>
                <h2 className="text-3xl md:text-4xl font-black tracking-tight">
                  {title.title}
                  {title.year && (
                    <span className="text-zinc-500 font-normal"> ({title.year})</span>
                  )}
                </h2>
                {title.tagline && (
                  <p className="mt-2 text-zinc-400 italic text-base">"{title.tagline}"</p>
                )}
                <p className="mt-5 text-zinc-300 max-w-3xl leading-relaxed text-base">
                  {title.overview}
                </p>
              </div>
            </section>

            <aside className="lg:sticky lg:top-6 self-start">
              <div className="rounded-xl bg-zinc-900/80 backdrop-blur-sm ring-1 ring-white/10 p-5 flex flex-col gap-5 shadow-xl shadow-black/40">
                <div className="flex items-start gap-4">
                  {title.poster && (
                    <div className="relative w-24 h-36 rounded-md overflow-hidden bg-zinc-800 shrink-0 ring-1 ring-white/10">
                      <Image
                        src={title.poster}
                        alt={title.title}
                        fill
                        sizes="96px"
                        className="object-cover"
                        unoptimized={title.source !== 'tmdb'}
                      />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <h1 className="text-lg font-bold leading-tight">
                      {title.title}
                      {title.year && (
                        <span className="text-zinc-400 font-normal"> ({title.year})</span>
                      )}
                    </h1>
                    {ratingDisplay && (
                      <div className="mt-2 flex items-center gap-2 text-xs">
                        <span className="bg-yellow-400 text-black font-bold px-1.5 py-0.5 rounded text-[10px]">
                          IMDb
                        </span>
                        <span className="text-zinc-200 font-medium">{ratingDisplay}</span>
                      </div>
                    )}
                    {title.certification && (
                      <div className="mt-2">
                        <span className="inline-block border border-zinc-500 text-zinc-300 px-1.5 py-0.5 rounded text-[10px] font-semibold">
                          {title.certification}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {(metaLine || genreLine) && (
                  <div className="text-xs text-zinc-400 space-y-2 border-t border-white/5 pt-4">
                    {metaLine && <div>{metaLine}</div>}
                    {genreLine && <div className="text-zinc-300">{genreLine}</div>}
                    {releaseDate && (
                      <div className="text-zinc-500">Released {releaseDate}</div>
                    )}
                  </div>
                )}

                <div className="flex flex-col gap-2">
                  {hasOurStream && (
                    <Link
                      href={`/watch/${title.source}/${title.id}`}
                      className="inline-flex items-center justify-center gap-2 bg-brand-red hover:bg-red-700 transition-colors text-white font-semibold rounded-md px-4 py-3"
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                        <path d="M5 3l16 9-16 9V3z" />
                      </svg>
                      Play
                    </Link>
                  )}
                  <Link
                    href={imdbHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 transition-colors text-white font-medium rounded-md px-4 py-3 ring-1 ring-white/10"
                  >
                    Watch options
                    <span className="text-zinc-400 text-xs">↗</span>
                  </Link>
                </div>

                <div className="text-[11px] text-zinc-500 leading-relaxed border-t border-white/5 pt-4">
                  "Watch options" opens this title on IMDb where you can see every legal
                  streaming, rental, and purchase option.
                </div>
              </div>
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
}
