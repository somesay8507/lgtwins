import { DUMMY_RECENT_GAMES, dummyNextGame } from "@/data/games";
import type { Game, GameResult } from "./types";

export async function getNextGame(now: Date = new Date()): Promise<Game | null> {
  return dummyNextGame(now);
}

export async function getRecentGames(): Promise<GameResult[]> {
  return DUMMY_RECENT_GAMES;
}
