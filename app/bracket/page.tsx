'use client';

import { useState, useEffect, useCallback } from 'react';
import { BRACKET, TEAMS, PLAYER_COLORS, getOwner } from '@/lib/data';

interface GameResult {
  team1: string;
  team1Score: number;
  team2: string;
  team2Score: number;
  status: string; // 'pre', 'in', 'post'
  winner?: string;
  statusDetail?: string;
}

function getOwnerBadge(teamName: string) {
  const owner = getOwner(teamName);
  if (!owner) return null;
  const colors = PLAYER_COLORS[owner];
  const entry = TEAMS.find(t => t.team === teamName);
  return (
    <span className={`ml-1 text-[10px] px-1.5 py-0.5 rounded ${colors?.badge || 'bg-gray-600'} text-white font-medium`}>
      {owner} {entry ? `$${entry.bid}` : ''}
    </span>
  );
}

function TeamLine({ seed, team, isWinner, isLoser }: { seed: number; team: string; isWinner: boolean; isLoser: boolean }) {
  const owner = getOwner(team);
  const colors = owner ? PLAYER_COLORS[owner] : null;

  return (
    <div className={`flex items-center gap-1.5 px-2 py-1.5 text-xs ${isLoser ? 'opacity-40 line-through' : ''} ${isWinner ? 'font-bold' : ''}`}>
      <span className="text-gray-500 w-4 text-right shrink-0">({seed})</span>
      <span className={`truncate ${colors?.text || 'text-gray-300'}`}>{team}</span>
      {isWinner && <span className="text-green-400">✓</span>}
      {getOwnerBadge(team)}
    </div>
  );
}

function MatchupCard({ topSeed, topTeam, bottomSeed, bottomTeam, result }: {
  topSeed: number;
  topTeam: string;
  bottomSeed: number;
  bottomTeam: string;
  result?: GameResult;
}) {
  const topWin = result?.winner === topTeam;
  const bottomWin = result?.winner === bottomTeam;
  const topLose = result?.status === 'post' && !topWin;
  const bottomLose = result?.status === 'post' && !bottomWin;

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg overflow-hidden min-w-[220px]">
      <div className={`border-b border-gray-800 ${topWin ? 'bg-green-900/20' : ''}`}>
        <TeamLine seed={topSeed} team={topTeam} isWinner={topWin} isLoser={topLose} />
      </div>
      <div className={`${bottomWin ? 'bg-green-900/20' : ''}`}>
        <TeamLine seed={bottomSeed} team={bottomTeam} isWinner={bottomWin} isLoser={bottomLose} />
      </div>
      {result && result.status !== 'pre' && (
        <div className="text-[10px] text-center py-0.5 bg-gray-800/50 text-gray-500">
          {result.status === 'in' ? (
            <span className="text-red-400">🔴 {result.team1Score} - {result.team2Score} {result.statusDetail || 'LIVE'}</span>
          ) : (
            <span>{result.team1Score} - {result.team2Score} FINAL</span>
          )}
        </div>
      )}
    </div>
  );
}

