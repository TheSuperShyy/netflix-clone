import type { Title } from '@/lib/types';
import { cached } from '@/lib/cache';
import { justWatchUrlFor } from './justwatch';

const BASE = 'https://api.themoviedb.org/3';
const IMG = 'https://image.tmdb.org/t/p';

function isV4Token(key: string): boolean {
  return key.startsWith('eyJ') && key.includes('.');
}

async function tmdb<T>(path: string, params: Record<string, string | number> = {}): Promise<T> {
  const key = process.env.TMDB_API_KEY;
  if (!key) {
    throw new Error('TMDB_API_KEY is not set. Add it to .env.local.');
  }
  const url = new URL(`${BASE}${path}`);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, String(v));
  }
  const headers: HeadersInit = { accept: 'application/json' };
  if (isV4Token(key)) {
    (headers as Record<string, string>).Authorization = `Bearer ${key}`;
  } else {
    url.searchParams.set('api_key', key);
  }
  const res = await fetch(url, { headers, next: { revalidate: 3600 } });
  if (!res.ok) {
    throw new Error(`TMDB ${res.status} on ${path}: ${await res.text()}`);
  }
  return res.json() as Promise<T>;
}

type TmdbMovie = {
  id: number;
  title?: string;
  name?: string;
  original_title?: string;
  original_name?: string;
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;
  overview?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  media_type?: 'movie' | 'tv';
};

type TmdbList<T> = { results: T[] };

type TmdbVideos = {
  results: Array<{
    key: string;
    site: string;
    type: string;
    official?: boolean;
  }>;
};

function toTitle(m: TmdbMovie, fallbackMedia: 'movie' | 'tv'): Title {
  const title = m.title ?? m.name ?? m.original_title ?? m.original_name ?? 'Untitled';
  const date = m.release_date ?? m.first_air_date;
  const year = date ? Number(date.slice(0, 4)) : undefined;
  return {
    id: `${m.id}`,
    source: 'tmdb',
    tmdbId: m.id,
    mediaType: m.media_type ?? fallbackMedia,
    title,
    year,
    rating: m.vote_average,
    poster: m.poster_path ? `${IMG}/w500${m.poster_path}` : '',
    backdrop: m.backdrop_path ? `${IMG}/original${m.backdrop_path}` : undefined,
    overview: m.overview ?? '',
    justWatchUrl: justWatchUrlFor(title, year),
  };
}

export async function getTopOnNetflix(region = 'PH'): Promise<Title[]> {
  if (!process.env.TMDB_API_KEY) return [];
  return cached(`tmdb:netflix:${region}`, 60 * 60 * 1000, async () => {
    try {
      const data = await tmdb<TmdbList<TmdbMovie>>('/discover/movie', {
        with_watch_providers: 8,
        watch_region: region,
        sort_by: 'popularity.desc',
        'vote_count.gte': 50,
      });
      return data.results
        .filter((m) => m.backdrop_path && m.poster_path)
        .slice(0, 8)
        .map((m) => toTitle(m, 'movie'));
    } catch {
      return [];
    }
  });
}

export async function searchTmdb(query: string): Promise<Title[]> {
  const q = query.trim();
  if (!q) return [];
  if (!process.env.TMDB_API_KEY) return [];
  return cached(`tmdb:search:${q.toLowerCase()}`, 10 * 60 * 1000, async () => {
    try {
      const data = await tmdb<TmdbList<TmdbMovie>>('/search/multi', { query: q });
      return data.results
        .filter((m) => m.poster_path && (m.media_type === 'movie' || m.media_type === 'tv'))
        .map((m) => toTitle(m, m.media_type ?? 'movie'));
    } catch {
      return [];
    }
  });
}

export async function getTrendingThisWeek(): Promise<Title[]> {
  return cached('tmdb:trending-week', 60 * 60 * 1000, async () => {
    const data = await tmdb<TmdbList<TmdbMovie>>('/trending/all/week');
    return data.results
      .filter((m) => m.poster_path)
      .map((m) => toTitle(m, m.media_type ?? 'movie'));
  });
}

