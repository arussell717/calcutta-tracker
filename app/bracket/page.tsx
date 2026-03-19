'use client';

import { useState } from 'react';
import { BRACKET, TEAMS, PLAYER_COLORS, getOwner } from '@/lib/data';
import { useTournamentData } from '@/lib/useTournament';

function TeamSlot({ seed, team, isEliminated, isTop }: { seed: number | null; team: string | null; isEliminated?: boolean; isTop?: boolean }) {
  if (!team) {
    return (
      <div className={`flex items-center gap-1 px-2 py-1 bg-gray-800/50 ${isTop ? 'rounded-t' : 'rounded-b'} border border-gray-700/30 border-dashed min-w-[180px] h-7`}>
        <span className="text-[10px] text-gray-600">TBD</span>
      </div>
    );
  }
  const owner = getOwner(team);
  const colors = owner ? PLAYER_COLORS[owner] : null;
  const entry = TEAMS.find(t => t.team === team);

  return (
    <div className={`flex items-center gap-1 px-2 py-1 ${isTop ? 'rounded-t border-b-0' : 'rounded-b'} border border-gray-600 min-w-[180px] h-7 ${isEliminated ? 'bg-red-900/10 opacity-50' : colors ? colors.bg : 'bg-gray-800/80'}`}>
      <span className="text-[10px] text-gray-500 w-4 text-right shrink-0">{seed}</span>
      <span className={`text-[11px] font-medium truncate ${isEliminated ? 'line-through text-gray-600' : colors?.text || 'text-gray-300'}`}>
        {isEliminated ? '💀 ' : ''}{team}
      </span>
      {owner && !isEliminated && (
        <span className={`ml-auto text-[9px] px-1 rounded ${colors?.badge || 'bg-gray-600'} text-white shrink-0`}>
          {owner} ${entry?.bid || 0}
        </span>
      )}
      {owner && isEliminated && (
        <span className="ml-auto text-[9px] px-1 rounded bg-gray-700 text-gray-500 shrink-0">
          {owner}
        </span>
      )}
    </div>
  );
}

function MatchupPair({ top, bottom, checkEliminated }: {
  top: { seed: number | null; team: string | null };
  bottom: { seed: number | null; team: string | null };
  checkEliminated: (name: string) => boolean;
}) {
  return (
    <div className="flex flex-col">
      <TeamSlot seed={top.seed} team={top.team} isEliminated={top.team ? checkEliminated(top.team) : false} isTop />
      <TeamSlot seed={bottom.seed} team={bottom.team} isEliminated={bottom.team ? checkEliminated(bottom.team) : false} />
    </div>
  );
}

