'use client';

import { useState } from 'react';
import { BRACKET, TEAMS, PLAYER_COLORS, getOwner } from '@/lib/data';
import { useTournamentData } from '@/lib/useTournament';

interface SlotData {
  seed: number | null;
  team: string | null;
}

function TeamSlot({ seed, team, eliminated, isTop }: { seed: number | null; team: string | null; eliminated: boolean; isTop?: boolean }) {
  if (!team) {
    return (
      <div className={`flex items-center gap-1 px-2 py-1.5 bg-gray-800/50 ${isTop ? 'rounded-t' : 'rounded-b'} border border-gray-700/30 border-dashed min-w-[190px] h-8`}>
        <span className="text-[10px] text-gray-600 italic">TBD</span>
      </div>
    );
  }
  const owner = getOwner(team);
  const colors = owner ? PLAYER_COLORS[owner] : null;
  const entry = TEAMS.find(t => t.team === team);

  return (
    <div className={`flex items-center gap-1 px-2 py-1.5 ${isTop ? 'rounded-t border-b-0' : 'rounded-b'} border min-w-[190px] h-8 ${
      eliminated 
        ? 'border-red-900/30 bg-red-900/10 opacity-50' 
        : `border-gray-600 ${colors ? colors.bg : 'bg-gray-800/80'}`
    }`}>
      <span className="text-[10px] text-gray-500 w-5 text-right shrink-0">({seed})</span>
      <span className={`text-[11px] font-medium truncate ${eliminated ? 'line-through text-gray-600' : colors?.text || 'text-gray-300'}`}>
        {eliminated ? '💀 ' : ''}{team}
      </span>
      {owner && (
        <span className={`ml-auto text-[9px] px-1 rounded ${eliminated ? 'bg-gray-700 text-gray-500' : colors?.badge || 'bg-gray-600'} text-white shrink-0`}>
          {owner} ${entry?.bid || 0}
        </span>
      )}
    </div>
  );
}

function MatchupPair({ top, bottom, getMatchupWinner }: {
  top: SlotData;
  bottom: SlotData;
  getMatchupWinner: (a: string | null, b: string | null) => string | null;
}) {
  // Determine if there's a winner of THIS specific matchup
  const winner = getMatchupWinner(top.team, bottom.team);
  // Only cross out the loser of THIS matchup, not globally eliminated teams
  const topLost = winner !== null && top.team !== null && winner !== top.team;
  const bottomLost = winner !== null && bottom.team !== null && winner !== bottom.team;

  return (
    <div className="flex flex-col">
      <TeamSlot seed={top.seed} team={top.team} eliminated={topLost} isTop />
      <TeamSlot seed={bottom.seed} team={bottom.team} eliminated={bottomLost} />
    </div>
  );
}

function findSlotData(teamName: string | null): SlotData {
  if (!teamName) return { seed: null, team: null };
  const entry = TEAMS.find(t => t.team === teamName);
  return { seed: entry?.seed || null, team: teamName };
}

