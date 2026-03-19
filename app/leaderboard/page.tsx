'use client';

import { TEAMS, PLAYERS, PLAYER_COLORS, PAYOUTS, BUY_IN } from '@/lib/data';

// For now, all teams start alive. In a real scenario you'd track eliminations.
// We'll show the potential payouts and current status.

interface PlayerStats {
  name: string;
  teamCount: number;
  totalBid: number;
  teamsAlive: number;
  totalPayout: number;
  profit: number;
  teams: Array<{ team: string; seed: number; region: string; bid: number; isDog?: boolean }>;
}

function getPlayerStats(): PlayerStats[] {
  return PLAYERS.map(player => {
    const playerTeams = TEAMS.filter(t => t.owner === player);
    const totalBid = playerTeams.reduce((sum, t) => sum + t.bid, 0);
    
    // All teams start alive (tournament tracking would update this)
    const teamsAlive = playerTeams.length;
    const totalPayout = 0; // Would be calculated from results
    
    return {
      name: player,
      teamCount: playerTeams.length,
      totalBid: totalBid,
      teamsAlive,
      totalPayout,
      profit: totalPayout - BUY_IN,
      teams: playerTeams.map(t => ({ team: t.team, seed: t.seed, region: t.region, bid: t.bid, isDog: t.isDog })),
    };
  }).sort((a, b) => b.teamsAlive - a.teamsAlive || b.teamCount - a.teamCount);
}

export default function LeaderboardPage() {
  const stats = getPlayerStats();

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">🏆 Leaderboard</h1>
        <p className="text-gray-400 mt-1">$1,000 Pot &bull; $100 Buy-in</p>
      </div>

      {/* Payout Reference */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
        <h3 className="text-sm font-semibold text-gray-400 mb-2">Payout Structure</h3>
        <div className="flex flex-wrap gap-3">
          {Object.entries(PAYOUTS).map(([round, amount]) => (
            <div key={round} className="text-center">
              <div className="text-lg font-bold text-green-400">${amount}</div>
              <div className="text-xs text-gray-500">{round}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Player Cards */}
      <div className="space-y-3">
        {stats.map((player, idx) => {
          const colors = PLAYER_COLORS[player.name];
          return (
            <div
              key={player.name}
              className={`bg-gray-900 rounded-xl border ${colors?.border || 'border-gray-800'} p-4`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-gray-600">#{idx + 1}</span>
                  <div>
                    <span className={`font-bold text-lg ${colors?.text || 'text-white'}`}>
                      {player.name}
                    </span>
                    <div className="text-xs text-gray-500">
                      {player.teamCount} teams &bull; ${player.totalBid} spent
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-400">
                    <span className="text-green-400 font-bold">{player.teamsAlive}</span> alive
                  </div>
                  <div className="text-xs text-gray-500">
                    ${player.totalPayout} earned
                  </div>
                </div>
              </div>

              {/* Teams list */}
              <div className="flex flex-wrap gap-1.5">
                {player.teams.map(t => (
                  <span
                    key={t.team}
                    className={`text-xs px-2 py-1 rounded-full border ${colors?.border || 'border-gray-700'} ${colors?.bg || 'bg-gray-800'} ${colors?.text || 'text-gray-300'}`}
                  >
                    ({t.seed}) {t.team} {t.isDog ? '🐕' : ''} <span className="text-gray-500">${t.bid}</span>
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
