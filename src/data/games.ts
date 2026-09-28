import type { Game, GameResult } from "@/lib/types";

// DUMMY: 4단계에서 실제 데이터로 교체한다. "now" 기준 상대적으로 계산해
// 시간이 지나도 날짜가 어색해지지 않는다. 첫 항목은 기존 dummyNextGame과
// 동일한 내용(두산 베어스, 잠실야구장, 내일 18:30)을 유지한다.
export function dummyUpcomingGames(now: Date): Game[] {
  const schedule: Array<{ offsetDays: number; opponent: string; venue: string }> = [
    { offsetDays: 1, opponent: "두산 베어스", venue: "잠실야구장" },
    { offsetDays: 3, opponent: "KT 위즈", venue: "잠실야구장" },
    { offsetDays: 5, opponent: "SSG 랜더스", venue: "문학야구장" },
    { offsetDays: 7, opponent: "키움 히어로즈", venue: "고척스카이돔" },
    { offsetDays: 9, opponent: "NC 다이노스", venue: "창원NC파크" },
  ];

  return schedule.map(({ offsetDays, opponent, venue }, index) => {
    const startsAt = new Date(now);
    startsAt.setUTCDate(startsAt.getUTCDate() + offsetDays);
    startsAt.setUTCHours(9, 30, 0, 0);
    return {
      id: `dummy-upcoming-${index}`,
      opponent,
      startsAt: startsAt.toISOString(),
      venue,
    };
  });
}

// DUMMY: 4단계에서 실제 데이터로 교체한다.
export const DUMMY_RECENT_GAMES: GameResult[] = [
  { id: "d1", opponent: "KIA", date: "2026-09-19", result: "W", score: "5:3" },
  { id: "d2", opponent: "KIA", date: "2026-09-18", result: "W", score: "7:2" },
  { id: "d3", opponent: "삼성", date: "2026-09-16", result: "L", score: "1:4" },
  { id: "d4", opponent: "삼성", date: "2026-09-15", result: "W", score: "6:5" },
  { id: "d5", opponent: "롯데", date: "2026-09-14", result: "D", score: "3:3" },
  { id: "d6", opponent: "롯데", date: "2026-09-12", result: "W", score: "4:2" },
  { id: "d7", opponent: "NC", date: "2026-09-11", result: "L", score: "2:6" },
  { id: "d8", opponent: "NC", date: "2026-09-09", result: "W", score: "3:1" },
  { id: "d9", opponent: "키움", date: "2026-09-08", result: "W", score: "8:4" },
  { id: "d10", opponent: "키움", date: "2026-09-06", result: "D", score: "2:2" },
];
