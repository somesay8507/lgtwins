import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PlayerGrid from "@/components/players/PlayerGrid";
import type { Player } from "@/lib/types";

const players: Player[] = [
  { name: "선수A", number: "1", position: "투수" },
  { name: "선수B", number: "2", position: "포수" },
  { name: "선수C", number: "3", position: "포수" },
];

describe("PlayerGrid", () => {
  it("shows all players by default", () => {
    render(<PlayerGrid players={players} />);
    expect(screen.getByText("선수A")).toBeInTheDocument();
    expect(screen.getByText("선수B")).toBeInTheDocument();
    expect(screen.getByText("선수C")).toBeInTheDocument();
  });

  it("filters players when a position tab is selected", async () => {
    const user = userEvent.setup();
    render(<PlayerGrid players={players} />);
    await user.click(screen.getByRole("button", { name: "포수 2" }));
    expect(screen.queryByText("선수A")).not.toBeInTheDocument();
    expect(screen.getByText("선수B")).toBeInTheDocument();
    expect(screen.getByText("선수C")).toBeInTheDocument();
  });
});
