import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import TeamSongList from "@/components/cheer/TeamSongList";

describe("TeamSongList", () => {
  it("renders each song title", () => {
    render(<TeamSongList songs={[{ title: "강해져라" }, { title: "GO TWINS" }]} />);
    expect(screen.getByText("강해져라")).toBeInTheDocument();
    expect(screen.getByText("GO TWINS")).toBeInTheDocument();
  });

  it("shows an empty-state message when there are no songs", () => {
    render(<TeamSongList songs={[]} />);
    expect(screen.getByText("팀 응원가 정보가 없어요.")).toBeInTheDocument();
  });
});
