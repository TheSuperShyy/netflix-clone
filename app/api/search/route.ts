import { NextResponse } from 'next/server';
import { searchTmdb } from '@/lib/sources/tmdb';
import { searchArchive } from '@/lib/sources/archive';

export const revalidate = 60;

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = (url.searchParams.get('q') ?? '').trim();
  if (q.length < 2) {
    return NextResponse.json({ results: [] });
  }
  const [tmdb, archive] = await Promise.all([
    searchTmdb(q).catch(() => []),
    searchArchive(q, 8).catch(() => []),
  ]);
  return NextResponse.json({ results: [...tmdb, ...archive] });
}
