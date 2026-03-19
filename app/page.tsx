'use client';

import { useEffect, useState } from 'react';
import { TEAMS, PLAYER_COLORS, PAYOUTS } from '@/lib/data';
import type { GameScore } from '@/lib/espn';

function getOwnerForTeam(teamName: string): string | undefined {
  const entry = TEAMS.find(t => {
    const tLower = t.team.toLowerCase();
    const nLower = teamName.toLowerCase();
    return tLower === nLower || nLower.includes(tLower) || tLower.includes(nLower);
  });
  return entry?.owner;
}

function OwnerBadge({ owner }: { owner: string | undefined }) {
  if (!owner) return null;
  const colors = PLAYER_COLORS[owner];
  if (!colors) return null;
  return (
    <span className={`${colors.badge} text-white text-xs px-1.5 py-0.5 rounded-full font-medium`}>
      {owner}
    </span>
  );
}

function GameCard({ game }: { game: GameScore }) {
  const homeOwner = getOwnerForTeam(game.homeTeam);
  const awayOwner = getOwnerForTeam(game.awayTeam);
  const isLive = game.status === 'in';
  const isFinal = game.status === 'post';

  return (
    <div className={`bg-gray-900 rounded-xl border ${isLive ? 'border-red-500/50' : 'border-gray-800'} p-4`}>
      {/* Status bar */}
      <div className="flex justify-between items-center mb-3">
        {isLive && (
          <span className="flex items-center gap-1.5 text-red-400 text-xs font-bold">
            <span className="w-2 h-2 bg-red-500 rounded-full live-pulse" />
            LIVE
          </span>
        )}
        {isFinal && <span className="text-gray-500 text-xs font-medium">FINAL</span>}
        {game.status === 'pre' && (
          <span className="text-gray-500 text-xs">
            {new Date(game.startTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
          </span>
        )}
        {game.broadcast && <span className="text-gray-600 text-xs">{game.broadcast}</span>}
      </div>

      {/* Teams */}
      <div className="space-y-2">
        {/* Away */}
        <div className={`flex items-center justify-between ${isFinal && parseInt(game.awayScore) < parseInt(game.homeScore) ? 'opacity-50' : ''}`}>
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <span className="text-gray-500 text-xs w-4 text-right">{game.awaySeed}</span>
            <span className="font-semibold text-sm truncate">{game.awayTeam}</span>
            <OwnerBadge owner={awayOwner} />
          </div>
          <span className={`font-bold text-lg tabular-nums ${isLive ? 'text-white' : 'text-gray-300'}`}>
            {game.status !== 'pre' ? game.awayScore : ''}
          </span>
        </div>

        {/* Home */}
        <div className={`flex items-center justify-between ${isFinal && parseInt(game.homeScore) < parseInt(game.awayScore) ? 'opacity-50' : ''}`}>
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <span className="text-gray-500 text-xs w-4 text-right">{game.homeSeed}</span>
            <span className="font-semibold text-sm truncate">{game.homeTeam}</span>
            <OwnerBadge owner={homeOwner} />
          </div>
          <span className={`font-bold text-lg tabular-nums ${isLive ? 'text-white' : 'text-gray-300'}`}>
            {game.status !== 'pre' ? game.homeScore : ''}
          </span>
        </div>
      </div>

      {/* Clock */}
      {isLive && (
        <div className="mt-2 text-center text-xs text-gray-400">
          {game.statusDetail}
        </div>
      )}
    </div>
  );
}

export default function HomePage() {
  const [games, setGames] = useState<GameScore[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/scores');
        const data = await res.json();
        setGames(data);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    load();
    const interval = setInterval(load, 60000);
    return () => clearInterval(interval);
  }, []);

  const liveGames = games.filter(g => g.status === 'in');
  const recentGames = games.filter(g => g.status === 'post');
  const upcomingGames = games.filter(g => g.status === 'pre');

  // Check which games involve our teams
  const ourTeamNames = TEAMS.map(t => t.team.toLowerCase());
  const relevantGames = games.filter(g =>
    ourTeamNames.some(t => g.homeTeam.toLowerCase().includes(t) || g.awayTeam.toLowerCase().includes(t) || t.includes(g.homeTeam.toLowerCase()) || t.includes(g.awayTeam.toLowerCase()))
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold">🏀 2026 Calcutta Tracker</h1>
        <p className="text-gray-400 mt-1">$1,000 Pot &bull; 10 Players &bull; 64 Teams</p>
        <div className="flex flex-wrap justify-center gap-2 mt-3">
          {Object.entries(PAYOUTS).map(([round, amount]) => (
            <span key={round} className="text-xs bg-gray-800 px-2 py-1 rounded-full text-gray-300">
              {round}: ${amount}
            </span>
          ))}
        </div>
      </div>

      {loading && (
        <div className="text-center py-12 text-gray-500">Loading scores...</div>
      )}

      {/* Live Games */}
      {liveGames.length > 0 && (
        <section>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span className="w-3 h-3 bg-red-500 rounded-full live-pulse" />
            Live Now
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {liveGames.map(g => <GameCard key={g.id} game={g} />)}
          </div>
        </section>
      )}

      {/* Our Games (Calcutta relevant) */}
      {relevantGames.length > 0 && relevantGames.length !== games.length && (
        <section>
          <h2 className="text-xl font-bold mb-4">🎯 Our Games</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {relevantGames.map(g => <GameCard key={g.id} game={g} />)}
          </div>
        </section>
      )}

      {/* Recent Results */}
      {recentGames.length > 0 && (
        <section>
          <h2 className="text-xl font-bold mb-4">🏁 Recent Results</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentGames.map(g => <GameCard key={g.id} game={g} />)}
          </div>
        </section>
      )}

      {/* Upcoming */}
      {upcomingGames.length > 0 && (
        <section>
          <h2 className="text-xl font-bold mb-4">⏰ Coming Up</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingGames.map(g => <GameCard key={g.id} game={g} />)}
          </div>
        </section>
      )}

      {!loading && games.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">No games today</p>
          <p className="text-gray-500 text-sm mt-1">Check back on game days for live scores!</p>
        </div>
      )}
    </div>
  );
}
