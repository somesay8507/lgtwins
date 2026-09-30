import type { StandingRow, StandingSummary } from "@/lib/types";

// DUMMY: 5단계(순위/기록)에서 실제 데이터로 교체한다.
export const DUMMY_STANDING: StandingSummary = {
  rank: 2,
  wins: 70,
  losses: 52,
  draws: 4,
};

// DUMMY: 구단명은 실제 KBO 구단이지만 승·패·무는 전부 가상 수치다.
// LG 트윈스 행은 위 DUMMY_STANDING과 반드시 같아야 한다(홈 화면과 불일치 방지).
export const DUMMY_STANDING_ROWS: StandingRow[] = [
  { team: "한화 이글스", wins: 74, losses: 49, draws: 3 },
  { team: "LG 트윈스", wins: 70, losses: 52, draws: 4 },
  { team: "삼성 라이온즈", wins: 68, losses: 55, draws: 3 },
  { team: "KT 위즈", wins: 65, losses: 58, draws: 3 },
  { team: "SSG 랜더스", wins: 63, losses: 60, draws: 3 },
  { team: "롯데 자이언츠", wins: 61, losses: 63, draws: 2 },
  { team: "NC 다이노스", wins: 59, losses: 64, draws: 3 },
  { team: "KIA 타이거즈", wins: 57, losses: 66, draws: 3 },
  { team: "두산 베어스", wins: 55, losses: 69, draws: 2 },
  { team: "키움 히어로즈", wins: 46, losses: 78, draws: 2 },
];
