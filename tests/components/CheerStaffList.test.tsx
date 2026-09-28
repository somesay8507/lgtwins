import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import CheerStaffList from "@/components/cheer/CheerStaffList";

describe("CheerStaffList", () => {
  it("groups staff by role in a fixed order", () => {
    render(
      <CheerStaffList
        staff={[
          { name: "차영현", role: "치어리더" },
          { name: "이윤승", role: "응원단장" },
          { name: "김태리", role: "부응원단장" },
        ]}
      />,
    );
    const roleLabels = screen
      .getAllByText(/^(응원단장|부응원단장|장내아나운서|치어리더)$/)
      .map((el) => el.textContent);
    expect(roleLabels).toEqual(["응원단장", "부응원단장", "치어리더"]);
    expect(screen.getByText("이윤승")).toBeInTheDocument();
    expect(screen.getByText("차영현")).toBeInTheDocument();
  });

  it("shows an empty-state message when there is no staff", () => {
    render(<CheerStaffList staff={[]} />);
    expect(screen.getByText("응원단 정보가 없어요.")).toBeInTheDocument();
  });
});
