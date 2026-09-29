import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import ScheduleItem from "@/components/schedule/ScheduleItem";

describe("ScheduleItem", () => {
  it("renders an upcoming game with a 예정 badge", () => {
    render(
      <ScheduleItem
        entry={{
          kind: "upcoming",
          id: "u1",
          opponent: "두산 베어스",
          venue: "잠실야구장",
          startsAt: "2026-09-30T09:30:00.000Z",
        }}
      />,
    );
    expect(screen.getByText("예정")).toBeInTheDocument();
    expect(screen.getByText("LG vs 두산 베어스")).toBeInTheDocument();
    expect(screen.getByText(/잠실야구장/)).toBeInTheDocument();
  });

  it("renders a past game with its result badge and score", () => {
    render(
      <ScheduleItem
        entry={{
          kind: "past",
          id: "p1",
          opponent: "KIA",
          date: "2026-09-19",
          result: "W",
          score: "5:3",
        }}
      />,
    );
    expect(screen.getByText("승")).toBeInTheDocument();
    expect(screen.getByText("LG vs KIA")).toBeInTheDocument();
    expect(screen.getByText(/5:3/)).toBeInTheDocument();
  });
});
