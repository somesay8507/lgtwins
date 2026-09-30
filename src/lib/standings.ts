import { DUMMY_STANDING, DUMMY_STANDING_ROWS } from "@/data/standings";
import { DUMMY_TEAM_STATS } from "@/data/teamStats";
import { DUMMY_LEADERS } from "@/data/playerLeaders";
import type {
  LeaderCategory,
  StandingEntry,
  StandingSummary,
  TeamStat,
} from "./types";

const LG_TEAM = "LG 트윈스";

export async function getStandingSummary(): Promise<StandingSummary | null> {
  return DUMMY_STANDING;
}

export async function getStandings(): Promise<StandingEntry[]> {
  const sorted = DUMMY_STANDING_ROWS.map((row) => ({
    ...row,
    winPct: row.wins / (row.wins + row.losses),
  })).sort((a, b) => b.winPct - a.winPct || b.wins - a.wins);

  const first = sorted[0];
  return sorted.map((row, index) => ({
    ...row,
    rank: index + 1,
    gamesBehind: (first.wins - row.wins + (row.losses - first.losses)) / 2,
    isLg: row.team === LG_TEAM,
  }));
}

export async function getTeamStats(): Promise<TeamStat[]> {
  return [...DUMMY_TEAM_STATS];
}

export async function getPlayerLeaders(): Promise<LeaderCategory[]> {
  return DUMMY_LEADERS.map((category) => ({
    ...category,
    leaders: [...category.leaders],
  }));
}
