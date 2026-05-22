import Link from 'next/link';
import { notFound } from 'next/navigation';
import PlayerShell from '@/components/PlayerShell';
import { resolveTitle } from '@/lib/sources';
import { findSubtitles } from '@/lib/sources/opensubtitles';

export const revalidate = 600;

export default async function WatchPage({
  params,
  searchParams,
}: {
  params: Promise<{ source: string; id: string }>;
  searchParams: Promise<{ media?: string }>;
}) {
  const [{ source, id }, sp] = await Promise.all([params, searchParams]);
  const mediaType: 'movie' | 'tv' = sp.media === 'tv' ? 'tv' : 'movie';
  const title = await resolveTitle(source, id, { mediaType });
  if (!title) notFound();

  const subtitles = await findSubtitles({
    imdbId: title.imdbId,
    tmdbId: title.tmdbId,
    query: title.title,
    year: title.year,
    languages: 'en',
  }).catch(() => []);

  const titleWithSubs = { ...title, subtitles };

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="flex items-center justify-between px-6 py-4">
        <Link href="/" className="text-brand-red font-bold tracking-widest">
          ← NETFLIX NI YUL
        </Link>
        <span className="text-xs text-zinc-500">
          Source: {title.source.toUpperCase()}
        </span>
      </header>

      <main className="max-w-6xl mx-auto px-4">
        <PlayerShell title={titleWithSubs} />
        <div className="mt-6">
          <h1 className="text-2xl font-bold">
            {title.title}
            {title.year && <span className="text-zinc-400 font-normal"> ({title.year})</span>}
          </h1>
          <p className="mt-3 text-zinc-300 max-w-3xl">{title.overview}</p>
        </div>
      </main>
    </div>
  );
}
