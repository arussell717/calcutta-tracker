'use client';

import { useState, useEffect } from 'react';
import { TEAMS } from '@/lib/data';
import { normalizeTeamName } from '@/lib/espn';

interface GameResult {
  winner: string;
  loser: string;
  winnerScore: string;
  loserScore: string;
}

interface TournamentData {
  eliminated: string[];
  winners: string[];
  gameResults: GameResult[];
}

// Strict match a team name against our data (no fuzzy includes!)
function matchTeam(espnName: string): string | null {
  const normalized = normalizeTeamName(espnName);
  
  // Exact match
  const direct = TEAMS.find(t => t.team === normalized);
  if (direct) return direct.team;

  // Case-insensitive exact match
  const ciExact = TEAMS.find(t => t.team.toLowerCase() === normalized.toLowerCase());
  if (ciExact) return ciExact.team;

  // Case-insensitive exact match on original ESPN name
  const ciOrig = TEAMS.find(t => t.team.toLowerCase() === espnName.toLowerCase());
  if (ciOrig) return ciOrig.team;

  return null;
}

export function useTournamentData() {
  const [eliminated, setEliminated] = useState<Set<string>>(new Set());
  const [winners, setWinners] = useState<Set<string>>(new Set());
  const [matchResults, setMatchResults] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/tournament');
        const data: TournamentData = await res.json();

        const elimSet = new Set<string>();
        for (const name of data.eliminated) {
          const matched = matchTeam(name);
          if (matched) elimSet.add(matched);
        }

        const winSet = new Set<string>();
        for (const name of data.winners) {
          const matched = matchTeam(name);
          if (matched) winSet.add(matched);
        }

        // Build a map: for each game, record loser -> winner
        // This tells us "who beat whom" so we can determine bracket advancement
        const results = new Map<string, string>();
        for (const gr of data.gameResults) {
          const winner = matchTeam(gr.winner);
          const loser = matchTeam(gr.loser);
          if (winner && loser) {
            results.set(loser, winner);
          }
        }

        setEliminated(elimSet);
        setWinners(winSet);
        setMatchResults(results);
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    }

    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  function isEliminated(teamName: string): boolean {
    return eliminated.has(teamName);
  }

  function isWinner(teamName: string): boolean {
    return winners.has(teamName);
  }

  // Given two teams in a bracket matchup, determine the winner
  // Uses game results to find who beat whom
  function getMatchupWinner(team1: string | null, team2: string | null): string | null {
    if (!team1 || !team2) return null;
    
    // Check if team1 beat team2 (team2's "beaten by" = team1)
    if (matchResults.get(team2) === team1) return team1;
    // Check if team2 beat team1
    if (matchResults.get(team1) === team2) return team2;
    
    // Fallback: if one is eliminated and the other isn't
    const t1Dead = eliminated.has(team1);
    const t2Dead = eliminated.has(team2);
    if (t1Dead && !t2Dead) return team2;
    if (t2Dead && !t1Dead) return team1;
    
    return null;
  }

  // Count wins per team (how many times a team appears as winner in game results)
  function getTeamWins(teamName: string): number {
    let wins = 0;
    matchResults.forEach((winner) => {
      if (winner === teamName) wins++;
    });
    return wins;
  }

  // Determine the furthest round each team has reached using the BRACKET structure.
  // This is immune to First Four / play-in extra wins because it traces through the bracket tree.
  // Returns: 'R64' | 'R32' | 'S16' | 'E8' | 'FF' | 'CHAMP_GAME' | 'CHAMPION'
  function getTeamRound(teamName: string, bracket: Record<string, Array<{ topTeam: string; bottomTeam: string }>>): string {
    for (const region of ['East', 'West', 'South', 'Midwest']) {
      const matchups = bracket[region] || [];
      const r64 = matchups.map(m => ({
        top: m.topTeam,
        bottom: m.bottomTeam,
      }));

      // Check if team is in this region's R64
      const inRegion = r64.some(m => m.top === teamName || m.bottom === teamName);
      if (!inRegion) continue;

      // Trace through bracket rounds
      // R32 matchups (winners of adjacent R64 pairs)
      const r32: Array<{ top: string | null; bottom: string | null }> = [];
      for (let i = 0; i < 8; i += 2) {
        const w1 = getMatchupWinner(r64[i].top, r64[i].bottom);
        const w2 = getMatchupWinner(r64[i + 1].top, r64[i + 1].bottom);
        r32.push({ top: w1, bottom: w2 });
      }

      // S16 matchups
      const s16: Array<{ top: string | null; bottom: string | null }> = [];
      for (let i = 0; i < 4; i += 2) {
        const w1 = getMatchupWinner(r32[i].top, r32[i].bottom);
        const w2 = getMatchupWinner(r32[i + 1].top, r32[i + 1].bottom);
        s16.push({ top: w1, bottom: w2 });
      }

      // E8
      const e8top = getMatchupWinner(s16[0]?.top ?? null, s16[0]?.bottom ?? null);
      const e8bot = getMatchupWinner(s16[1]?.top ?? null, s16[1]?.bottom ?? null);

      // Region champion
      const regionChamp = getMatchupWinner(e8top, e8bot);

      // Now determine furthest round for our team
      if (regionChamp === teamName) return 'FF'; // At least Final Four (region champ)

      if (e8top === teamName || e8bot === teamName) return 'E8';

      const inS16 = s16.some(m => m.top === teamName || m.bottom === teamName);
      if (inS16) return 'S16';

      const inR32 = r32.some(m => m.top === teamName || m.bottom === teamName);
      if (inR32) return 'R32';

      return 'R64'; // Still in R64 or lost in R64
    }

    return 'R64'; // Default (team not found in bracket — e.g., dog teams)
  }

  // Get payout for a team based on bracket round reached (not raw wins)
  // This correctly handles First Four teams
  function getTeamPayout(teamName: string, bracket: Record<string, Array<{ topTeam: string; bottomTeam: string }>>): number {
    const round = getTeamRound(teamName, bracket);
    // Payouts are non-cumulative: you get the payout for the round you're eliminated in
    switch (round) {
      case 'CHAMPION': return 250;
      case 'CHAMP_GAME': return 150; // Runner-up
      case 'FF': return 100;
      case 'E8': return 50;
      case 'S16': return 25;
      default: return 0;
    }
  }

  return { eliminated, winners, isEliminated, isWinner, getMatchupWinner, matchResults, getTeamWins, getTeamPayout, getTeamRound, loading };
}