export default function BracketPage() {
  const [activeRegion, setActiveRegion] = useState('East');
  const regions = ['East', 'West', 'South', 'Midwest'];

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold">🏀 Tournament Bracket</h1>
        <p className="text-gray-400 mt-1">2026 NCAA Men&apos;s Tournament</p>
      </div>

      {/* Region Tabs */}
      <div className="flex gap-1 bg-gray-900 rounded-xl p-1">
        {regions.map(region => (
          <button
            key={region}
            onClick={() => setActiveRegion(region)}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
              activeRegion === region
                ? 'bg-orange-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            {region}
          </button>
        ))}
      </div>

      {/* Final Four Tab */}
      <div className="flex gap-1">
        <button
          onClick={() => setActiveRegion('Final Four')}
          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
            activeRegion === 'Final Four'
              ? 'bg-yellow-600 text-white'
              : 'bg-gray-900 text-gray-400 hover:text-white hover:bg-gray-800'
          }`}
        >
          🏆 Final Four
        </button>
      </div>

      {/* Bracket Display */}
      {activeRegion !== 'Final Four' ? (
        <div className="space-y-6">
          {/* Round of 64 */}
          <div>
            <h3 className="text-sm font-semibold text-gray-400 mb-2">Round of 64 — {activeRegion} Region</h3>
            <div className="space-y-2">
              {(BRACKET[activeRegion] || []).map((matchup, i) => (
                <MatchupCard
                  key={i}
                  topSeed={matchup.topSeed}
                  topTeam={matchup.topTeam}
                  bottomSeed={matchup.bottomSeed}
                  bottomTeam={matchup.bottomTeam}
                />
              ))}
            </div>
          </div>

          {/* Round of 32 placeholders */}
          <div>
            <h3 className="text-sm font-semibold text-gray-400 mb-2">Round of 32</h3>
            <div className="space-y-2">
              {[0, 1, 2, 3].map(i => {
                const matchups = BRACKET[activeRegion] || [];
                const m1 = matchups[i * 2];
                const m2 = matchups[i * 2 + 1];
                return (
                  <div key={i} className="bg-gray-900 border border-gray-700/50 border-dashed rounded-lg overflow-hidden min-w-[220px]">
                    <div className="px-2 py-1.5 text-xs text-gray-500 border-b border-gray-800">
                      Winner: ({m1?.topSeed}){m1?.topTeam} / ({m1?.bottomSeed}){m1?.bottomTeam}
                    </div>
                    <div className="px-2 py-1.5 text-xs text-gray-500">
                      Winner: ({m2?.topSeed}){m2?.topTeam} / ({m2?.bottomSeed}){m2?.bottomTeam}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sweet 16 placeholders */}
          <div>
            <h3 className="text-sm font-semibold text-gray-400 mb-2">Sweet 16</h3>
            <div className="space-y-2">
              {[0, 1].map(i => (
                <div key={i} className="bg-gray-900 border border-gray-700/50 border-dashed rounded-lg p-3 text-xs text-gray-500 text-center">
                  TBD vs TBD
                </div>
              ))}
            </div>
          </div>

          {/* Elite 8 */}
          <div>
            <h3 className="text-sm font-semibold text-gray-400 mb-2">Elite 8 — {activeRegion} Champion</h3>
            <div className="bg-gray-900 border border-yellow-700/50 border-dashed rounded-lg p-3 text-xs text-gray-500 text-center">
              TBD vs TBD → {activeRegion} Champion
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Final Four */}
          <div>
            <h3 className="text-sm font-semibold text-gray-400 mb-2">🏆 Final Four</h3>
            <div className="space-y-2">
              <div className="bg-gray-900 border border-yellow-700/50 border-dashed rounded-lg p-3 text-xs text-gray-500 text-center">
                East Champion vs West Champion
              </div>
              <div className="bg-gray-900 border border-yellow-700/50 border-dashed rounded-lg p-3 text-xs text-gray-500 text-center">
                South Champion vs Midwest Champion
              </div>
            </div>
          </div>

          {/* Championship */}
          <div>
            <h3 className="text-sm font-semibold text-gray-400 mb-2">🏆 National Championship</h3>
            <div className="bg-gray-900 border border-yellow-500/50 border-dashed rounded-lg p-4 text-center">
              <div className="text-gray-500 text-sm">TBD vs TBD</div>
              <div className="text-yellow-400 text-xs mt-1">$250 Champion &bull; $150 Runner-up</div>
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-3">
        <h3 className="text-xs font-semibold text-gray-400 mb-2">Owners</h3>
        <div className="flex flex-wrap gap-1.5">
          {Object.entries(PLAYER_COLORS).map(([name, colors]) => (
            <span key={name} className={`text-[10px] px-2 py-0.5 rounded ${colors.badge} text-white`}>
              {name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
