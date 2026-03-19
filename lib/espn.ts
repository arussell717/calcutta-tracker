export interface GameScore {
  id: string;
  status: 'pre' | 'in' | 'post';
  statusDetail: string;
  clock: string;
  period: number;
  homeTeam: string;
  homeScore: string;
  homeLogo: string;
  homeSeed: string;
  awayTeam: string;
  awayScore: string;
  awayLogo: string;
  awaySeed: string;
  startTime: string;
  broadcast: string;
}

// Team name normalization for ESPN -> our data matching
const NAME_MAP: Record<string, string> = {
  'UConn': 'UConn',
  'Connecticut': 'UConn',
  'Saint Mary\'s': "Saint Mary's",
  'St. Mary\'s': "Saint Mary's",
  'SMC': "Saint Mary's",
  'St. John\'s': "St. John's",
  'Saint John\'s': "St. John's",
  'North Carolina': 'UNC',
  'Miami': 'Miami FL',
  'Miami (FL)': 'Miami FL',
  'Miami (OH)': 'Miami OH',
  'Texas A&M': 'Texas A&M',
  'VCU': 'VCU',
  'UCF': 'UCF',
  'BYU': 'BYU',
  'UCLA': 'UCLA',
  'USC': 'USC',
  'TCU': 'TCU',
  'LSU': 'LSU',
  'Iowa St': 'Iowa State',
  'Iowa State': 'Iowa State',
  'Michigan St': 'Michigan State',
  'Michigan State': 'Michigan State',
  'Ohio St': 'Ohio State',
  'Ohio State': 'Ohio State',
  'Utah St': 'Utah State',
  'Utah State': 'Utah State',
  'Penn St': 'Penn State',
  'Texas Tech': 'Texas Tech',
  'North Dakota State': 'North Dakota St',
  'North Dakota St': 'North Dakota St',
  'South Florida': 'South Florida',
  'USF': 'South Florida',
  'McNeese State': 'McNeese',
  'McNeese St': 'McNeese',
  'McNeese': 'McNeese',
  'Prairie View A&M': 'Prairie View',
  'Prairie View': 'Prairie View',
  'Northern Iowa': 'Northern Iowa',
  'High Point': 'High Point',
  'CA Baptist': 'CA Baptist',
  'Cal Baptist': 'CA Baptist',
  'Kennesaw State': 'Kennesaw St',
  'Kennesaw St': 'Kennesaw St',
  'Wright State': 'Wright St',
  'Wright St': 'Wright St',
  'Tennessee State': 'Tennessee St',
  'Tennessee St': 'Tennessee St',
  'Long Island': 'Long Island',
  'LIU': 'Long Island',
  'Santa Clara': 'Santa Clara',
  'Saint Louis': 'Saint Louis',
  'St. Louis': 'Saint Louis',
  'SLU': 'Saint Louis',
  'Queens': 'Queens',
};

export function normalizeTeamName(name: string): string {
  return NAME_MAP[name] || name;
}

export async function fetchScores(): Promise<GameScore[]> {
  try {
    const res = await fetch(
      'https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/scoreboard?groups=100&limit=100',
      { next: { revalidate: 60 } }
    );
    if (!res.ok) return [];
    const data = await res.json();

    const games: GameScore[] = (data.events || []).map((event: any) => {
      const competition = event.competitions?.[0];
      if (!competition) return null;

      const home = competition.competitors?.find((c: any) => c.homeAway === 'home');
      const away = competition.competitors?.find((c: any) => c.homeAway === 'away');
      if (!home || !away) return null;

      const status = competition.status;
      let statusType: 'pre' | 'in' | 'post' = 'pre';
      if (status?.type?.name === 'STATUS_IN_PROGRESS' || status?.type?.name === 'STATUS_HALFTIME') {
        statusType = 'in';
      } else if (status?.type?.name === 'STATUS_FINAL') {
        statusType = 'post';
      }

      return {
        id: event.id,
        status: statusType,
        statusDetail: status?.type?.shortDetail || '',
        clock: status?.displayClock || '',
        period: status?.period || 0,
        homeTeam: normalizeTeamName(home.team?.shortDisplayName || home.team?.displayName || ''),
        homeScore: home.score || '0',
        homeLogo: home.team?.logo || '',
        homeSeed: home.curatedRank?.current?.toString() || '',
        awayTeam: normalizeTeamName(away.team?.shortDisplayName || away.team?.displayName || ''),
        awayScore: away.score || '0',
        awayLogo: away.team?.logo || '',
        awaySeed: away.curatedRank?.current?.toString() || '',
        startTime: event.date || '',
        broadcast: competition.broadcasts?.[0]?.names?.[0] || '',
      };
    }).filter(Boolean);

    return games;
  } catch {
    return [];
  }
}
