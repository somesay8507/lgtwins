import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import LeaderBoards from "@/components/standings/LeaderBoards";

const categories = [
  {
    title: "타율",
    leaders: [
      { name: "선수 A", value: "0.331" },
      { name: "선수 B", value: "0.324" },
    ],
  },
  { title: "홈런", leaders: [{ name: "선수 F", value: "31" }] },
];

describe("LeaderBoards", () => {
  it("renders a heading and an ordered list per category", () => {
    render(<LeaderBoards categories={categories} />);
    expect(screen.getByRole("heading", { name: "타율" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "홈런" })).toBeInTheDocument();
    expect(screen.getAllByRole("list")).toHaveLength(2);
  });

  it("lists leaders in the given order with their values", () => {
    render(<LeaderBoards categories={categories} />);
    const [firstList] = screen.getAllByRole("list");
    const items = within(firstList).getAllByRole("listitem");
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent("선수 A");
    expect(items[0]).toHaveTextContent("0.331");
    expect(items[1]).toHaveTextContent("선수 B");
  });

  it("shows a sample-data notice", () => {
    render(<LeaderBoards categories={categories} />);
    expect(screen.getByText(/가상의 샘플 데이터/)).toBeInTheDocument();
  });
});
