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

  // Generate a personalized troll/commentary message for each player
  function getTrollMessage(player: PlayerStats, rank: number, totalPlayers: number, isFirstOut: boolean): string {
    const { name, totalPayout, netProfit, teamsAlive, aliveTeams, deadTeams, totalBid } = player;
    
    // Find their most expensive team
    const allTeams = [...aliveTeams, ...deadTeams];
    const mostExpensive = allTeams.reduce((max, t) => t.bid > max.bid ? t : max, allTeams[0]);
    const cheapestAlive = aliveTeams.length > 0 
      ? aliveTeams.reduce((min, t) => t.bid < min.bid ? t : min, aliveTeams[0])
      : null;
    const biggestBust = deadTeams.filter(t => t.payout === 0).reduce((max, t) => t.bid > (max?.bid || 0) ? t : max, null as TeamWithStatus | null);
    const bestValue = allTeams.filter(t => t.payout > 0).reduce((best, t) => {
      const roi = t.payout / Math.max(t.bid, 1);
      const bestRoi = (best?.payout || 0) / Math.max(best?.bid || 1, 1);
      return roi > bestRoi ? t : best;
    }, null as TeamWithStatus | null);
    const dogWins = allTeams.filter(t => t.isDog && t.wins > 0);
    
    // First person fully eliminated
    if (isFirstOut) {
      if (mostExpensive && mostExpensive.eliminated && mostExpensive.payout === 0) {
        return `Dropped $${mostExpensive.bid} on ${mostExpensive.team} and they couldn't even win a game. First one out. 🤡`;
      }
      if (netProfit <= -80) {
        return `$${totalBid} in, $${totalPayout} out. That's not a bracket, that's a charity donation. 🤡`;
      }
      return `First one eliminated. Everyone else: you're welcome for the free money. 🤡`;
    }

    // Fully eliminated (not first)
    if (teamsAlive === 0 && deadTeams.length > 0) {
      if (totalPayout === 0) {
        return `$${totalBid} spent, $0 earned. Not a single team made the Sweet 16. Incredible. ☠️`;
      }
      if (netProfit < 0) {
        return `Made some noise with ${bestValue ? bestValue.team : 'a team'} but still down $${Math.abs(netProfit)} overall. Tough scene. ☠️`;
      }
      if (netProfit >= 0) {
        return `All teams dead but still turned a profit. Respect the hustle. 💀💰`;
      }
    }

    // Still alive — roasts and props
    // Leading the board
    if (rank === 0 && totalPayout > 0) {
      if (bestValue && bestValue.bid <= 10) {
        return `${bestValue.team} for $${bestValue.bid} is highway robbery. Currently printing money. 🏧`;
      }
      return `Sitting pretty at the top. Don't get comfortable. 👑`;
    }

    // Big spender with nothing to show
    if (totalBid >= 80 && totalPayout === 0 && teamsAlive > 0) {
      return `Spent $${totalBid} and hasn't earned a penny yet. Those teams better start winning. 😬`;
    }

    // Big spender whose expensive team busted
    if (biggestBust && biggestBust.bid >= 40) {
      if (teamsAlive > 0) {
        return `$${biggestBust.bid} on ${biggestBust.team}? Gone in the ${biggestBust.wins === 0 ? 'first round' : 'Round of 32'}. Carrying on with the scraps. 💸`;
      }
    }

    // Has a dog team still alive
    if (dogWins.length > 0) {
      const bestDog = dogWins.reduce((b, t) => t.wins > b.wins ? t : b, dogWins[0]);
      return `Shoutout to the ${bestDog.team} dogs still fighting. The $${bestDog.bid} special is doing work. 🐕🔥`;
    }

    // Amazing value pick
    if (bestValue && bestValue.bid <= 5 && bestValue.payout >= 25) {
      return `${bestValue.team} for $${bestValue.bid} returning $${bestValue.payout}?? That's a ${Math.round(bestValue.payout / Math.max(bestValue.bid, 1))}x return. Filthy. 📈`;
    }

    // Has a single expensive team carrying everything
    if (teamsAlive === 1 && aliveTeams[0].bid >= 30) {
      return `Down to one horse: ${aliveTeams[0].team} ($${aliveTeams[0].bid}). Ride or die. 🐎`;
    }

    // Has lots of alive teams
    if (teamsAlive >= 4) {
      return `${teamsAlive} teams still alive. Quantity over quality? We'll see. 🤷`;
    }

    // Profitable
    if (netProfit > 50) {
      return `Up $${netProfit} and still has teams playing. Having a tournament. 🔥`;
    }

    if (netProfit > 0) {
      return `In the green. Not flashy, but getting the job done. 📊`;
    }

    // Losing money but alive
    if (netProfit < -50 && teamsAlive > 0) {
      return `Down $${Math.abs(netProfit)} but still breathing. Need a miracle run. 🙏`;
    }

    // Default  
    if (teamsAlive > 0) {
      return `Still in it. ${teamsAlive} team${teamsAlive === 1 ? '' : 's'} left standing. 🏀`;
    }

    return `It is what it is. 🤷`;
  }

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
              const trollMsg = getTrollMessage(player, globalIdx, stats.length, false);
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
                        <div className="text-xs text-gray-400 italic mt-0.5">{trollMsg}</div>
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
              const trollMsg = getTrollMessage(player, globalIdx, stats.length, isClown);
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
                          <div className="text-xs text-yellow-500 italic">{trollMsg}</div>
                        )}
                        {!isClown && (
                          <div className="text-xs text-gray-500 italic">{trollMsg}</div>
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
