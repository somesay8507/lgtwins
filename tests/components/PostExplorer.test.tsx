import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PostExplorer from "@/components/community/PostExplorer";
import type { PostListItem } from "@/lib/types";

const mockPosts: PostListItem[] = [
  {
    id: "1",
    category: "notice",
    title: "공지사항 1",
    author: "작가",
    date: "2026-09-30",
    views: 100,
    likes: 10,
    excerpt: "공지",
  },
  {
    id: "2",
    category: "free",
    title: "자유 글",
    author: "작가",
    date: "2026-09-29",
    views: 50,
    likes: 5,
    excerpt: "자유",
  },
  {
    id: "3",
    category: "fanart",
    title: "팬 창작물",
    author: "작가",
    date: "2026-09-28",
    views: 200,
    likes: 50,
    excerpt: "팬아트",
  },
];

describe("PostExplorer", () => {
  it("renders all posts initially", () => {
    render(<PostExplorer posts={mockPosts} />);
    expect(screen.getByText("공지사항 1")).toBeInTheDocument();
    expect(screen.getByText("자유 글")).toBeInTheDocument();
    expect(screen.getByText("팬 창작물")).toBeInTheDocument();
  });

  it("filters posts by tab", async () => {
    const user = userEvent.setup();
    render(<PostExplorer posts={mockPosts} />);
    const freeTab = screen.getByRole("button", { name: "자유" });
    await user.click(freeTab);
    expect(screen.getByText("자유 글")).toBeInTheDocument();
    expect(screen.queryByText("공지사항 1")).not.toBeInTheDocument();
  });

  it("sorts by popularity when toggled", async () => {
    const user = userEvent.setup();
    render(<PostExplorer posts={mockPosts} />);
    const sortButton = screen.getByRole("button", { name: /인기순/ });
    await user.click(sortButton);
    const items = screen.getAllByRole("heading", { level: 3 });
    expect(items[0]).toHaveTextContent("팬 창작물");
  });

  it("filters by search query", async () => {
    const user = userEvent.setup();
    render(<PostExplorer posts={mockPosts} />);
    const input = screen.getByPlaceholderText("제목으로 검색");
    await user.type(input, "팬");
    expect(screen.getByText("팬 창작물")).toBeInTheDocument();
    expect(screen.queryByText("공지사항 1")).not.toBeInTheDocument();
  });
});
