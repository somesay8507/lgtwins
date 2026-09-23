import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import Summary from "@/components/home/Summary";
import type { GameResult, StandingSummary } from "@/lib/types";

const recent: GameResult[] = [
  { id: "1", opponent: "KIA", date: "2026-09-19", result: "W", score: "5:3" },
  { id: "2", opponent: "삼성", date: "2026-09-18", result: "L", score: "1:4" },
  { id: "3", opponent: "롯데", date: "2026-09-17", result: "D", score: "3:3" },
];
const standing: StandingSummary = { rank: 2, wins: 70, losses: 52, draws: 4 };

describe("Summary", () => {
  it("shows rank and record", () => {
    render(<Summary recent={recent} standing={standing} />);
    expect(screen.getByText("2위")).toBeInTheDocument();
    expect(screen.getByText("70승 52패 4무")).toBeInTheDocument();
  });

  it("labels each recent result accessibly", () => {
    render(<Summary recent={recent} standing={standing} />);
    expect(screen.getByLabelText("승, KIA 5:3")).toBeInTheDocument();
    expect(screen.getByLabelText("패, 삼성 1:4")).toBeInTheDocument();
    expect(screen.getByLabelText("무, 롯데 3:3")).toBeInTheDocument();
  });
});
