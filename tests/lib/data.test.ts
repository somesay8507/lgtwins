import { describe, expect, it } from "vitest";
import { getNextGame, getRecentGames, getSchedule, getUpcomingGames } from "@/lib/games";
import { getStandingSummary } from "@/lib/standings";
import { getPlayers, getStarPlayers } from "@/lib/players";
import { getChampionships, getHistoryEvents } from "@/lib/history";

describe("games", () => {
  it("getUpcomingGames returns 5 games all starting after now", async () => {
    const now = new Date("2026-09-20T03:00:00Z");
    const games = await getUpcomingGames(now);
    expect(games).toHaveLength(5);
    for (const g of games) {
      expect(new Date(g.startsAt).getTime()).toBeGreaterThan(now.getTime());
    }
  });

  it("getNextGame returns the first upcoming game", async () => {
    const now = new Date("2026-09-20T03:00:00Z");
    const [next, upcoming] = await Promise.all([
      getNextGame(now),
      getUpcomingGames(now),
    ]);
    expect(next).not.toBeNull();
    expect(next).toEqual(upcoming[0]);
  });

  it("getRecentGames returns all 10 results by default, with valid result codes", async () => {
    const games = await getRecentGames();
    expect(games).toHaveLength(10);
    for (const g of games) expect(["W", "L", "D"]).toContain(g.result);
  });

  it("getRecentGames returns only the requested number when a limit is given", async () => {
    const games = await getRecentGames(5);
    expect(games).toHaveLength(5);
  });

  it("getSchedule returns 15 entries: 10 past (chronological) then 5 upcoming", async () => {
    const now = new Date("2026-09-20T03:00:00Z");
    const entries = await getSchedule(now);
    expect(entries).toHaveLength(15);
    expect(entries.slice(0, 10).every((e) => e.kind === "past")).toBe(true);
    expect(entries.slice(10).every((e) => e.kind === "upcoming")).toBe(true);

    const pastDates = entries.slice(0, 10).map((e) => (e as { date: string }).date);
    expect(pastDates).toEqual([...pastDates].sort());
  });
});

describe("standings", () => {
  it("getStandingSummary returns a positive rank", async () => {
    const s = await getStandingSummary();
    expect(s).not.toBeNull();
    expect(s!.rank).toBeGreaterThan(0);
  });
});

describe("players", () => {
  it("getPlayers returns all 74 registered players across four positions", async () => {
    const players = await getPlayers();
    expect(players).toHaveLength(74);
    expect(players.filter((p) => p.position === "투수")).toHaveLength(42);
    expect(players.filter((p) => p.position === "포수")).toHaveLength(7);
    expect(players.filter((p) => p.position === "내야수")).toHaveLength(15);
    expect(players.filter((p) => p.position === "외야수")).toHaveLength(10);
  });

  it("getStarPlayers returns exactly the 4 known stars, a subset of all players", async () => {
    const all = await getPlayers();
    const stars = await getStarPlayers();
    expect(stars).toHaveLength(4);
    expect(new Set(stars.map((p) => p.name)).size).toBe(4);
    for (const star of stars) {
      expect(all.some((p) => p.name === star.name)).toBe(true);
    }
  });
});

describe("history", () => {
  it("getHistoryEvents returns all events in ascending year order", async () => {
    const events = await getHistoryEvents();
    const years = events.map((e) => e.year);
    expect(years).toEqual([...years].sort((a, b) => a - b));
    expect(events.length).toBeGreaterThan(0);
  });

  it("getChampionships returns only 우승 events, unique ascending years", async () => {
    const titles = await getChampionships();
    const years = titles.map((t) => t.year);
    expect(years).toEqual([...years].sort((a, b) => a - b));
    expect(new Set(years).size).toBe(years.length);
    expect(years).toEqual([1990, 1994, 2023]);
  });
});
