import { NextResponse } from 'next/server';
import { getTrailerYoutubeId } from '@/lib/sources/tmdb';

export const revalidate = 86400;

export async function GET(
  req: Request,
  context: { params: Promise<{ tmdbId: string }> },
) {
  const { tmdbId } = await context.params;
  const url = new URL(req.url);
  const media = (url.searchParams.get('media') as 'movie' | 'tv') ?? 'movie';
  const id = Number(tmdbId);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: 'bad id' }, { status: 400 });
  }
  const youtubeId = await getTrailerYoutubeId(id, media);
  return NextResponse.json({ youtubeId });
}
