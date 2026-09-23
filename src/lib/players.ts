import { STAR_PLAYERS } from "@/data/players";
import type { Player } from "./types";

export async function getStarPlayers(): Promise<Player[]> {
  return STAR_PLAYERS;
}
