'use client';

import { TEAMS, PLAYERS, PLAYER_COLORS, PAYOUTS, BUY_IN } from '@/lib/data';
import { useTournamentData } from '@/lib/useTournament';

interface TeamWithStatus {
  team: string;
  seed: number;
  region: string;
  bid: number;
  isDog?: boolean;
  eliminated: boolean;
}

interface PlayerStats {
  name: string;
  teamCount: number;
  totalBid: number;
  teamsAlive: number;
  teamsEliminated: number;
  totalPayout: number;
  aliveTeams: TeamWithStatus[];
  deadTeams: TeamWithStatus[];
}

export default function LeaderboardPage() {
  const { isEliminated, loading } = useTournamentData();

  const stats: PlayerStats[] = PLAYERS.map(player => {
    const playerTeams = TEAMS.filter(t => t.owner === player);
    const totalBid = playerTeams.reduce((sum, t) => sum + t.bid, 0);

    const teamsWithStatus: TeamWithStatus[] = playerTeams.map(t => ({
      team: t.team,
      seed: t.seed,
      region: t.region,
      bid: t.bid,
      isDog: t.isDog,
      eliminated: isEliminated(t.team),
    }));

    const aliveTeams = teamsWithStatus.filter(t => !t.eliminated);
    const deadTeams = teamsWithStatus.filter(t => t.eliminated);

    return {
      name: player,
      teamCount: playerTeams.length,
      totalBid,
      teamsAlive: aliveTeams.length,
      teamsEliminated: deadTeams.length,
      totalPayout: 0,
      aliveTeams,
      deadTeams,
    };
  }).sort((a, b) => b.teamsAlive - a.teamsAlive || b.teamCount - a.teamCount);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">🏆 Leaderboard</h1>
        <p className="text-gray-400 mt-1">$1,000 Pot &bull; $100 Buy-in</p>
        {loading && <p className="text-xs text-gray-600 mt-1">Loading live data...</p>}
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
                  <div className="text-sm">
                    <span className="text-green-400 font-bold">{player.teamsAlive}</span>
                    <span className="text-gray-500"> alive</span>
                    {player.teamsEliminated > 0 && (
                      <>
                        <span className="text-gray-600 mx-1">|</span>
                        <span className="text-red-400 font-bold">{player.teamsEliminated}</span>
                        <span className="text-gray-500"> out</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Alive Teams */}
              {player.aliveTeams.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-1">
                  {player.aliveTeams.map(t => (
                    <span
                      key={t.team}
                      className={`text-xs px-2 py-1 rounded-full border ${colors?.border || 'border-gray-700'} ${colors?.bg || 'bg-gray-800'} ${colors?.text || 'text-gray-300'}`}
                    >
                      ({t.seed}) {t.team} {t.isDog ? '🐕' : ''} <span className="text-gray-500">${t.bid}</span>
                    </span>
                  ))}
                </div>
              )}

              {/* Dead Teams */}
              {player.deadTeams.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2 pt-2 border-t border-gray-800">
                  <span className="text-[10px] text-gray-600 w-full">Eliminated:</span>
                  {player.deadTeams.map(t => (
                    <span
                      key={t.team}
                      className="text-xs px-2 py-1 rounded-full border border-red-900/30 bg-red-900/10 text-gray-600 line-through"
                    >
                      💀 ({t.seed}) {t.team} {t.isDog ? '🐕' : ''} <span className="text-gray-700">${t.bid}</span>
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
