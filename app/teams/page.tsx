'use client';

import { useState } from 'react';
import { TEAMS, PLAYERS, PLAYER_COLORS, BRACKET } from '@/lib/data';

export default function TeamsPage() {
  const [filter, setFilter] = useState<string>('all');

  const filteredTeams = filter === 'all'
    ? TEAMS
    : TEAMS.filter(t => t.owner === filter);

  const regions = Array.from(new Set(filteredTeams.map(t => t.region)));
  const uniqueOwners = Array.from(new Set(TEAMS.map(t => t.owner).filter(Boolean)));

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">📋 Teams</h1>
        <p className="text-gray-400 mt-1">All 64 teams and their owners</p>
      </div>

      {/* Filter buttons */}
      <div className="flex flex-wrap gap-2 justify-center">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            filter === 'all' ? 'bg-white text-black' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          All
        </button>
        {uniqueOwners.map(owner => {
          const colors = PLAYER_COLORS[owner];
          return (
            <button
              key={owner}
              onClick={() => setFilter(owner)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filter === owner
                  ? `${colors?.badge || 'bg-gray-600'} text-white`
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {owner}
            </button>
          );
        })}
      </div>

      {/* Teams by Region */}
      {(['East', 'West', 'South', 'Midwest'] as const).map(region => {
        const regionTeams = filteredTeams.filter(t => t.region === region).sort((a, b) => a.seed - b.seed);
        if (regionTeams.length === 0) return null;

        return (
          <div key={region} className="bg-gray-900 rounded-xl border border-gray-800 p-4">
            <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
              {region === 'East' && '🌊'}
              {region === 'West' && '🌅'}
              {region === 'South' && '☀️'}
              {region === 'Midwest' && '🌾'}
              {region} Region
            </h2>
            <div className="space-y-2">
              {regionTeams.map(team => {
                const colors = PLAYER_COLORS[team.owner];
                return (
                  <div
                    key={`${team.team}-${team.region}`}
                    className={`flex items-center justify-between p-2 rounded-lg ${colors?.bg || 'bg-gray-800'}`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 text-sm w-6 text-right">({team.seed})</span>
                      <span className="font-medium text-sm">{team.team}</span>
                      {team.isDog && <span className="text-xs">🐕</span>}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 text-xs">${team.bid}</span>
                      <span className={`${colors?.badge || 'bg-gray-600'} text-white text-xs px-2 py-0.5 rounded-full`}>
                        {team.owner}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Bracket matchups reference */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
        <h2 className="text-lg font-bold mb-3">📊 Round of 64 Matchups</h2>
        {(['East', 'West', 'South', 'Midwest'] as const).map(region => (
          <div key={region} className="mb-4 last:mb-0">
            <h3 className="text-sm font-semibold text-gray-400 mb-2">{region}</h3>
            <div className="space-y-1">
              {(BRACKET[region] || []).map((m, i) => {
                const topOwner = TEAMS.find(t => t.team === m.topTeam)?.owner;
                const bottomOwner = TEAMS.find(t => t.team === m.bottomTeam)?.owner;
                const topColors = topOwner ? PLAYER_COLORS[topOwner] : null;
                const bottomColors = bottomOwner ? PLAYER_COLORS[bottomOwner] : null;

                return (
                  <div key={i} className="flex items-center gap-2 text-sm py-1 border-b border-gray-800 last:border-0">
                    <div className="flex-1 flex items-center gap-1 justify-end text-right">
                      {topOwner && (
                        <span className={`${topColors?.badge} text-white text-xs px-1 py-0.5 rounded`}>{topOwner}</span>
                      )}
                      <span className="font-medium">({m.topSeed}) {m.topTeam}</span>
                    </div>
                    <span className="text-gray-600 text-xs">vs</span>
                    <div className="flex-1 flex items-center gap-1">
                      <span className="font-medium">({m.bottomSeed}) {m.bottomTeam}</span>
                      {bottomOwner && (
                        <span className={`${bottomColors?.badge} text-white text-xs px-1 py-0.5 rounded`}>{bottomOwner}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        <div className="mt-3 text-xs text-gray-500 text-center">
          Final Four: East vs West &bull; South vs Midwest
        </div>
      </div>
    </div>
  );
}
