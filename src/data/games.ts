import type { Game, GameResult } from "@/lib/types";

// DUMMY: 4단계(경기 일정/결과)에서 실제 데이터로 교체한다.
export function dummyNextGame(now: Date): Game {
  // 내일 18:30 KST (= 09:30 UTC)
  const startsAt = new Date(now);
  startsAt.setUTCDate(startsAt.getUTCDate() + 1);
  startsAt.setUTCHours(9, 30, 0, 0);
  return {
    id: "dummy-next",
    opponent: "두산 베어스",
    startsAt: startsAt.toISOString(),
    venue: "잠실야구장",
  };
}

// DUMMY: 4단계에서 실제 데이터로 교체한다.
export const DUMMY_RECENT_GAMES: GameResult[] = [
  { id: "d1", opponent: "KIA", date: "2026-09-19", result: "W", score: "5:3" },
  { id: "d2", opponent: "KIA", date: "2026-09-18", result: "W", score: "7:2" },
  { id: "d3", opponent: "삼성", date: "2026-09-16", result: "L", score: "1:4" },
  { id: "d4", opponent: "삼성", date: "2026-09-15", result: "W", score: "6:5" },
  { id: "d5", opponent: "롯데", date: "2026-09-14", result: "D", score: "3:3" },
];
