// Player colors
export const PLAYER_COLORS: Record<string, { bg: string; text: string; border: string; badge: string }> = {
  'Austin': { bg: 'bg-blue-900/40', text: 'text-blue-400', border: 'border-blue-500', badge: 'bg-blue-600' },
  'Shaama': { bg: 'bg-purple-900/40', text: 'text-purple-400', border: 'border-purple-500', badge: 'bg-purple-600' },
  'Brendan': { bg: 'bg-green-900/40', text: 'text-green-400', border: 'border-green-500', badge: 'bg-green-600' },
  'Mitch': { bg: 'bg-orange-900/40', text: 'text-orange-400', border: 'border-orange-500', badge: 'bg-orange-600' },
  'Greg': { bg: 'bg-red-900/40', text: 'text-red-400', border: 'border-red-500', badge: 'bg-red-600' },
  'Ronald': { bg: 'bg-yellow-900/40', text: 'text-yellow-400', border: 'border-yellow-500', badge: 'bg-yellow-600' },
  'Dan': { bg: 'bg-cyan-900/40', text: 'text-cyan-400', border: 'border-cyan-500', badge: 'bg-cyan-600' },
  'Sean': { bg: 'bg-pink-900/40', text: 'text-pink-400', border: 'border-pink-500', badge: 'bg-pink-600' },
  'Ralph': { bg: 'bg-lime-900/40', text: 'text-lime-400', border: 'border-lime-500', badge: 'bg-lime-600' },
  'Peter': { bg: 'bg-amber-900/40', text: 'text-amber-400', border: 'border-amber-500', badge: 'bg-amber-600' },
};

export interface TeamEntry {
  team: string;
  seed: number;
  region: string;
  owner: string;
  bid: number;
  isDog?: boolean;
}

// Payout structure
export const PAYOUTS = {
  'Sweet 16': 25,
  'Elite 8': 50,
  'Final Four': 100,
  'Runner-up': 150,
  'Champion': 250,
};

export const TOTAL_POT = 1000;
export const BUY_IN = 100;

