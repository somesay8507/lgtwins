import { describe, expect, it } from "vitest";
import { getCheerStaff, getPlayerCheerSongs, getTeamCheerSongs } from "@/lib/cheer";

describe("cheer", () => {
  it("getTeamCheerSongs returns all 13 team songs", async () => {
    const songs = await getTeamCheerSongs();
    expect(songs).toHaveLength(13);
  });

  it("getPlayerCheerSongs returns all 17 entries across 15 unique players", async () => {
    const songs = await getPlayerCheerSongs();
    expect(songs).toHaveLength(17);
    expect(new Set(songs.map((s) => s.player)).size).toBe(15);
  });

  it("getCheerStaff returns all 16 staff members with the expected role counts", async () => {
    const staff = await getCheerStaff();
    expect(staff).toHaveLength(16);
    expect(staff.filter((s) => s.role === "응원단장")).toHaveLength(1);
    expect(staff.filter((s) => s.role === "부응원단장")).toHaveLength(2);
    expect(staff.filter((s) => s.role === "장내아나운서")).toHaveLength(1);
    expect(staff.filter((s) => s.role === "치어리더")).toHaveLength(12);
  });
});
