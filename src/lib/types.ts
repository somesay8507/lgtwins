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
