export type Game = {
  id: string;
  opponent: string;
  /** ISO 8601 (UTC) */
  startsAt: string;
  venue: string;
};

export type GameResult = {
  id: string;
  opponent: string;
  /** YYYY-MM-DD */
  date: string;
  result: "W" | "L" | "D";
  score: string;
};

export type StandingSummary = {
  rank: number;
  wins: number;
  losses: number;
  draws: number;
};

export type PlayerPosition = "투수" | "포수" | "내야수" | "외야수";

export type Player = {
  name: string;
  number: string | null;
  position: PlayerPosition;
};

export type Championship = {
  year: number;
};

export type HistoryCategory = "우승" | "준우승" | "창단" | "감독" | "기록";

export type HistoryEvent = {
  year: number;
  category: HistoryCategory;
  title: string;
  description?: string;
};

export type TeamCheerSong = { title: string };
export type PlayerCheerSong = { player: string; title: string };
export type CheerStaffRole = "응원단장" | "부응원단장" | "장내아나운서" | "치어리더";
export type CheerStaffMember = { name: string; role: CheerStaffRole };

export type ScheduleEntry =
  | { kind: "upcoming"; id: string; opponent: string; venue: string; startsAt: string }
  | { kind: "past"; id: string; opponent: string; date: string; result: "W" | "L" | "D"; score: string };

export type StandingRow = {
  team: string;
  wins: number;
  losses: number;
  draws: number;
};

export type StandingEntry = StandingRow & {
  rank: number;
  /** 승 / (승 + 패), 무승부 제외 */
  winPct: number;
  /** 1위 기준 게임차 */
  gamesBehind: number;
  isLg: boolean;
};

export type TeamStat = { label: string; value: string };

export type LeaderCategory = {
  title: string;
  leaders: { name: string; value: string }[];
};