// All teams with owners
export const TEAMS: TeamEntry[] = [
  // Austin
  { team: 'Florida', seed: 1, region: 'South', owner: 'Austin', bid: 67 },
  { team: 'Iowa', seed: 9, region: 'South', owner: 'Austin', bid: 6 },
  { team: 'Ohio State', seed: 8, region: 'East', owner: 'Austin', bid: 10 },
  { team: 'Georgia', seed: 8, region: 'Midwest', owner: 'Austin', bid: 4 },
  { team: 'Akron', seed: 12, region: 'Midwest', owner: 'Austin', bid: 5 },
  { team: 'Villanova', seed: 8, region: 'West', owner: 'Austin', bid: 8 },

  // Shaama
  { team: 'Clemson', seed: 8, region: 'South', owner: 'Shaama', bid: 7 },
  { team: 'VCU', seed: 11, region: 'South', owner: 'Shaama', bid: 5 },
  { team: 'Illinois', seed: 3, region: 'South', owner: 'Shaama', bid: 43 },
  { team: 'Texas A&M', seed: 10, region: 'South', owner: 'Shaama', bid: 5 },
  { team: 'Michigan State', seed: 3, region: 'East', owner: 'Shaama', bid: 33 },
  // South Dogs
  { team: 'Troy', seed: 13, region: 'South', owner: 'Shaama', bid: 1, isDog: true },
  { team: 'Penn', seed: 14, region: 'South', owner: 'Shaama', bid: 1, isDog: true },
  { team: 'Idaho', seed: 15, region: 'South', owner: 'Shaama', bid: 1, isDog: true },
  { team: 'Prairie View', seed: 16, region: 'South', owner: 'Shaama', bid: 1, isDog: true },

  // Brendan
  { team: 'Vanderbilt', seed: 5, region: 'South', owner: 'Brendan', bid: 25 },
  { team: 'UNC', seed: 6, region: 'South', owner: 'Brendan', bid: 4 },
  { team: "St. John's", seed: 5, region: 'East', owner: 'Brendan', bid: 24 },
  { team: 'UCF', seed: 10, region: 'East', owner: 'Brendan', bid: 7 },
  { team: 'Alabama', seed: 4, region: 'Midwest', owner: 'Brendan', bid: 15 },
  { team: 'Tennessee', seed: 6, region: 'Midwest', owner: 'Brendan', bid: 13 },
  { team: 'Miami OH', seed: 11, region: 'Midwest', owner: 'Brendan', bid: 4 },
  { team: 'Missouri', seed: 10, region: 'West', owner: 'Brendan', bid: 5 },
  // East Dogs
  { team: 'CA Baptist', seed: 13, region: 'East', owner: 'Brendan', bid: 1, isDog: true },
  { team: 'North Dakota St', seed: 14, region: 'East', owner: 'Brendan', bid: 1, isDog: true },
  { team: 'Furman', seed: 15, region: 'East', owner: 'Brendan', bid: 0, isDog: true },
  { team: 'Siena', seed: 16, region: 'East', owner: 'Brendan', bid: 1, isDog: true },

  // Mitch
  { team: 'McNeese', seed: 12, region: 'South', owner: 'Mitch', bid: 5 },
  { team: 'Houston', seed: 2, region: 'South', owner: 'Mitch', bid: 60 },
  { team: 'Kentucky', seed: 7, region: 'Midwest', owner: 'Mitch', bid: 7 },
  { team: 'Santa Clara', seed: 10, region: 'Midwest', owner: 'Mitch', bid: 4 },
  { team: 'Utah State', seed: 9, region: 'West', owner: 'Mitch', bid: 7 },
  { team: 'Wisconsin', seed: 5, region: 'West', owner: 'Mitch', bid: 15 },
  { team: 'High Point', seed: 12, region: 'West', owner: 'Mitch', bid: 2 },

  // Greg
  { team: 'Duke', seed: 1, region: 'East', owner: 'Greg', bid: 86 },
  { team: 'Louisville', seed: 6, region: 'East', owner: 'Greg', bid: 12 },

  // Ronald
  { team: 'South Florida', seed: 11, region: 'East', owner: 'Ronald', bid: 7 },
  { team: 'Arizona', seed: 1, region: 'West', owner: 'Ronald', bid: 83 },
  { team: 'Miami FL', seed: 7, region: 'West', owner: 'Ronald', bid: 6 },
  // Midwest Dogs
  { team: 'Hofstra', seed: 13, region: 'Midwest', owner: 'Ronald', bid: 1, isDog: true },
  { team: 'Wright St', seed: 14, region: 'Midwest', owner: 'Ronald', bid: 1, isDog: true },
  { team: 'Tennessee St', seed: 15, region: 'Midwest', owner: 'Ronald', bid: 1, isDog: true },
  { team: 'Howard', seed: 16, region: 'Midwest', owner: 'Ronald', bid: 1, isDog: true },

  // Dan
  { team: 'Northern Iowa', seed: 12, region: 'East', owner: 'Dan', bid: 7 },
  { team: 'Virginia', seed: 3, region: 'Midwest', owner: 'Dan', bid: 23 },
  { team: 'Arkansas', seed: 4, region: 'West', owner: 'Dan', bid: 22 },
  { team: 'Purdue', seed: 2, region: 'West', owner: 'Dan', bid: 48 },

  // Sean
  { team: "Saint Mary's", seed: 7, region: 'South', owner: 'Sean', bid: 6 },
  { team: 'Michigan', seed: 1, region: 'Midwest', owner: 'Sean', bid: 83 },
  { team: 'BYU', seed: 6, region: 'West', owner: 'Sean', bid: 11 },

  // Ralph
  { team: 'UCLA', seed: 7, region: 'East', owner: 'Ralph', bid: 9 },
  { team: 'Texas Tech', seed: 5, region: 'Midwest', owner: 'Ralph', bid: 14 },
  { team: 'Iowa State', seed: 2, region: 'Midwest', owner: 'Ralph', bid: 46 },
  { team: 'Gonzaga', seed: 3, region: 'West', owner: 'Ralph', bid: 29 },
  // West Dogs
  { team: "Hawai'i", seed: 13, region: 'West', owner: 'Ralph', bid: 1, isDog: true },
  { team: 'Kennesaw St', seed: 14, region: 'West', owner: 'Ralph', bid: 0, isDog: true },
  { team: 'Queens', seed: 15, region: 'West', owner: 'Ralph', bid: 1, isDog: true },
  { team: 'Long Island', seed: 16, region: 'West', owner: 'Ralph', bid: 0, isDog: true },

  // Peter
  { team: 'Nebraska', seed: 4, region: 'South', owner: 'Peter', bid: 19 },
  { team: 'TCU', seed: 9, region: 'East', owner: 'Peter', bid: 5 },
  { team: 'Kansas', seed: 4, region: 'East', owner: 'Peter', bid: 20 },
  { team: 'UConn', seed: 2, region: 'East', owner: 'Peter', bid: 45 },
  { team: 'Saint Louis', seed: 9, region: 'Midwest', owner: 'Peter', bid: 5 },
  { team: 'Texas', seed: 11, region: 'West', owner: 'Peter', bid: 6 },
];

// Bracket matchups (R64)
export interface Matchup {
  topSeed: number;
  topTeam: string;
  bottomSeed: number;
  bottomTeam: string;
}

