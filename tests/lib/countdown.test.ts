import { describe, expect, it } from "vitest";
import { getCountdown } from "@/lib/countdown";

const target = new Date("2026-09-21T09:30:00Z");

describe("getCountdown", () => {
  it("returns remaining time while upcoming", () => {
    const now = new Date("2026-09-20T00:00:00Z");
    expect(getCountdown(target, now)).toEqual({
      status: "upcoming",
      days: 1,
      hours: 9,
      minutes: 30,
      seconds: 0,
    });
  });

  it("floors partial seconds", () => {
    const now = new Date(target.getTime() - 1500);
    expect(getCountdown(target, now).seconds).toBe(1);
  });

  it("is live from start until 3 hours after", () => {
    expect(getCountdown(target, target).status).toBe("live");
    const almost = new Date(target.getTime() + 3 * 3600 * 1000 - 1);
    expect(getCountdown(target, almost).status).toBe("live");
  });

  it("is ended 3 hours after start", () => {
    const after = new Date(target.getTime() + 3 * 3600 * 1000);
    expect(getCountdown(target, after).status).toBe("ended");
  });
});
