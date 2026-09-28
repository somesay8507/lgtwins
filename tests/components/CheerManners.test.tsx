import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import CheerManners from "@/components/cheer/CheerManners";

describe("CheerManners", () => {
  it("renders the cheer manner guidelines", () => {
    render(<CheerManners />);
    expect(
      screen.getByText("우리 팀 공격 이닝에 크게 응원하고, 수비 이닝에는 목소리를 낮춰요."),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(4);
  });
});
