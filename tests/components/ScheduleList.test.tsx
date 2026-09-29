import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import ScheduleList from "@/components/schedule/ScheduleList";

describe("ScheduleList", () => {
  it("renders one item per entry in the given order", () => {
    render(
      <ScheduleList
        entries={[
          { kind: "past", id: "p1", opponent: "KIA", date: "2026-09-19", result: "W", score: "5:3" },
          {
            kind: "upcoming",
            id: "u1",
            opponent: "두산 베어스",
            venue: "잠실야구장",
            startsAt: "2026-09-30T09:30:00.000Z",
          },
        ]}
      />,
    );
    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent("KIA");
    expect(items[1]).toHaveTextContent("두산 베어스");
  });

  it("shows an empty-state message when there are no entries", () => {
    render(<ScheduleList entries={[]} />);
    expect(screen.getByText("일정 정보가 없어요.")).toBeInTheDocument();
  });
});