export const BRACKET: Record<string, Matchup[]> = {
  East: [
    { topSeed: 1, topTeam: 'Duke', bottomSeed: 16, bottomTeam: 'Siena' },
    { topSeed: 8, topTeam: 'Ohio State', bottomSeed: 9, bottomTeam: 'TCU' },
    { topSeed: 5, topTeam: "St. John's", bottomSeed: 12, bottomTeam: 'Northern Iowa' },
    { topSeed: 4, topTeam: 'Kansas', bottomSeed: 13, bottomTeam: 'CA Baptist' },
    { topSeed: 6, topTeam: 'Louisville', bottomSeed: 11, bottomTeam: 'South Florida' },
    { topSeed: 3, topTeam: 'Michigan State', bottomSeed: 14, bottomTeam: 'North Dakota St' },
    { topSeed: 7, topTeam: 'UCLA', bottomSeed: 10, bottomTeam: 'UCF' },
    { topSeed: 2, topTeam: 'UConn', bottomSeed: 15, bottomTeam: 'Furman' },
  ],
  West: [
    { topSeed: 1, topTeam: 'Arizona', bottomSeed: 16, bottomTeam: 'Long Island' },
    { topSeed: 8, topTeam: 'Villanova', bottomSeed: 9, bottomTeam: 'Utah State' },
    { topSeed: 5, topTeam: 'Wisconsin', bottomSeed: 12, bottomTeam: 'High Point' },
    { topSeed: 4, topTeam: 'Arkansas', bottomSeed: 13, bottomTeam: "Hawai'i" },
    { topSeed: 6, topTeam: 'BYU', bottomSeed: 11, bottomTeam: 'Texas' },
    { topSeed: 3, topTeam: 'Gonzaga', bottomSeed: 14, bottomTeam: 'Kennesaw St' },
    { topSeed: 7, topTeam: 'Miami FL', bottomSeed: 10, bottomTeam: 'Missouri' },
    { topSeed: 2, topTeam: 'Purdue', bottomSeed: 15, bottomTeam: 'Queens' },
  ],
  South: [
    { topSeed: 1, topTeam: 'Florida', bottomSeed: 16, bottomTeam: 'Prairie View' },
    { topSeed: 8, topTeam: 'Clemson', bottomSeed: 9, bottomTeam: 'Iowa' },
    { topSeed: 5, topTeam: 'Vanderbilt', bottomSeed: 12, bottomTeam: 'McNeese' },
    { topSeed: 4, topTeam: 'Nebraska', bottomSeed: 13, bottomTeam: 'Troy' },
    { topSeed: 6, topTeam: 'UNC', bottomSeed: 11, bottomTeam: 'VCU' },
    { topSeed: 3, topTeam: 'Illinois', bottomSeed: 14, bottomTeam: 'Penn' },
    { topSeed: 7, topTeam: "Saint Mary's", bottomSeed: 10, bottomTeam: 'Texas A&M' },
    { topSeed: 2, topTeam: 'Houston', bottomSeed: 15, bottomTeam: 'Idaho' },
  ],
  Midwest: [
    { topSeed: 1, topTeam: 'Michigan', bottomSeed: 16, bottomTeam: 'Howard' },
    { topSeed: 8, topTeam: 'Georgia', bottomSeed: 9, bottomTeam: 'Saint Louis' },
    { topSeed: 5, topTeam: 'Texas Tech', bottomSeed: 12, bottomTeam: 'Akron' },
    { topSeed: 4, topTeam: 'Alabama', bottomSeed: 13, bottomTeam: 'Hofstra' },
    { topSeed: 6, topTeam: 'Tennessee', bottomSeed: 11, bottomTeam: 'Miami OH' },
    { topSeed: 3, topTeam: 'Virginia', bottomSeed: 14, bottomTeam: 'Wright St' },
    { topSeed: 7, topTeam: 'Kentucky', bottomSeed: 10, bottomTeam: 'Santa Clara' },
    { topSeed: 2, topTeam: 'Iowa State', bottomSeed: 15, bottomTeam: 'Tennessee St' },
  ],
};

// Helper: get owner for a team name
export function getOwner(teamName: string): string | undefined {
  const entry = TEAMS.find(t => t.team === teamName);
  return entry?.owner;
}

// Helper: get team entry
export function getTeamEntry(teamName: string): TeamEntry | undefined {
  return TEAMS.find(t => t.team === teamName);
}

// All player names
export const PLAYERS = ['Austin', 'Shaama', 'Brendan', 'Mitch', 'Greg', 'Ronald', 'Dan', 'Sean', 'Ralph', 'Peter'];
