import { DUMMY_POSTS } from "@/data/posts";
import type { Post, PostListItem } from "./types";

function toListItem({ content: _content, ...rest }: Post): PostListItem {
  return rest;
}

/** 카테고리별 글을 정렬해서 반환 (content 제외) */
export async function getPostsByCategory(
  category: string,
  sortBy: "latest" | "popular" = "latest",
): Promise<PostListItem[]> {
  const filtered = DUMMY_POSTS.filter(
    (p) => p.category === (category as Post["category"]),
  );

  if (sortBy === "popular") {
    filtered.sort((a, b) => b.likes - a.likes);
  } else {
    filtered.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
  }

  return filtered.map(toListItem);
}

/** 글 ID로 단일 글 조회 (content 포함) */
export async function getPost(id: string): Promise<Post | null> {
  return DUMMY_POSTS.find((p) => p.id === id) ?? null;
}

/** 제목으로 글 검색 */
export async function searchPosts(query: string): Promise<PostListItem[]> {
  const normalized = query.toLowerCase();
  return DUMMY_POSTS.filter((p) =>
    p.title.toLowerCase().includes(normalized),
  ).map(toListItem);
}
