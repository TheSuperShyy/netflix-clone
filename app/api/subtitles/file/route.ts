import { NextResponse } from 'next/server';
import { fetchSubtitleVtt } from '@/lib/sources/opensubtitles';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const fileId = url.searchParams.get('file_id');
  if (!fileId) {
    return NextResponse.json({ error: 'file_id required' }, { status: 400 });
  }
  const vtt = await fetchSubtitleVtt(fileId);
  if (!vtt) {
    return NextResponse.json({ error: 'not found' }, { status: 404 });
  }
  return new NextResponse(vtt, {
    headers: {
      'content-type': 'text/vtt; charset=utf-8',
      'cache-control': 'public, max-age=86400, immutable',
    },
  });
}
