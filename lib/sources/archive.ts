import type { Title, StreamSource } from '@/lib/types';
import { cached } from '@/lib/cache';

const SEARCH = 'https://archive.org/advancedsearch.php';
const META = 'https://archive.org/metadata';
const DL = 'https://archive.org/download';

type ArchiveSearchDoc = {
  identifier: string;
  title?: string;
  description?: string | string[];
  year?: string;
  date?: string;
  avg_rating?: string;
  downloads?: number;
};

type ArchiveSearch = {
  response: { docs: ArchiveSearchDoc[] };
};

type ArchiveFile = {
  name: string;
  source?: string;
  format?: string;
  size?: string;
  width?: string;
  height?: string;
  length?: string;
};

type ArchiveMetadata = {
  metadata?: {
    identifier?: string;
    title?: string;
    description?: string | string[];
    year?: string;
    date?: string;
    runtime?: string;
    imdb?: string;
  };
  files?: ArchiveFile[];
  server?: string;
  dir?: string;
};

const VIDEO_FORMAT_RANK: Record<string, number> = {
  'h.264 IA': 10,
  'h.264': 9,
  'MPEG4': 8,
  'MPEG2': 7,
  '512Kb MPEG4': 6,
  'Ogg Video': 5,
  'WebM': 4,
};

function descToString(d: string | string[] | undefined): string {
  if (!d) return '';
  if (Array.isArray(d)) return d.join(' ');
  return d.replace(/<[^>]+>/g, '');
}

export async function searchArchive(query: string, limit = 12): Promise<Title[]> {
  const q = query.trim();
  if (!q) return [];
  return cached(`archive:search:${q.toLowerCase()}:${limit}`, 10 * 60 * 1000, async () => {
    const url = new URL(SEARCH);
    const escaped = q.replace(/"/g, '\\"');
    url.searchParams.set(
      'q',
      `title:("${escaped}") AND mediatype:(movies) AND format:(h.264)`,
    );
    const fields = ['identifier', 'title', 'description', 'year', 'date', 'avg_rating', 'downloads'];
    for (const f of fields) url.searchParams.append('fl[]', f);
    url.searchParams.set('sort[]', 'downloads desc');
    url.searchParams.set('rows', String(limit));
    url.searchParams.set('page', '1');
    url.searchParams.set('output', 'json');

    try {
      const res = await fetch(url, { next: { revalidate: 600 } });
      if (!res.ok) return [];
      const data = (await res.json()) as ArchiveSearch;
      return data.response.docs.map((d) => {
        const year = d.year ? Number(d.year) : d.date ? Number(d.date.slice(0, 4)) : undefined;
        return {
          id: d.identifier,
          source: 'archive' as const,
          title: d.title ?? d.identifier,
          year,
          rating: d.avg_rating ? Number(d.avg_rating) : undefined,
          poster: `https://archive.org/services/img/${d.identifier}`,
          overview: descToString(d.description).slice(0, 400),
        };
      });
    } catch {
      return [];
    }
  });
}

export async function getClassicFilms(limit = 20): Promise<Title[]> {
  return cached(`archive:classics:${limit}`, 60 * 60 * 1000, async () => {
    const url = new URL(SEARCH);
    url.searchParams.set(
      'q',
      'collection:(feature_films) AND mediatype:(movies) AND format:(h.264)',
    );
    const fields = ['identifier', 'title', 'description', 'year', 'date', 'avg_rating', 'downloads'];
    for (const f of fields) url.searchParams.append('fl[]', f);
    url.searchParams.set('sort[]', 'downloads desc');
    url.searchParams.set('rows', String(limit));
    url.searchParams.set('page', '1');
    url.searchParams.set('output', 'json');

    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error(`Archive search failed: ${res.status}`);
    const data = (await res.json()) as ArchiveSearch;

    return data.response.docs.map((d) => {
      const year = d.year ? Number(d.year) : d.date ? Number(d.date.slice(0, 4)) : undefined;
      return {
        id: d.identifier,
        source: 'archive' as const,
        title: d.title ?? d.identifier,
        year,
        rating: d.avg_rating ? Number(d.avg_rating) : undefined,
        poster: `https://archive.org/services/img/${d.identifier}`,
        overview: descToString(d.description).slice(0, 400),
      };
    });
  });
}

export async function resolveArchive(identifier: string): Promise<Title | null> {
  return cached(`archive:title:${identifier}`, 60 * 60 * 1000, async () => {
    const res = await fetch(`${META}/${identifier}`, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    const data = (await res.json()) as ArchiveMetadata;
    if (!data.metadata) return null;

    const videoFiles = (data.files ?? []).filter(
      (f) =>
        f.name &&
        (f.format?.toLowerCase().includes('mp4') ||
          f.format?.toLowerCase().includes('mpeg4') ||
          f.format?.toLowerCase().includes('h.264') ||
          f.format?.toLowerCase().includes('ogg video') ||
          f.format?.toLowerCase().includes('webm')) &&
        !f.name.endsWith('.gif'),
    );

    videoFiles.sort((a, b) => {
      const ra = VIDEO_FORMAT_RANK[a.format ?? ''] ?? 0;
      const rb = VIDEO_FORMAT_RANK[b.format ?? ''] ?? 0;
      if (rb !== ra) return rb - ra;
      const wa = Number(a.width ?? 0);
      const wb = Number(b.width ?? 0);
      return wb - wa;
    });

    const streams: StreamSource[] = videoFiles.slice(0, 4).map((f, i) => {
      const url = `${DL}/${identifier}/${encodeURIComponent(f.name)}`;
      const res = f.width && f.height ? `${f.width}x${f.height}` : f.format ?? 'video';
      return {
        label: `Server ${i + 1} — Archive (${res})`,
        kind: f.name.toLowerCase().endsWith('.m3u8') ? 'hls' : 'mp4',
        url,
      };
    });

    const meta = data.metadata;
    const year = meta.year ? Number(meta.year) : meta.date ? Number(meta.date.slice(0, 4)) : undefined;

    return {
      id: identifier,
      source: 'archive' as const,
      title: meta.title ?? identifier,
      year,
      poster: `https://archive.org/services/img/${identifier}`,
      backdrop: `https://archive.org/services/img/${identifier}`,
      overview: descToString(meta.description).slice(0, 800),
      imdbId: meta.imdb,
      streams: streams.length > 0 ? streams : undefined,
    };
  });
}
