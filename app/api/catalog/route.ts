import { NextResponse } from 'next/server';
import { getLandingRows } from '@/lib/sources';

export const revalidate = 3600;

export async function GET() {
  const rows = await getLandingRows();
  return NextResponse.json({ rows });
}