export async function getPopularMovies(): Promise<Title[]> {
  return cached('tmdb:popular-movies', 60 * 60 * 1000, async () => {
    const data = await tmdb<TmdbList<TmdbMovie>>('/movie/popular');
    return data.results.filter((m) => m.poster_path).map((m) => toTitle(m, 'movie'));
  });
}

export async function getTrailerYoutubeId(tmdbId: number, media: 'movie' | 'tv' = 'movie'): Promise<string | undefined> {
  return cached(`tmdb:trailer:${media}:${tmdbId}`, 24 * 60 * 60 * 1000, async () => {
    try {
      const data = await tmdb<TmdbVideos>(`/${media}/${tmdbId}/videos`);
      const youtube = data.results.find(
        (v) => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser'),
      );
      return youtube?.key;
    } catch {
      return undefined;
    }
  });
}

type TmdbDetails = TmdbMovie & {
  imdb_id?: string;
  genres?: Array<{ id: number; name: string }>;
  runtime?: number;
  episode_run_time?: number[];
  number_of_seasons?: number;
  tagline?: string;
  external_ids?: { imdb_id?: string };
  release_dates?: {
    results: Array<{
      iso_3166_1: string;
      release_dates: Array<{ certification?: string }>;
    }>;
  };
  content_ratings?: {
    results: Array<{ iso_3166_1: string; rating?: string }>;
  };
};

function pickCertification(d: TmdbDetails): string | undefined {
  if (d.release_dates?.results) {
    const us = d.release_dates.results.find((r) => r.iso_3166_1 === 'US');
    const cert = us?.release_dates.find((x) => x.certification)?.certification;
    if (cert) return cert;
    for (const region of d.release_dates.results) {
      const c = region.release_dates.find((x) => x.certification)?.certification;
      if (c) return c;
    }
  }
  if (d.content_ratings?.results) {
    const us = d.content_ratings.results.find((r) => r.iso_3166_1 === 'US');
    if (us?.rating) return us.rating;
    return d.content_ratings.results.find((r) => r.rating)?.rating;
  }
  return undefined;
}

export async function resolveTmdb(id: string, media: 'movie' | 'tv' = 'movie'): Promise<Title | null> {
  return cached(`tmdb:details:${media}:${id}`, 24 * 60 * 60 * 1000, async () => {
    try {
      const appendList = media === 'movie' ? 'external_ids,release_dates' : 'external_ids,content_ratings';
      const d = await tmdb<TmdbDetails>(`/${media}/${id}`, { append_to_response: appendList });
      const t = toTitle(d, media);
      const imdbId = d.imdb_id ?? d.external_ids?.imdb_id;
      const trailerYoutubeId = await getTrailerYoutubeId(d.id, media).catch(() => undefined);
      const runtimeMinutes = d.runtime ?? (d.episode_run_time && d.episode_run_time[0]);
      return {
        ...t,
        imdbId,
        trailerYoutubeId,
        genres: d.genres?.map((g) => g.name),
        runtimeMinutes,
        releaseDate: d.release_date ?? d.first_air_date,
        certification: pickCertification(d),
        tagline: d.tagline,
      };
    } catch {
      if (media === 'movie') return resolveTmdb(id, 'tv');
      return null;
    }
  });
}

export async function getHeroBackdrop(tmdbId: number, media: 'movie' | 'tv' = 'movie'): Promise<string | undefined> {
  return cached(`tmdb:backdrop:${media}:${tmdbId}`, 24 * 60 * 60 * 1000, async () => {
    try {
      const m = await tmdb<TmdbMovie>(`/${media}/${tmdbId}`);
      return m.backdrop_path ? `${IMG}/original${m.backdrop_path}` : undefined;
    } catch {
      return undefined;
    }
  });
}
