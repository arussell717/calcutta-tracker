'use client';

import { useState, useEffect } from 'react';
import { TEAMS } from '@/lib/data';
import { normalizeTeamName } from '@/lib/espn';

interface TournamentData {
  eliminated: string[];
  winners: string[];
  gameResults: Array<{ winner: string; loser: string; winnerScore: string; loserScore: string }>;
}

// Fuzzy match a team name against our data
function matchTeam(espnName: string): string | null {
  const normalized = normalizeTeamName(espnName);
  const direct = TEAMS.find(t => t.team === normalized);
  if (direct) return direct.team;

  // Try lowercase includes
  for (const t of TEAMS) {
    if (t.team.toLowerCase() === normalized.toLowerCase()) return t.team;
    if (t.team.toLowerCase().includes(normalized.toLowerCase()) || normalized.toLowerCase().includes(t.team.toLowerCase())) {
      return t.team;
    }
  }
  return null;
}

export function useTournamentData() {
  const [eliminated, setEliminated] = useState<Set<string>>(new Set());
  const [winners, setWinners] = useState<Set<string>>(new Set());
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

        setEliminated(elimSet);
        setWinners(winSet);
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

  return { eliminated, winners, isEliminated, isWinner, loading };
}
