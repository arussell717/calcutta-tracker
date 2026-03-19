'use client';

import { useState, useEffect } from 'react';
import { TEAMS, PLAYERS, PLAYER_COLORS, PAYOUTS, BUY_IN } from '@/lib/data';

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
  profit: number;
  aliveTeams: TeamWithStatus[];
  deadTeams: TeamWithStatus[];
}

export default function LeaderboardPage() {
  const [eliminatedTeams, setEliminatedTeams] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function fetchScores() {
      try {
        const res = await fetch('/api/scores');
        const data = await res.json();
        if (data.events) {
          const eliminated = new Set<string>();
          for (const event of data.events) {
            const competitions = event.competitions || [];
            for (const comp of competitions) {
              const statusType = comp.status?.type?.name;
              if (statusType === 'STATUS_FINAL') {
                const competitors = comp.competitors || [];
                for (const c of competitors) {
                  if (c.winner === false) {
                    const teamName = c.team?.displayName || c.team?.shortDisplayName || '';
                    if (teamName) eliminated.add(teamName);
                  }
                }
              }
            }
          }
          setEliminatedTeams(eliminated);
        }
      } catch (e) {
        // silently fail
      }
    }
    fetchScores();
    const interval = setInterval(fetchScores, 60000);
    return () => clearInterval(interval);
  }, []);

  function isEliminated(teamName: string): boolean {
    if (eliminatedTeams.has(teamName)) return true;
    // fuzzy match
    for (const elim of Array.from(eliminatedTeams)) {
      if (elim.toLowerCase().includes(teamName.toLowerCase()) ||
          teamName.toLowerCase().includes(elim.toLowerCase())) {
        return true;
      }
    }
    return false;
  }

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
      profit: -BUY_IN,
      aliveTeams,
      deadTeams,
    };
  }).sort((a, b) => b.teamsAlive - a.teamsAlive || b.teamCount - a.teamCount);

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
                  <div className="text-xs text-gray-500">
                    ${player.totalPayout} earned
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
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {player.deadTeams.map(t => (
                    <span
                      key={t.team}
                      className="text-xs px-2 py-1 rounded-full border border-gray-700/50 bg-gray-800/30 text-gray-600 line-through"
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
