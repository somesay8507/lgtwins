import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import HistoryExplorer from "@/components/history/HistoryExplorer";
import type { HistoryEvent } from "@/lib/types";

const events: HistoryEvent[] = [
  { year: 1982, category: "창단", title: "MBC 청룡 창단" },
  { year: 1990, category: "우승", title: "한국시리즈 우승" },
  { year: 1994, category: "우승", title: "한국시리즈 우승" },
];

describe("HistoryExplorer", () => {
  it("shows all events by default", () => {
    render(<HistoryExplorer events={events} />);
    expect(screen.getByText("MBC 청룡 창단")).toBeInTheDocument();
    expect(screen.getAllByText("한국시리즈 우승")).toHaveLength(2);
  });

  it("filters the timeline when a category is selected", async () => {
    const user = userEvent.setup();
    render(<HistoryExplorer events={events} />);
    await user.click(screen.getByRole("button", { name: "우승" }));
    expect(screen.queryByText("MBC 청룡 창단")).not.toBeInTheDocument();
    expect(screen.getAllByText("한국시리즈 우승")).toHaveLength(2);
  });

  it("shows the empty state for a category with no events", async () => {
    const user = userEvent.setup();
    render(<HistoryExplorer events={events} />);
    await user.click(screen.getByRole("button", { name: "감독" }));
    expect(screen.getByText("해당 카테고리 기록이 없어요.")).toBeInTheDocument();
  });
});
