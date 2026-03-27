'use client';

import { TEAMS, PLAYERS, PLAYER_COLORS, PAYOUTS, BUY_IN, BRACKET } from '@/lib/data';
import { useTournamentData } from '@/lib/useTournament';

interface TeamWithStatus {
  team: string;
  seed: number;
  region: string;
  bid: number;
  isDog?: boolean;
  eliminated: boolean;
  wins: number;
  payout: number;
}

interface PlayerStats {
  name: string;
  teamCount: number;
  totalBid: number;
  teamsAlive: number;
  teamsEliminated: number;
  totalPayout: number;
  netProfit: number;
  aliveTeams: TeamWithStatus[];
  deadTeams: TeamWithStatus[];
}

export default function LeaderboardPage() {
  const { isEliminated, getTeamWins, getTeamPayout, getTeamRound, loading } = useTournamentData();

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
      wins: getTeamWins(t.team),
      payout: getTeamPayout(t.team, BRACKET),
    }));

    const aliveTeams = teamsWithStatus.filter(t => !t.eliminated).sort((a, b) => b.wins - a.wins || b.payout - a.payout);
    const deadTeams = teamsWithStatus.filter(t => t.eliminated).sort((a, b) => b.payout - a.payout || b.wins - a.wins);
    const totalPayout = teamsWithStatus.reduce((sum, t) => sum + t.payout, 0);

    return {
      name: player,
      teamCount: playerTeams.length,
      totalBid,
      teamsAlive: aliveTeams.length,
      teamsEliminated: deadTeams.length,
      totalPayout,
      netProfit: totalPayout - BUY_IN,
      aliveTeams,
      deadTeams,
    };
  }).sort((a, b) => b.totalPayout - a.totalPayout || b.teamsAlive - a.teamsAlive);

  function roundLabel(teamName: string, elim: boolean): string {
    const round = getTeamRound(teamName, BRACKET);
    switch (round) {
      case 'CHAMPION': return '🏆 Champ';
      case 'CHAMP_GAME': return '🥈 Runner-up';
      case 'FF': return 'Final Four';
      case 'E8': return 'Elite 8';
      case 'S16': return 'Sweet 16';
      case 'R32': return 'Round of 32';
      default: return 'Round of 64';
    }
  }

  // Troll messages for the first person fully eliminated
  const CLOWN_MESSAGES = [
    "First one out... hate to see it 🤡",
    "Thanks for the donation 🤡",
    "Better luck next year, champ 🤡",
    "At least you still have your personality 🤡",
    "Your bracket called... it wants a refund 🤡",
  ];

  // Determine who's fully eliminated (0 alive teams) and who's still going
  const allEliminated = stats.filter(p => p.teamsAlive === 0 && p.teamsEliminated > 0);
  const stillAlive = stats.filter(p => p.teamsAlive > 0);
  const notStarted = stats.filter(p => p.teamsAlive === 0 && p.teamsEliminated === 0);

  // Find the first person fully eliminated (fewest total games played = eliminated earliest)
  // We use the player with the fewest total wins across all their teams as proxy for "first out"
  const firstClown = allEliminated.length > 0
    ? allEliminated.reduce((earliest, p) => {
        const totalWins = p.deadTeams.reduce((sum, t) => sum + t.wins, 0);
        const earliestWins = earliest.deadTeams.reduce((sum, t) => sum + t.wins, 0);
        return totalWins < earliestWins ? p : earliest;
      })
    : null;

  // Pick a consistent troll message based on the clown's name
  const clownMsg = firstClown
    ? CLOWN_MESSAGES[firstClown.name.length % CLOWN_MESSAGES.length]
    : '';

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

      {/* Still In It */}
      {stillAlive.length > 0 && (
        <>
          <h2 className="text-lg font-bold text-green-400">🟢 Still Alive</h2>
          <div className="space-y-3">
            {stillAlive.map((player, idx) => {
              const colors = PLAYER_COLORS[player.name];
              const globalIdx = stats.indexOf(player);
              return (
                <div
                  key={player.name}
                  className={`bg-gray-900 rounded-xl border ${colors?.border || 'border-gray-800'} p-4`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-bold text-gray-600">#{globalIdx + 1}</span>
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
                      <div className={`text-xl font-bold ${player.totalPayout > 0 ? 'text-green-400' : 'text-gray-600'}`}>
                        ${player.totalPayout}
                      </div>
                      <div className={`text-xs ${player.netProfit >= 0 ? 'text-green-500' : 'text-red-400'}`}>
                        {player.netProfit >= 0 ? '+' : ''}{player.netProfit} net
                      </div>
                      <div className="text-xs mt-0.5">
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
                          ({t.seed}) {t.team} {t.isDog ? '🐕' : ''}
                          {t.payout > 0 && <span className="text-green-400 ml-1">💰${t.payout}</span>}
                          {t.wins > 0 && <span className="text-gray-500 ml-1">{t.wins}W</span>}
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
                          className={`text-xs px-2 py-1 rounded-full border ${
                            t.payout > 0 
                              ? 'border-green-900/40 bg-green-900/10 text-green-600' 
                              : 'border-red-900/30 bg-red-900/10 text-gray-600 line-through'
                          }`}
                        >
                          {t.payout > 0 ? '💰' : '💀'} ({t.seed}) {t.team} {t.isDog ? '🐕' : ''}
                          {t.payout > 0 
                            ? <span className="text-green-400 ml-1">${t.payout} ({roundLabel(t.team, true)})</span>
                            : <span className="text-gray-700 ml-1">${t.bid}</span>
                          }
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Fully Eliminated */}
      {allEliminated.length > 0 && (
        <>
          <h2 className="text-lg font-bold text-red-400">💀 Eliminated</h2>
          <div className="space-y-3">
            {allEliminated.map((player) => {
              const colors = PLAYER_COLORS[player.name];
              const globalIdx = stats.indexOf(player);
              const isClown = firstClown?.name === player.name;
              return (
                <div
                  key={player.name}
                  className={`rounded-xl border p-4 ${isClown ? 'bg-yellow-900/10 border-yellow-600/40' : 'bg-gray-950 border-gray-800'} opacity-70`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-bold text-gray-600">#{globalIdx + 1}</span>
                      <div>
                        <span className={`font-bold text-lg ${isClown ? 'text-yellow-400' : 'text-gray-500'}`}>
                          {player.name} {isClown ? '🤡' : '☠️'}
                        </span>
                        {isClown && (
                          <div className="text-xs text-yellow-500 italic">{clownMsg}</div>
                        )}
                        {!isClown && (
                          <div className="text-xs text-gray-600">
                            {player.teamCount} teams &bull; All eliminated
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-xl font-bold ${player.totalPayout > 0 ? 'text-green-400' : 'text-gray-600'}`}>
                        ${player.totalPayout}
                      </div>
                      <div className={`text-xs ${player.netProfit >= 0 ? 'text-green-500' : 'text-red-400'}`}>
                        {player.netProfit >= 0 ? '+' : ''}{player.netProfit} net
                      </div>
                    </div>
                  </div>

                  {/* All Dead Teams */}
                  <div className="flex flex-wrap gap-1.5">
                    {player.deadTeams.map(t => (
                      <span
                        key={t.team}
                        className={`text-xs px-2 py-1 rounded-full border ${
                          t.payout > 0 
                            ? 'border-green-900/40 bg-green-900/10 text-green-600' 
                            : 'border-red-900/30 bg-red-900/10 text-gray-600 line-through'
                        }`}
                      >
                        {t.payout > 0 ? '💰' : '💀'} ({t.seed}) {t.team} {t.isDog ? '🐕' : ''}
                        {t.payout > 0 
                          ? <span className="text-green-400 ml-1">${t.payout} ({roundLabel(t.team, true)})</span>
                          : <span className="text-gray-700 ml-1">${t.bid}</span>
                        }
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
