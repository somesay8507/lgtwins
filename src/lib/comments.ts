import { DUMMY_COMMENTS } from "@/data/comments";
import type { CommentListItem } from "./types";

/** 게시글별 댓글 조회 (최신순) */
export async function getCommentsByPostId(
  postId: string,
  sortBy: "latest" | "popular" = "latest",
): Promise<CommentListItem[]> {
  const filtered = DUMMY_COMMENTS.filter((c) => c.postId === postId);

  if (sortBy === "popular") {
    filtered.sort((a, b) => b.likes - a.likes);
  } else {
    filtered.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
  }

  return filtered;
}

/** 댓글 개수 조회 */
export async function getCommentCount(postId: string): Promise<number> {
  return DUMMY_COMMENTS.filter((c) => c.postId === postId).length;
}
