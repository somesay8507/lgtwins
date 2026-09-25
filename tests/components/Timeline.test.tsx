import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import Timeline from "@/components/history/Timeline";
import type { HistoryEvent } from "@/lib/types";

const events: HistoryEvent[] = [
  { year: 1982, category: "창단", title: "MBC 청룡 창단" },
  { year: 1990, category: "우승", title: "한국시리즈 우승" },
];

describe("Timeline", () => {
  it("renders each event's year, title, and category badge", () => {
    render(<Timeline events={events} />);
    expect(screen.getByText("1982")).toBeInTheDocument();
    expect(screen.getByText("MBC 청룡 창단")).toBeInTheDocument();
    expect(screen.getByText("창단")).toBeInTheDocument();
    expect(screen.getByText("1990")).toBeInTheDocument();
    expect(screen.getByText("한국시리즈 우승")).toBeInTheDocument();
  });

  it("renders a description when present", () => {
    render(
      <Timeline
        events={[
          {
            year: 2023,
            category: "우승",
            title: "한국시리즈 우승",
            description: "29년 만의 통산 3번째 우승",
          },
        ]}
      />,
    );
    expect(screen.getByText("29년 만의 통산 3번째 우승")).toBeInTheDocument();
  });

  it("shows an empty-state message when there are no events", () => {
    render(<Timeline events={[]} />);
    expect(screen.getByText("해당 카테고리 기록이 없어요.")).toBeInTheDocument();
  });
});
