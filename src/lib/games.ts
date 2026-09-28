import { DUMMY_RECENT_GAMES, dummyUpcomingGames } from "@/data/games";
import type { Game, GameResult, ScheduleEntry } from "./types";

export async function getUpcomingGames(now: Date = new Date()): Promise<Game[]> {
  return dummyUpcomingGames(now);
}

export async function getNextGame(now: Date = new Date()): Promise<Game | null> {
  const games = await getUpcomingGames(now);
  return games[0] ?? null;
}

export async function getRecentGames(
  limit: number = DUMMY_RECENT_GAMES.length,
): Promise<GameResult[]> {
  return DUMMY_RECENT_GAMES.slice(0, limit);
}

export async function getSchedule(now: Date = new Date()): Promise<ScheduleEntry[]> {
  const [upcoming, past] = await Promise.all([
    getUpcomingGames(now),
    getRecentGames(),
  ]);

  const pastEntries: ScheduleEntry[] = [...past].reverse().map((game) => ({
    kind: "past",
    id: game.id,
    opponent: game.opponent,
    date: game.date,
    result: game.result,
    score: game.score,
  }));

  const upcomingEntries: ScheduleEntry[] = upcoming.map((game) => ({
    kind: "upcoming",
    id: game.id,
    opponent: game.opponent,
    venue: game.venue,
    startsAt: game.startsAt,
  }));

  return [...pastEntries, ...upcomingEntries];
}
