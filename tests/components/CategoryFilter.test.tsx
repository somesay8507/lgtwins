import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CategoryFilter from "@/components/history/CategoryFilter";

describe("CategoryFilter", () => {
  it("renders 전체 plus every history category", () => {
    render(<CategoryFilter selected="전체" onSelect={() => {}} />);
    for (const label of ["전체", "우승", "준우승", "창단", "감독", "기록"]) {
      expect(screen.getByRole("button", { name: label })).toBeInTheDocument();
    }
  });

  it("marks the selected option as pressed", () => {
    render(<CategoryFilter selected="우승" onSelect={() => {}} />);
    expect(screen.getByRole("button", { name: "우승" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: "전체" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  it("calls onSelect with the clicked category", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<CategoryFilter selected="전체" onSelect={onSelect} />);
    await user.click(screen.getByRole("button", { name: "감독" }));
    expect(onSelect).toHaveBeenCalledWith("감독");
  });
});
