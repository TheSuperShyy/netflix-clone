import type { Title } from '@/lib/types';
import { cached } from '@/lib/cache';

const PLUTO_LINEUP =
  'https://api.pluto.tv/v2/channels?start=2024-01-01T00:00:00.000Z&stop=2024-01-01T01:00:00.000Z';

const ENABLED = process.env.ENABLE_PLUTO === 'true';

type PlutoChannel = {
  _id: string;
  name: string;
  slug: string;
  summary?: string;
  number?: number;
  featuredImage?: { path?: string };
  colorLogoPNG?: { path?: string };
  solidLogoPNG?: { path?: string };
  stitched?: { urls?: Array<{ url: string; type?: string }> };
};

export async function getPlutoChannels(limit = 18): Promise<Title[]> {
  if (!ENABLED) return [];
  return cached(`pluto:channels:${limit}`, 30 * 60 * 1000, async () => {
    try {
      const res = await fetch(PLUTO_LINEUP, { next: { revalidate: 1800 } });
      if (!res.ok) return [];
      const data = (await res.json()) as PlutoChannel[];
      return data
        .filter((c) => c.stitched?.urls?.[0]?.url && c.featuredImage?.path)
        .slice(0, limit)
        .map(channelToTitle);
    } catch {
      return [];
    }
  });
}

export async function resolvePluto(id: string): Promise<Title | null> {
  if (!ENABLED) return null;
  const channels = await getPlutoChannels(200);
  return channels.find((c) => c.id === id) ?? null;
}

function channelToTitle(c: PlutoChannel): Title {
  const streamUrl = c.stitched!.urls![0].url;
  const poster = c.featuredImage?.path ?? c.colorLogoPNG?.path ?? c.solidLogoPNG?.path ?? '';
  return {
    id: c._id,
    source: 'pluto',
    title: c.name,
    poster,
    backdrop: poster,
    overview: c.summary ?? `Pluto TV channel ${c.number ?? ''} ${c.name}`.trim(),
    streams: [{ label: 'Server 1 — Pluto (HLS)', kind: 'hls', url: streamUrl }],
  };
}
