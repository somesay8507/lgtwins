import { ALL_PLAYERS } from "@/data/players";
import type { Player } from "./types";

const STAR_PLAYER_NAMES = ["오지환", "문보경", "박동원", "임찬규"];

export async function getPlayers(): Promise<Player[]> {
  return ALL_PLAYERS;
}

export async function getStarPlayers(): Promise<Player[]> {
  const players = await getPlayers();
  return players.filter((player) => STAR_PLAYER_NAMES.includes(player.name));
}
