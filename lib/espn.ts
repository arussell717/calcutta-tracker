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
// ESPN uses many abbreviations - map them ALL to our canonical names
const NAME_MAP: Record<string, string> = {
  // 1-seeds
  'Duke': 'Duke',
  'Florida': 'Florida',
  'Auburn': 'Auburn',
  'Houston': 'Houston',
  'Michigan': 'Michigan',
  
  // 2-seeds
  'UConn': 'UConn',
  'Connecticut': 'UConn',
  'Iowa State': 'Iowa State',
  'Iowa St': 'Iowa State',
  'ISU': 'Iowa State',
  'Purdue': 'Purdue',
  "St. John's": "St. John's",
  "Saint John's": "St. John's",
  "St John's": "St. John's",
  
  // 3-seeds
  'Illinois': 'Illinois',
  'Michigan State': 'Michigan State',
  'Michigan St': 'Michigan State',
  'Mich St': 'Michigan State',
  'MSU': 'Michigan State',
  'Gonzaga': 'Gonzaga',
  'Zags': 'Gonzaga',
  'Texas A&M': 'Texas A&M',
  'TAMU': 'Texas A&M',
  'Virginia': 'Virginia',
  'UVA': 'Virginia',
  'Wisconsin': 'Wisconsin',
  'Wisc': 'Wisconsin',
  'Wis': 'Wisconsin',
  
  // 4-seeds
  'Alabama': 'Alabama',
  'Bama': 'Alabama',
  'Arizona': 'Arizona',
  'Arkansas': 'Arkansas',
  'Ark': 'Arkansas',
  'Kansas': 'Kansas',
  'KU': 'Kansas',
  'Maryland': 'Maryland',
  'MD': 'Maryland',
  'Nebraska': 'Nebraska',
  'Neb': 'Nebraska',
  
  // 5-seeds
  'Clemson': 'Clemson',
  'Memphis': 'Memphis',
  'Oregon': 'Oregon',
  'Texas Tech': 'Texas Tech',
  'TTU': 'Texas Tech',
  'Vanderbilt': 'Vanderbilt',
  'Vandy': 'Vanderbilt',
  
  // 6-seeds
  'BYU': 'BYU',
  'Brigham Young': 'BYU',
  'Louisville': 'Louisville',
  'Missouri': 'Missouri',
  'Mizzou': 'Missouri',
  'North Carolina': 'UNC',
  'UNC': 'UNC',
  'N Carolina': 'UNC',
  'Tennessee': 'Tennessee',
  'Tenn': 'Tennessee',
  
  // 7-seeds
  'Kentucky': 'Kentucky',
  'Marquette': 'Marquette',
  'Miami': 'Miami FL',
  'Miami (FL)': 'Miami FL',
  'Miami FL': 'Miami FL',
  "Saint Mary's": "Saint Mary's",
  "St. Mary's": "Saint Mary's",
  "Saint Mary's (CA)": "Saint Mary's",
  'SMC': "Saint Mary's",
  'UCLA': 'UCLA',
  
  // 8-seeds
  'Georgia': 'Georgia',
  'UGA': 'Georgia',
  'Mississippi State': 'Mississippi State',
  'Mississippi St': 'Mississippi State',
  'Miss State': 'Mississippi State',
  'Miss St': 'Mississippi State',
  'Ohio State': 'Ohio State',
  'Ohio St': 'Ohio State',
  'OSU': 'Ohio State',
  'Villanova': 'Villanova',
  'Nova': 'Villanova',
  
  // 9-seeds
  'Baylor': 'Baylor',
  'Creighton': 'Creighton',
  'Iowa': 'Iowa',
  'Oklahoma': 'Oklahoma',
  'Saint Louis': 'Saint Louis',
  'St. Louis': 'Saint Louis',
  'SLU': 'Saint Louis',
  'TCU': 'TCU',
  'Utah State': 'Utah State',
  'Utah St': 'Utah State',
  
  // 10-seeds
  'Arkansas': 'Arkansas',
  'Miami (OH)': 'Miami OH',
  'Miami OH': 'Miami OH',
  'Miami Ohio': 'Miami OH',
  'New Mexico': 'New Mexico',
  'N Mexico': 'New Mexico',
  'UNM': 'New Mexico',
  'Santa Clara': 'Santa Clara',
  'UCF': 'UCF',
  'VCU': 'VCU',
  
  // 11-seeds
  'Drake': 'Drake',
  'South Florida': 'South Florida',
  'USF': 'South Florida',
  'S Florida': 'South Florida',
  'Texas': 'Texas',
  'Xavier': 'Xavier',
  'SMU': 'SMU',
  'NC State': 'NC State',
  'N.C. State': 'NC State',
  
  // 12-seeds
  'Akron': 'Akron',
  'Colorado State': 'Colorado State',
  'Colorado St': 'Colorado State',
  'Colo St': 'Colorado State',
  'CSU': 'Colorado State',
  'High Point': 'High Point',
  'Liberty': 'Liberty',
  'McNeese State': 'McNeese',
  'McNeese St': 'McNeese',
  'McNeese': 'McNeese',
  'Northern Iowa': 'Northern Iowa',
  'N Iowa': 'Northern Iowa',
  'UNI': 'Northern Iowa',
  'UC San Diego': 'UC San Diego',
  'UCSD': 'UC San Diego',
  
  // 13-seeds
  'CA Baptist': 'CA Baptist',
  'Cal Baptist': 'CA Baptist',
  'CBU': 'CA Baptist',
  'Grand Canyon': 'Grand Canyon',
  'GCU': 'Grand Canyon',
  'Hofstra': 'Hofstra',
  'Troy': 'Troy',
  'UNC Wilmington': 'UNC Wilmington',
  'UNCW': 'UNC Wilmington',
  
  // 14-seeds
  'Kennesaw State': 'Kennesaw St',
  'Kennesaw St': 'Kennesaw St',
  'Montana': 'Montana',
  'Penn': 'Penn',
  'Wright State': 'Wright St',
  'Wright St': 'Wright St',
  'Yale': 'Yale',
  'Bryant': 'Bryant',
  
  // 15-seeds
  'Furman': 'Furman',
  'Lipscomb': 'Lipscomb',
  'Nebraska Omaha': 'Nebraska Omaha',
  'Neb Omaha': 'Nebraska Omaha',
  'UNO': 'Nebraska Omaha',
  'Omaha': 'Nebraska Omaha',
  'Queens': 'Queens',
  'Queens (NC)': 'Queens',
  'Robert Morris': 'Robert Morris',
  'Rob Morris': 'Robert Morris',
  'Wofford': 'Wofford',
  
  // 16-seeds
  'Howard': 'Howard',
  'Long Island': 'Long Island',
  'LIU': 'Long Island',
  'Norfolk State': 'Norfolk State',
  'Norfolk St': 'Norfolk State',
  'Prairie View A&M': 'Prairie View',
  'Prairie View': 'Prairie View',
  'PVAMU': 'Prairie View',
  'SIU Edwardsville': 'SIU Edwardsville',
  'SIUE': 'SIU Edwardsville',
  'Siena': 'Siena',
  'Alabama State': 'Alabama State',
  'Alabama St': 'Alabama State',
  'Ala State': 'Alabama State',
  "Saint Francis": "Saint Francis",
  "St. Francis": "Saint Francis",
  "American": "American",
  "American U": "American",
  "Mount St. Mary's": "Mount St. Mary's",
  "Mt St Mary's": "Mount St. Mary's",
  "Mt. St. Mary's": "Mount St. Mary's",
  
  // Other
  'North Dakota State': 'North Dakota St',
  'North Dakota St': 'North Dakota St',
  'N Dakota St': 'North Dakota St',
  'NDSU': 'North Dakota St',
  'Tennessee State': 'Tennessee St',
  'Tennessee St': 'Tennessee St',
  'Tenn St': 'Tennessee St',
  'LSU': 'LSU',
  'USC': 'USC',
  "Hawai'i": "Hawai'i",
  "Hawaii": "Hawai'i",
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
// force redeploy Fri Mar 20 00:36:08 UTC 2026
