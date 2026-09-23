import { CHAMPIONSHIPS } from "@/data/history";
import type { Championship } from "./types";

export async function getChampionships(): Promise<Championship[]> {
  return CHAMPIONSHIPS;
}
