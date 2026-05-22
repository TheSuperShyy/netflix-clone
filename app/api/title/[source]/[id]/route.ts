import { NextResponse } from 'next/server';
import { resolveTitle } from '@/lib/sources';
import { findSubtitles } from '@/lib/sources/opensubtitles';

export const revalidate = 600;

export async function GET(
  _req: Request,
  context: { params: Promise<{ source: string; id: string }> },
) {
  const { source, id } = await context.params;
  const title = await resolveTitle(source, id);
  if (!title) {
    return NextResponse.json({ error: 'not found' }, { status: 404 });
  }
  const subtitles = await findSubtitles({
    imdbId: title.imdbId,
    tmdbId: title.tmdbId,
    query: title.title,
    year: title.year,
    languages: 'en',
  });
  return NextResponse.json({ title: { ...title, subtitles } });
}
