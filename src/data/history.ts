import type { HistoryEvent } from "@/lib/types";

// 2026-09-25 사용자 검증 완료. 확신도 낮은 항목(준우승 연도, 역대 감독 이력)은
// 검증 전까지 넣지 않는다 — 프로젝트 규칙: 불확실한 사실 정보는 넣지 않는다.
export const HISTORY_EVENTS: HistoryEvent[] = [
  {
    year: 1982,
    category: "창단",
    title: "MBC 청룡 창단",
    description: "KBO 원년 6개 구단 중 하나로 창단, 잠실야구장을 홈구장으로 사용",
  },
  {
    year: 1990,
    category: "창단",
    title: "LG 트윈스로 재출범",
    description: "LG그룹이 MBC 청룡을 인수하며 구단명을 LG 트윈스로 변경",
  },
  { year: 1990, category: "우승", title: "한국시리즈 우승" },
  { year: 1994, category: "우승", title: "한국시리즈 우승" },
  {
    year: 2023,
    category: "우승",
    title: "한국시리즈 우승",
    description: "29년 만의 통산 3번째 우승",
  },
];
