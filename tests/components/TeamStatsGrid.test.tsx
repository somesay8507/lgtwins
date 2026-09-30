import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import TeamStatsGrid from "@/components/standings/TeamStatsGrid";

const stats = [
  { label: "팀 타율", value: "0.279" },
  { label: "홈런", value: "118" },
];

describe("TeamStatsGrid", () => {
  it("renders every stat label with its value", () => {
    render(<TeamStatsGrid stats={stats} />);
    expect(screen.getByText("팀 타율")).toBeInTheDocument();
    expect(screen.getByText("0.279")).toBeInTheDocument();
    expect(screen.getByText("홈런")).toBeInTheDocument();
    expect(screen.getByText("118")).toBeInTheDocument();
  });

  it("is labelled as the LG team record section", () => {
    render(<TeamStatsGrid stats={stats} />);
    expect(
      screen.getByRole("region", { name: "LG 트윈스 팀 기록" }),
    ).toBeInTheDocument();
  });
});
