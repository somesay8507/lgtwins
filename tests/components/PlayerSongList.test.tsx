import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import PlayerSongList from "@/components/cheer/PlayerSongList";

describe("PlayerSongList", () => {
  it("groups multiple songs under the same player", () => {
    render(
      <PlayerSongList
        songs={[
          { player: "박해민", title: "박해민 응원가 1" },
          { player: "박해민", title: "박해민 응원가 2" },
          { player: "홍창기", title: "홍창기 응원가" },
        ]}
      />,
    );
    expect(screen.getAllByText("박해민")).toHaveLength(1);
    expect(screen.getByText("박해민 응원가 1")).toBeInTheDocument();
    expect(screen.getByText("박해민 응원가 2")).toBeInTheDocument();
    expect(screen.getByText("홍창기")).toBeInTheDocument();
    expect(screen.getByText("홍창기 응원가")).toBeInTheDocument();
  });

  it("shows an empty-state message when there are no songs", () => {
    render(<PlayerSongList songs={[]} />);
    expect(screen.getByText("선수 응원가 정보가 없어요.")).toBeInTheDocument();
  });
});
