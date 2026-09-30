import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import StandingsExplorer from "@/components/standings/StandingsExplorer";
import type { StandingEntry } from "@/lib/types";

const standings: StandingEntry[] = [
  { rank: 1, team: "LG 트윈스", wins: 70, losses: 52, draws: 4, winPct: 70 / 122, gamesBehind: 0, isLg: true },
];
const teamStats = [{ label: "팀 타율", value: "0.279" }];
const leaders = [{ title: "타율", leaders: [{ name: "선수 A", value: "0.331" }] }];

function setup() {
  render(<StandingsExplorer standings={standings} teamStats={teamStats} leaders={leaders} />);
}

describe("StandingsExplorer", () => {
  it("shows the standings tab by default", () => {
    setup();
    expect(screen.getByRole("button", { name: "팀 순위" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(screen.queryByText("팀 타율")).not.toBeInTheDocument();
  });

  it("switches to the team stats tab", async () => {
    const user = userEvent.setup();
    setup();
    await user.click(screen.getByRole("button", { name: "팀 기록" }));
    expect(screen.getByRole("button", { name: "팀 기록" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("팀 타율")).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  it("switches to the player leaders tab", async () => {
    const user = userEvent.setup();
    setup();
    await user.click(screen.getByRole("button", { name: "선수 기록" }));
    expect(screen.getByRole("heading", { name: "타율" })).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });
});
