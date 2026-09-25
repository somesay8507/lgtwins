import { describe, expect, it } from "vitest";
import { getNextGame, getRecentGames } from "@/lib/games";
import { getStandingSummary } from "@/lib/standings";
import { getPlayers, getStarPlayers } from "@/lib/players";
import { getChampionships, getHistoryEvents } from "@/lib/history";

describe("games", () => {
  it("getNextGame returns a game that starts after now", async () => {
    const now = new Date("2026-09-20T03:00:00Z");
    const game = await getNextGame(now);
    expect(game).not.toBeNull();
    expect(new Date(game!.startsAt).getTime()).toBeGreaterThan(now.getTime());
  });

  it("getRecentGames returns 5 results with valid result codes", async () => {
    const games = await getRecentGames();
    expect(games).toHaveLength(5);
    for (const g of games) expect(["W", "L", "D"]).toContain(g.result);
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