function BracketRegion({ region, checkEliminated }: { region: string; checkEliminated: (name: string) => boolean }) {
  const matchups = BRACKET[region] || [];

  const r64 = matchups.map(m => ({
    top: { seed: m.topSeed, team: m.topTeam },
    bottom: { seed: m.bottomSeed, team: m.bottomTeam },
  }));

  const r32 = [0, 1, 2, 3].map(() => ({
    top: { seed: null as number | null, team: null as string | null },
    bottom: { seed: null as number | null, team: null as string | null },
  }));

  const s16 = [0, 1].map(() => ({
    top: { seed: null as number | null, team: null as string | null },
    bottom: { seed: null as number | null, team: null as string | null },
  }));

  const e8 = {
    top: { seed: null as number | null, team: null as string | null },
    bottom: { seed: null as number | null, team: null as string | null },
  };

  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex items-stretch gap-0 min-w-[850px]">
        {/* Round of 64 */}
        <div className="flex flex-col justify-around gap-2 pr-0">
          <div className="text-[10px] text-gray-500 text-center mb-1 font-semibold">R64</div>
          {r64.map((m, i) => (
            <MatchupPair key={i} top={m.top} bottom={m.bottom} checkEliminated={checkEliminated} />
          ))}
        </div>

        {/* Connectors R64 → R32 */}
        <div className="flex flex-col justify-around w-6 shrink-0">
          <div className="h-1 mb-1"></div>
          {[0, 1, 2, 3].map(i => (
            <div key={i} className="flex flex-col items-center justify-center flex-1">
              <div className="w-full border-t border-r border-gray-600 h-1/2 rounded-tr"></div>
              <div className="w-full border-b border-r border-gray-600 h-1/2 rounded-br"></div>
            </div>
          ))}
        </div>

        {/* Round of 32 */}
        <div className="flex flex-col justify-around gap-[52px] pr-0">
          <div className="text-[10px] text-gray-500 text-center mb-1 font-semibold">R32</div>
          {r32.map((m, i) => (
            <MatchupPair key={i} top={m.top} bottom={m.bottom} checkEliminated={checkEliminated} />
          ))}
        </div>

        {/* Connectors R32 → S16 */}
        <div className="flex flex-col justify-around w-6 shrink-0">
          <div className="h-1 mb-1"></div>
          {[0, 1].map(i => (
            <div key={i} className="flex flex-col items-center justify-center flex-1">
              <div className="w-full border-t border-r border-gray-600 h-1/2 rounded-tr"></div>
              <div className="w-full border-b border-r border-gray-600 h-1/2 rounded-br"></div>
            </div>
          ))}
        </div>

        {/* Sweet 16 */}
        <div className="flex flex-col justify-around gap-[160px] pr-0">
          <div className="text-[10px] text-gray-500 text-center mb-1 font-semibold">S16</div>
          {s16.map((m, i) => (
            <MatchupPair key={i} top={m.top} bottom={m.bottom} checkEliminated={checkEliminated} />
          ))}
        </div>

        {/* Connectors S16 → E8 */}
        <div className="flex flex-col justify-around w-6 shrink-0">
          <div className="h-1 mb-1"></div>
          <div className="flex flex-col items-center justify-center flex-1">
            <div className="w-full border-t border-r border-gray-600 h-1/2 rounded-tr"></div>
            <div className="w-full border-b border-r border-gray-600 h-1/2 rounded-br"></div>
          </div>
        </div>

        {/* Elite 8 */}
        <div className="flex flex-col justify-center pr-0">
          <div className="text-[10px] text-gray-500 text-center mb-1 font-semibold">E8</div>
          <MatchupPair top={e8.top} bottom={e8.bottom} checkEliminated={checkEliminated} />
        </div>

        {/* Arrow to Final Four */}
        <div className="flex flex-col justify-center w-8 shrink-0">
          <div className="w-full border-t border-gray-500 border-dashed relative">
            <span className="absolute -right-1 -top-1.5 text-gray-500 text-xs">&rarr;</span>
          </div>
        </div>

        {/* Region Winner */}
        <div className="flex flex-col justify-center">
          <div className="text-[10px] text-yellow-400 text-center mb-1 font-semibold">🏆</div>
          <div className="px-3 py-2 bg-yellow-900/20 border border-yellow-600/30 border-dashed rounded-lg min-w-[80px] text-center">
            <div className="text-[10px] text-yellow-400">{region}</div>
            <div className="text-[10px] text-gray-500">Champion</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BracketPage() {
  const [activeRegion, setActiveRegion] = useState('East');
  const regions = ['East', 'West', 'South', 'Midwest'];
  const { isEliminated, loading } = useTournamentData();

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold">📊 Tournament Bracket</h1>
        <p className="text-gray-400 mt-1">2026 NCAA Men&apos;s Tournament &bull; Scroll &rarr; for full bracket</p>
        {loading && <p className="text-xs text-gray-600 mt-1">Loading live data...</p>}
      </div>

      {/* Region Tabs */}
      <div className="flex gap-1 bg-gray-900 rounded-xl p-1">
        {regions.map(region => (
          <button
            key={region}
            onClick={() => setActiveRegion(region)}
            className={`flex-1 py-2 px-2 rounded-lg text-sm font-medium transition-colors ${
              activeRegion === region
                ? 'bg-orange-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            {region}
          </button>
        ))}
      </div>

      {/* Bracket Tree */}
      <div className="bg-gray-950 rounded-xl border border-gray-800 p-4">
        <h2 className="text-lg font-bold mb-3 text-center">{activeRegion} Region</h2>
        <BracketRegion region={activeRegion} checkEliminated={isEliminated} />
      </div>

      {/* Final Four */}
      <div className="bg-gray-950 rounded-xl border border-yellow-800/50 p-4">
        <h2 className="text-lg font-bold mb-3 text-center">🏆 Final Four</h2>
        <div className="flex flex-col items-center gap-3">
          <div className="flex gap-4 flex-wrap justify-center">
            <div className="bg-gray-900 border border-gray-700 border-dashed rounded-lg p-3 text-center min-w-[200px]">
              <div className="text-xs text-gray-500 mb-1">Semifinal 1</div>
              <div className="text-sm text-gray-400">East Champion</div>
              <div className="text-[10px] text-gray-600">vs</div>
              <div className="text-sm text-gray-400">West Champion</div>
            </div>
            <div className="bg-gray-900 border border-gray-700 border-dashed rounded-lg p-3 text-center min-w-[200px]">
              <div className="text-xs text-gray-500 mb-1">Semifinal 2</div>
              <div className="text-sm text-gray-400">South Champion</div>
              <div className="text-[10px] text-gray-600">vs</div>
              <div className="text-sm text-gray-400">Midwest Champion</div>
            </div>
          </div>
          <div className="text-gray-600">&darr;</div>
          <div className="bg-gray-900 border border-yellow-600/50 rounded-lg p-4 text-center min-w-[250px]">
            <div className="text-xs text-yellow-400 mb-1">🏆 National Championship</div>
            <div className="text-sm text-gray-400">TBD vs TBD</div>
            <div className="text-[10px] text-green-400 mt-1">$250 Champion &bull; $150 Runner-up</div>
          </div>
        </div>
      </div>

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
