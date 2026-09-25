import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import HistoryPreview from "@/components/home/HistoryPreview";

describe("HistoryPreview", () => {
  it("renders each championship year", () => {
    render(<HistoryPreview titles={[{ year: 1990 }, { year: 1994 }]} />);
    expect(screen.getByText("1990")).toBeInTheDocument();
    expect(screen.getByText("1994")).toBeInTheDocument();
  });

  it("links to the full history page", () => {
    render(<HistoryPreview titles={[{ year: 1990 }]} />);
    expect(screen.getByText("전체 역사 보기")).toHaveAttribute(
      "href",
      "/history",
    );
  });
});
