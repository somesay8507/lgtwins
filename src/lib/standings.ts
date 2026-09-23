import { DUMMY_STANDING } from "@/data/standings";
import type { StandingSummary } from "./types";

export async function getStandingSummary(): Promise<StandingSummary | null> {
  return DUMMY_STANDING;
}
