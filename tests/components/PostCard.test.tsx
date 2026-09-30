import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import PostCard from "@/components/community/PostCard";
import type { PostListItem } from "@/lib/types";

const mockPost: PostListItem = {
  id: "test-1",
  category: "free",
  title: "테스트 글",
  author: "테스트러",
  date: "2026-09-30",
  views: 100,
  likes: 25,
  excerpt: "테스트 글입니다.",
};

describe("PostCard", () => {
  it("renders title as link to post detail", () => {
    render(<PostCard post={mockPost} />);
    const link = screen.getByRole("link", { name: "테스트 글" });
    expect(link).toHaveAttribute("href", "/community/test-1");
  });

  it("displays author, date, views, likes", () => {
    render(<PostCard post={mockPost} />);
    expect(screen.getByText("테스트러")).toBeInTheDocument();
    expect(screen.getByText("2026-09-30")).toBeInTheDocument();
    expect(screen.getByText("조회 100")).toBeInTheDocument();
    expect(screen.getByText("좋아요 25")).toBeInTheDocument();
  });

  it("shows category badge", () => {
    render(<PostCard post={mockPost} />);
    expect(screen.getByText("free")).toBeInTheDocument();
  });
});
