import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import StandingsTable from "@/components/standings/StandingsTable";
import type { StandingEntry } from "@/lib/types";

const entries: StandingEntry[] = [
  { rank: 1, team: "한화 이글스", wins: 74, losses: 49, draws: 3, winPct: 74 / 123, gamesBehind: 0, isLg: false },
  { rank: 2, team: "LG 트윈스", wins: 70, losses: 52, draws: 4, winPct: 70 / 122, gamesBehind: 3.5, isLg: true },
];

describe("StandingsTable", () => {
  it("renders a caption and one row per team plus the header", () => {
    render(<StandingsTable entries={entries} />);
    expect(screen.getByText("KBO 팀 순위")).toBeInTheDocument();
    expect(screen.getAllByRole("row")).toHaveLength(3);
  });

  it("formats win percentage and games behind", () => {
    render(<StandingsTable entries={entries} />);
    const lgRow = screen.getByRole("row", { name: /LG 트윈스/ });
    expect(within(lgRow).getByText(".574")).toBeInTheDocument();
    expect(within(lgRow).getByText("3.5")).toBeInTheDocument();
    const leaderRow = screen.getByRole("row", { name: /한화 이글스/ });
    expect(within(leaderRow).getByText(".602")).toBeInTheDocument();
    expect(within(leaderRow).getByText("-")).toBeInTheDocument();
  });

  it("marks only the LG row as current with a visible tag", () => {
    render(<StandingsTable entries={entries} />);
    expect(screen.getByRole("row", { name: /LG 트윈스/ })).toHaveAttribute(
      "aria-current",
      "true",
    );
    expect(screen.getByRole("row", { name: /한화 이글스/ })).not.toHaveAttribute(
      "aria-current",
    );
    expect(screen.getByText("우리팀")).toBeInTheDocument();
  });
});
