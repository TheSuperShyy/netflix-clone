import type { CatalogRow, Title } from '@/lib/types';
import { getTrendingThisWeek, getPopularMovies, getHeroBackdrop, getTopOnNetflix, resolveTmdb } from './tmdb';
import { getClassicFilms, resolveArchive } from './archive';
import { getBlenderCatalog, resolveBlender } from './blender';
import { getPlutoChannels, resolvePluto } from './pluto';

async function safe<T>(label: string, fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    console.error(`[sources] ${label} failed:`, err);
    return fallback;
  }
}

export async function getLandingRows(): Promise<CatalogRow[]> {
  const [trending, popular, classics, blender, pluto] = await Promise.all([
    safe('tmdb-trending', () => getTrendingThisWeek(), [] as Title[]),
    safe('tmdb-popular', () => getPopularMovies(), [] as Title[]),
    safe('archive-classics', () => getClassicFilms(20), [] as Title[]),
    Promise.resolve(getBlenderCatalog()),
    safe('pluto', () => getPlutoChannels(12), [] as Title[]),
  ]);

  const rows: CatalogRow[] = [];
  if (trending.length) rows.push({ key: 'new-this-week', label: 'New this week', titles: trending });
  if (popular.length) rows.push({ key: 'trending', label: 'Trending Now', titles: popular });
  if (classics.length) rows.push({ key: 'classics', label: 'Free to Watch — Classics', titles: classics });
  if (blender.length) rows.push({ key: 'open-movies', label: 'Open Movies (CC)', titles: blender });
  if (pluto.length) rows.push({ key: 'pluto-live', label: 'Live TV (Pluto)', titles: pluto });
  return rows;
}

export async function getHeroTitles(region = 'PH'): Promise<Title[]> {
  const top = await safe('tmdb-netflix-ph', () => getTopOnNetflix(region), [] as Title[]);
  if (top.length >= 2) return top;

  const fallback: Title[] = [];
  const classics = await safe('archive-classics-hero', () => getClassicFilms(3), [] as Title[]);
  for (const c of classics.slice(0, 2)) {
    const full = await resolveArchive(c.id);
    if (full?.streams?.length) {
      fallback.push({ ...full, backdrop: full.backdrop ?? c.poster });
    }
  }
  const blender = getBlenderCatalog();
  if (blender[0]) fallback.push(blender[0]);
  if (fallback.length >= 1) return fallback;

  const trending = await safe('tmdb-trending-hero', () => getTrendingThisWeek(), [] as Title[]);
  return trending.slice(0, 6);
}

export async function getHeroTitle(): Promise<Title | null> {
  const arr = await getHeroTitles();
  return arr[0] ?? null;
}

export async function resolveTitle(
  source: string,
  id: string,
  opts: { mediaType?: 'movie' | 'tv' } = {},
): Promise<Title | null> {
  switch (source) {
    case 'archive':
      return resolveArchive(id);
    case 'blender':
      return resolveBlender(id);
    case 'pluto':
      return resolvePluto(id);
    case 'tmdb':
      return resolveTmdb(id, opts.mediaType ?? 'movie');
    default:
      return null;
  }
}
