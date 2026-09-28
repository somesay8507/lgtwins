import { CHEER_STAFF, PLAYER_CHEER_SONGS, TEAM_CHEER_SONGS } from "@/data/cheer";
import type { CheerStaffMember, PlayerCheerSong, TeamCheerSong } from "./types";

export async function getTeamCheerSongs(): Promise<TeamCheerSong[]> {
  return TEAM_CHEER_SONGS;
}

export async function getPlayerCheerSongs(): Promise<PlayerCheerSong[]> {
  return PLAYER_CHEER_SONGS;
}

export async function getCheerStaff(): Promise<CheerStaffMember[]> {
  return CHEER_STAFF;
}
