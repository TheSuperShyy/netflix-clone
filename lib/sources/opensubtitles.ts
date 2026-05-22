import type { Subtitle } from '@/lib/types';
import { cached } from '@/lib/cache';

const BASE = 'https://api.opensubtitles.com/api/v1';

type OsSearchItem = {
  attributes?: {
    language?: string;
    files?: Array<{ file_id?: number; file_name?: string }>;
  };
};

type OsSearch = { data: OsSearchItem[] };

type OsDownloadResponse = { link: string };

function headers(): HeadersInit {
  const key = process.env.OPENSUBTITLES_API_KEY;
  return {
    'Api-Key': key ?? '',
    'User-Agent': process.env.OPENSUBTITLES_USER_AGENT ?? 'netflix-ni-yul v0.1',
    accept: 'application/json',
  };
}

export async function findSubtitles(opts: {
  imdbId?: string;
  tmdbId?: number;
  query?: string;
  year?: number;
  languages?: string;
}): Promise<Subtitle[]> {
  if (!process.env.OPENSUBTITLES_API_KEY) return [];

  const key = `os:search:${opts.imdbId ?? ''}:${opts.tmdbId ?? ''}:${opts.query ?? ''}:${opts.year ?? ''}:${opts.languages ?? 'en'}`;

  return cached(key, 24 * 60 * 60 * 1000, async () => {
    const url = new URL(`${BASE}/subtitles`);
    if (opts.imdbId) {
      const cleaned = opts.imdbId.replace(/^tt/, '');
      url.searchParams.set('imdb_id', cleaned);
    }
    if (opts.tmdbId) url.searchParams.set('tmdb_id', String(opts.tmdbId));
    if (opts.query) url.searchParams.set('query', opts.query);
    if (opts.year) url.searchParams.set('year', String(opts.year));
    url.searchParams.set('languages', opts.languages ?? 'en');

    try {
      const res = await fetch(url, { headers: headers(), next: { revalidate: 86400 } });
      if (!res.ok) return [];
      const data = (await res.json()) as OsSearch;
      return data.data
        .slice(0, 4)
        .map((it) => {
          const fileId = it.attributes?.files?.[0]?.file_id;
          const lang = it.attributes?.language ?? 'en';
          if (!fileId) return null;
          return {
            lang,
            label: lang.toUpperCase(),
            url: `/api/subtitles/file?file_id=${fileId}`,
          };
        })
        .filter((s): s is Subtitle => s !== null);
    } catch {
      return [];
    }
  });
}

export async function fetchSubtitleVtt(fileId: string): Promise<string | null> {
  if (!process.env.OPENSUBTITLES_API_KEY) return null;
  try {
    const dl = await fetch(`${BASE}/download`, {
      method: 'POST',
      headers: { ...headers(), 'content-type': 'application/json' },
      body: JSON.stringify({ file_id: Number(fileId) }),
    });
    if (!dl.ok) return null;
    const { link } = (await dl.json()) as OsDownloadResponse;
    if (!link) return null;
    const srtRes = await fetch(link);
    if (!srtRes.ok) return null;
    const srt = await srtRes.text();
    return srtToVtt(srt);
  } catch {
    return null;
  }
}

export function srtToVtt(srt: string): string {
  const body = srt
    .replace(/\r+/g, '')
    .replace(/^﻿/, '')
    .replace(/(\d{2}:\d{2}:\d{2}),(\d{3})/g, '$1.$2')
    .trim();
  return `WEBVTT\n\n${body}\n`;
}
