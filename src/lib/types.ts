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

export type Player = {
  id: string;
  name: string;
  position: string;
};

export type Championship = {
  year: number;
};
