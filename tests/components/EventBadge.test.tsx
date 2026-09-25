import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import EventBadge from "@/components/history/EventBadge";

describe("EventBadge", () => {
  it("renders the category text", () => {
    render(<EventBadge category="창단" />);
    expect(screen.getByText("창단")).toBeInTheDocument();
  });

  it("highlights the 우승 category", () => {
    render(<EventBadge category="우승" />);
    expect(screen.getByText("우승").className).toMatch(/highlight/);
  });

  it("does not highlight other categories", () => {
    render(<EventBadge category="감독" />);
    expect(screen.getByText("감독").className).not.toMatch(/highlight/);
  });
});
