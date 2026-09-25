import { HISTORY_EVENTS } from "@/data/history";
import type { Championship, HistoryCategory, HistoryEvent } from "./types";

export const HISTORY_CATEGORIES: HistoryCategory[] = [
  "우승",
  "준우승",
  "창단",
  "감독",
  "기록",
];

export async function getHistoryEvents(): Promise<HistoryEvent[]> {
  return HISTORY_EVENTS;
}

export async function getChampionships(): Promise<Championship[]> {
  const events = await getHistoryEvents();
  return events
    .filter((event) => event.category === "우승")
    .map((event) => ({ year: event.year }));
}
