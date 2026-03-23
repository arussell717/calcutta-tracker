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

  return { eliminated, winners, isEliminated, isWinner, getMatchupWinner, matchResults, loading };
}
