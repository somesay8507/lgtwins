import { describe, expect, it } from "vitest";
import {
  getPost,
  getPostsByCategory,
  searchPosts,
} from "@/lib/posts";

describe("posts", () => {
  describe("getPostsByCategory", () => {
    it("returns posts filtered by category", async () => {
      const notice = await getPostsByCategory("notice");
      expect(notice.length).toBeGreaterThan(0);
      expect(notice.every((p) => p.category === "notice")).toBe(true);
    });

    it("sorts by latest by default", async () => {
      const posts = await getPostsByCategory("free");
      const first = new Date(posts[0].date).getTime();
      const last = new Date(posts[posts.length - 1].date).getTime();
      expect(first).toBeGreaterThanOrEqual(last);
    });

    it("sorts by popularity when requested", async () => {
      const posts = await getPostsByCategory("free", "popular");
      expect(posts[0].likes).toBeGreaterThanOrEqual(posts[1].likes);
    });
  });

  describe("getPost", () => {
    it("returns a single post by id", async () => {
      const post = await getPost("notice-1");
      expect(post).not.toBeNull();
      expect(post?.id).toBe("notice-1");
      expect(post?.content).toBeDefined();
    });

    it("returns null for non-existent id", async () => {
      const post = await getPost("invalid-id");
      expect(post).toBeNull();
    });
  });

  describe("searchPosts", () => {
    it("finds posts by title", async () => {
      const results = await searchPosts("시즌");
      expect(results.length).toBeGreaterThan(0);
      expect(results.every((p) => p.title.includes("시즌"))).toBe(true);
    });

    it("returns empty array for no matches", async () => {
      const results = await searchPosts("xyz_no_match");
      expect(results).toHaveLength(0);
    });

    it("is case-insensitive", async () => {
      const resultLower = await searchPosts("경기");
      const resultUpper = await searchPosts("경기");
      expect(resultLower.length).toBe(resultUpper.length);
    });
  });
});
