import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import PlayerCard from "@/components/players/PlayerCard";

describe("PlayerCard", () => {
  it("renders name, number, and position, linking to the detail page", () => {
    render(
      <PlayerCard player={{ name: "오지환", number: "10", position: "내야수" }} />,
    );
    expect(screen.getByText("오지환")).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument();
    expect(screen.getByText("내야수")).toBeInTheDocument();
    expect(screen.getByRole("link")).toHaveAttribute("href", "/players/오지환");
  });

  it("shows 미정 when the player has no assigned number", () => {
    render(
      <PlayerCard player={{ name: "박명근", number: null, position: "투수" }} />,
    );
    expect(screen.getByText("미정")).toBeInTheDocument();
  });
});
