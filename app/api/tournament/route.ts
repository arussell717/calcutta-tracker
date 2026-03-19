import { NextResponse } from 'next/server';
import { normalizeTeamName } from '@/lib/espn';

export const dynamic = 'force-dynamic';

// Fetches all tournament games across multiple days to find eliminated teams and bracket results
export async function GET() {
  try {
    // Fetch the NCAA tournament scoreboard — use the tournament endpoint
    const urls = [
      // Current day
      'https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/scoreboard?groups=100&limit=100',
      // Also try the tournament-specific endpoint
      'https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/scoreboard?groups=100&limit=100&dates=20260319',
      'https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/scoreboard?groups=100&limit=100&dates=20260320',
      'https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/scoreboard?groups=100&limit=100&dates=20260321',
      'https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/scoreboard?groups=100&limit=100&dates=20260322',
      'https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/scoreboard?groups=100&limit=100&dates=20260323',
      'https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/scoreboard?groups=100&limit=100&dates=20260324',
      'https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/scoreboard?groups=100&limit=100&dates=20260325',
      'https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/scoreboard?groups=100&limit=100&dates=20260326',
      'https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/scoreboard?groups=100&limit=100&dates=20260327',
      'https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/scoreboard?groups=100&limit=100&dates=20260328',
      'https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/scoreboard?groups=100&limit=100&dates=20260329',
      'https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/scoreboard?groups=100&limit=100&dates=20260330',
    ];

    const eliminated: string[] = [];
    const winners: string[] = [];
    const gameResults: Array<{ winner: string; loser: string; winnerScore: string; loserScore: string; round: string }> = [];

    const responses = await Promise.allSettled(
      urls.map(url => fetch(url, { next: { revalidate: 120 } }).then(r => r.json()))
    );

    for (const result of responses) {
      if (result.status !== 'fulfilled') continue;
      const data = result.value;
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
            gameResults.push({ winner: winnerName, loser: loserName, winnerScore, loserScore, round: '' });
          }
        }
      }
    }

    return NextResponse.json({ eliminated, winners, gameResults });
  } catch {
    return NextResponse.json({ eliminated: [], winners: [], gameResults: [] });
  }
}
