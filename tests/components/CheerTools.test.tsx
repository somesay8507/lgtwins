import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import CheerTools from "@/components/cheer/CheerTools";

describe("CheerTools", () => {
  it("renders the cheer tool cards", () => {
    render(<CheerTools />);
    expect(screen.getByText("막대풍선")).toBeInTheDocument();
    expect(screen.getByText("대형 응원 카드")).toBeInTheDocument();
    expect(screen.getByText("유니폼")).toBeInTheDocument();
    expect(screen.getByText("응원봉")).toBeInTheDocument();
  });
});
