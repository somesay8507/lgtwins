import { describe, expect, it } from "vitest";
import {
  getPlayerLeaders,
  getStandings,
  getStandingSummary,
  getTeamStats,
} from "@/lib/standings";

describe("getStandings", () => {
  it("returns 10 teams ranked 1..10 by descending win percentage", async () => {
    const standings = await getStandings();
    expect(standings).toHaveLength(10);
    expect(standings.map((s) => s.rank)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    for (let i = 1; i < standings.length; i++) {
      expect(standings[i - 1].winPct).toBeGreaterThanOrEqual(standings[i].winPct);
    }
  });

  it("computes win percentage excluding draws", async () => {
    const [first] = await getStandings();
    expect(first.winPct).toBeCloseTo(first.wins / (first.wins + first.losses), 10);
  });

  it("gives the leader 0 games behind and computes the rest against it", async () => {
    const standings = await getStandings();
    const first = standings[0];
    expect(first.gamesBehind).toBe(0);
    const lg = standings.find((s) => s.isLg)!;
    expect(lg.gamesBehind).toBe(
      (first.wins - lg.wins + (lg.losses - first.losses)) / 2,
    );
  });

  it("has exactly one LG row that matches getStandingSummary", async () => {
    const [standings, summary] = await Promise.all([getStandings(), getStandingSummary()]);
    const lgRows = standings.filter((s) => s.isLg);
    expect(lgRows).toHaveLength(1);
    expect(lgRows[0]).toMatchObject({
      rank: summary!.rank,
      wins: summary!.wins,
      losses: summary!.losses,
      draws: summary!.draws,
    });
  });
});

describe("getTeamStats", () => {
  it("returns labelled stats", async () => {
    const stats = await getTeamStats();
    expect(stats.length).toBeGreaterThanOrEqual(6);
    for (const stat of stats) {
      expect(stat.label).not.toBe("");
      expect(stat.value).not.toBe("");
    }
  });
});

describe("getPlayerLeaders", () => {
  it("returns categories with 5 leaders each, including 타율", async () => {
    const categories = await getPlayerLeaders();
    expect(categories.map((c) => c.title)).toContain("타율");
    for (const category of categories) {
      expect(category.leaders).toHaveLength(5);
    }
  });

  it("uses only fictional names", async () => {
    const categories = await getPlayerLeaders();
    for (const category of categories) {
      for (const leader of category.leaders) {
        expect(leader.name).toMatch(/^선수 [A-Z]$/);
      }
    }
  });
});
