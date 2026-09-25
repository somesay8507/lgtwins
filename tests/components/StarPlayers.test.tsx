import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import StarPlayers from "@/components/home/StarPlayers";

describe("StarPlayers", () => {
  it("renders a card per player", () => {
    render(
      <StarPlayers
        players={[
          { name: "선수A", number: "1", position: "투수" },
          { name: "선수B", number: "2", position: "포수" },
        ]}
      />,
    );
    expect(screen.getByText("선수A")).toBeInTheDocument();
    expect(screen.getByText("포수")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });
});
