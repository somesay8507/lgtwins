import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import StarPlayers from "@/components/home/StarPlayers";

describe("StarPlayers", () => {
  it("renders a card per player", () => {
    render(
      <StarPlayers
        players={[
          { id: "a", name: "선수A", position: "투수" },
          { id: "b", name: "선수B", position: "포수" },
        ]}
      />,
    );
    expect(screen.getByText("선수A")).toBeInTheDocument();
    expect(screen.getByText("포수")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });
});
