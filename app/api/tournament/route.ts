import { NextResponse } from 'next/server';
import { normalizeTeamName } from '@/lib/espn';

export const dynamic = 'force-dynamic';

// Fetches all tournament games using date range query
export async function GET() {
  try {
    // Use date range query - much more reliable than individual dates
    const url = 'https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/scoreboard?groups=100&limit=200&dates=20260319-20260415';
    
    const response = await fetch(url, { next: { revalidate: 60 } });
    const data = await response.json();

    const eliminated: string[] = [];
    const winners: string[] = [];
    const gameResults: Array<{ winner: string; loser: string; winnerScore: string; loserScore: string }> = [];

    for (const event of (data.events || [])) {
      const comp = event.competitions?.[0];
      if (!comp) continue;
      const statusName = comp.status?.type?.name;
      if (statusName === 'STATUS_FINAL') {
        const competitors = comp.competitors || [];
        let winnerName = '';
        let loserName = '';
        let winnerScore = '0';
        let loserScore = '0';
        for (const c of competitors) {
          const teamName = normalizeTeamName(c.team?.shortDisplayName || c.team?.displayName || '');
          if (c.winner === true) {
            winnerName = teamName;
            winnerScore = c.score || '0';
            if (!winners.includes(teamName)) winners.push(teamName);
          } else if (c.winner === false) {
            loserName = teamName;
            loserScore = c.score || '0';
            if (!eliminated.includes(teamName)) eliminated.push(teamName);
          }
        }
        if (winnerName && loserName) {
          gameResults.push({ winner: winnerName, loser: loserName, winnerScore, loserScore });
        }
      }
    }

    return NextResponse.json({ eliminated, winners, gameResults });
  } catch {
    return NextResponse.json({ eliminated: [], winners: [], gameResults: [] });
  }
}
