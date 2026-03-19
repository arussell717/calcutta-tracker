import { NextResponse } from 'next/server';
import { fetchScores } from '@/lib/espn';

export const dynamic = 'force-dynamic';

export async function GET() {
  const scores = await fetchScores();
  return NextResponse.json(scores);
}
