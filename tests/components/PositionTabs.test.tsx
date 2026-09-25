import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PositionTabs from "@/components/players/PositionTabs";

const counts = { 전체: 74, 투수: 42, 포수: 7, 내야수: 15, 외야수: 10 };

describe("PositionTabs", () => {
  it("renders 전체 plus every position with its count", () => {
    render(<PositionTabs selected="전체" onSelect={() => {}} counts={counts} />);
    expect(screen.getByRole("button", { name: "전체 74" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "투수 42" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "포수 7" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "내야수 15" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "외야수 10" })).toBeInTheDocument();
  });

  it("marks the selected option as pressed", () => {
    render(<PositionTabs selected="투수" onSelect={() => {}} counts={counts} />);
    expect(screen.getByRole("button", { name: "투수 42" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: "전체 74" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  it("calls onSelect with the clicked position", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<PositionTabs selected="전체" onSelect={onSelect} counts={counts} />);
    await user.click(screen.getByRole("button", { name: "포수 7" }));
    expect(onSelect).toHaveBeenCalledWith("포수");
  });
});