function BracketRegion({ region, getMatchupWinner }: { region: string; getMatchupWinner: (a: string | null, b: string | null) => string | null }) {
  const matchups = BRACKET[region] || [];

  // R64: 8 matchups from data
  const r64: Array<{ top: SlotData; bottom: SlotData }> = matchups.map(m => ({
    top: { seed: m.topSeed, team: m.topTeam },
    bottom: { seed: m.bottomSeed, team: m.bottomTeam },
  }));

  // R32: winners of adjacent R64 pairs
  const r32: Array<{ top: SlotData; bottom: SlotData }> = [];
  for (let i = 0; i < 8; i += 2) {
    const w1 = getMatchupWinner(r64[i].top.team, r64[i].bottom.team);
    const w2 = getMatchupWinner(r64[i + 1].top.team, r64[i + 1].bottom.team);
    r32.push({ top: findSlotData(w1), bottom: findSlotData(w2) });
  }

  // S16: winners of adjacent R32 pairs
  const s16: Array<{ top: SlotData; bottom: SlotData }> = [];
  for (let i = 0; i < 4; i += 2) {
    const w1 = getMatchupWinner(r32[i].top.team, r32[i].bottom.team);
    const w2 = getMatchupWinner(r32[i + 1].top.team, r32[i + 1].bottom.team);
    s16.push({ top: findSlotData(w1), bottom: findSlotData(w2) });
  }

  // E8: winner of S16
  const e8 = {
    top: findSlotData(getMatchupWinner(s16[0]?.top.team, s16[0]?.bottom.team)),
    bottom: findSlotData(getMatchupWinner(s16[1]?.top.team, s16[1]?.bottom.team)),
  };

  // Region champion
  const champion = findSlotData(getMatchupWinner(e8.top.team, e8.bottom.team));

  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex items-stretch gap-0 min-w-[900px]">
        {/* Round of 64 */}
        <div className="flex flex-col justify-around gap-1.5 shrink-0">
          <div className="text-[10px] text-gray-500 text-center mb-1 font-semibold">Round of 64</div>
          {r64.map((m, i) => (
            <MatchupPair key={i} top={m.top} bottom={m.bottom} getMatchupWinner={getMatchupWinner} />
          ))}
        </div>

        {/* Connectors R64 → R32 */}
        <div className="flex flex-col justify-around w-5 shrink-0">
          <div className="h-4"></div>
          {[0, 1, 2, 3].map(i => (
            <div key={i} className="flex flex-col items-center justify-center flex-1">
              <div className="w-full border-t border-r border-gray-600/60 h-1/2 rounded-tr-sm"></div>
              <div className="w-full border-b border-r border-gray-600/60 h-1/2 rounded-br-sm"></div>
            </div>
          ))}
        </div>

        {/* Round of 32 */}
        <div className="flex flex-col justify-around gap-[36px] shrink-0">
          <div className="text-[10px] text-gray-500 text-center mb-1 font-semibold">Round of 32</div>
          {r32.map((m, i) => (
            <MatchupPair key={i} top={m.top} bottom={m.bottom} getMatchupWinner={getMatchupWinner} />
          ))}
        </div>

        {/* Connectors R32 → S16 */}
        <div className="flex flex-col justify-around w-5 shrink-0">
          <div className="h-4"></div>
          {[0, 1].map(i => (
            <div key={i} className="flex flex-col items-center justify-center flex-1">
              <div className="w-full border-t border-r border-gray-600/60 h-1/2 rounded-tr-sm"></div>
              <div className="w-full border-b border-r border-gray-600/60 h-1/2 rounded-br-sm"></div>
            </div>
          ))}
        </div>

        {/* Sweet 16 */}
        <div className="flex flex-col justify-around gap-[120px] shrink-0">
          <div className="text-[10px] text-gray-500 text-center mb-1 font-semibold">Sweet 16</div>
          {s16.map((m, i) => (
            <MatchupPair key={i} top={m.top} bottom={m.bottom} getMatchupWinner={getMatchupWinner} />
          ))}
        </div>

        {/* Connectors S16 → E8 */}
        <div className="flex flex-col justify-around w-5 shrink-0">
          <div className="h-4"></div>
          <div className="flex flex-col items-center justify-center flex-1">
            <div className="w-full border-t border-r border-gray-600/60 h-1/2 rounded-tr-sm"></div>
            <div className="w-full border-b border-r border-gray-600/60 h-1/2 rounded-br-sm"></div>
          </div>
        </div>

        {/* Elite 8 */}
        <div className="flex flex-col justify-center shrink-0">
          <div className="text-[10px] text-gray-500 text-center mb-1 font-semibold">Elite 8</div>
          <MatchupPair top={e8.top} bottom={e8.bottom} getMatchupWinner={getMatchupWinner} />
        </div>

        {/* Arrow */}
        <div className="flex flex-col justify-center w-6 shrink-0">
          <div className="text-gray-500 text-center text-lg">&rarr;</div>
        </div>

        {/* Region Winner */}
        <div className="flex flex-col justify-center shrink-0">
          <div className="text-[10px] text-yellow-400 text-center mb-1 font-semibold">🏆 Champion</div>
          {champion.team ? (
            <div className="px-2 py-2 bg-yellow-900/20 border border-yellow-600/40 rounded-lg min-w-[120px]">
              <TeamSlot seed={champion.seed} team={champion.team} eliminated={false} />
            </div>
          ) : (
            <div className="px-3 py-3 bg-yellow-900/10 border border-yellow-600/20 border-dashed rounded-lg min-w-[100px] text-center">
              <div className="text-[10px] text-yellow-500">{region}</div>
              <div className="text-[10px] text-gray-500">TBD</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function BracketPage() {
  const [activeRegion, setActiveRegion] = useState('East');
  const regions = ['East', 'West', 'South', 'Midwest'];
  const { getMatchupWinner, loading } = useTournamentData();

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold">📊 Tournament Bracket</h1>
        <p className="text-gray-400 mt-1">Scroll &rarr; for full bracket &bull; Updates live every 60s</p>
        {loading && <p className="text-xs text-yellow-500 mt-1 animate-pulse">Loading live data...</p>}
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
        <BracketRegion region={activeRegion} getMatchupWinner={getMatchupWinner} />
      </div>

      {/* Final Four */}
      <div className="bg-gray-950 rounded-xl border border-yellow-800/50 p-4">
        <h2 className="text-lg font-bold mb-3 text-center">🏆 Final Four &amp; Championship</h2>
        <div className="flex flex-col items-center gap-3">
          <div className="flex gap-4 flex-wrap justify-center">
            <div className="bg-gray-900 border border-gray-700 border-dashed rounded-lg p-3 text-center min-w-[200px]">
              <div className="text-xs text-gray-500 mb-1">Semifinal 1</div>
              <div className="text-sm text-gray-400">East Champion</div>
              <div className="text-[10px] text-gray-600 my-0.5">vs</div>
              <div className="text-sm text-gray-400">West Champion</div>
            </div>
            <div className="bg-gray-900 border border-gray-700 border-dashed rounded-lg p-3 text-center min-w-[200px]">
              <div className="text-xs text-gray-500 mb-1">Semifinal 2</div>
              <div className="text-sm text-gray-400">South Champion</div>
              <div className="text-[10px] text-gray-600 my-0.5">vs</div>
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
