"use client";

import { useEffect, useState } from "react";
import { useLocalStorage } from "@/lib/hooks/useLocalStorage";
import type { Comment, CommentListItem } from "@/lib/types";

type Sort = "latest" | "popular";

const SORTS: { value: Sort; label: string }[] = [
  { value: "latest", label: "최신순" },
  { value: "popular", label: "인기순" },
];

interface CommentSectionProps {
  comments: CommentListItem[];
  postId: string;
}

export default function CommentSection({ comments: initialComments, postId }: CommentSectionProps) {
  const [sortBy, setSortBy] = useState<Sort>("latest");
  const [author, setAuthor] = useState("");
  const [content, setContent] = useState("");
  const [userComments, setUserComments] = useLocalStorage<Comment[]>("comments_" + postId, []);
  const [likedComments, setLikedComments] = useLocalStorage<Record<string, boolean>>(
    "liked_comments_" + postId,
    {}
  );

  const allComments = [...initialComments, ...userComments];
  const [likes, setLikes] = useState<Record<string, number>>(() => {
    const map: Record<string, number> = {};
    allComments.forEach((c) => (map[c.id] = c.likes));
    return map;
  });

  useEffect(() => {
    const newLikes: Record<string, number> = {};
    allComments.forEach((c) => {
      newLikes[c.id] = likes[c.id] ?? c.likes;
    });
    if (JSON.stringify(newLikes) !== JSON.stringify(likes)) {
      setLikes(newLikes); // eslint-disable-line react-hooks/exhaustive-deps
    }
  }, [allComments.length]);

  const sorted = [...allComments].sort((a, b) => {
    const aLikes = likes[a.id] ?? a.likes;
    const bLikes = likes[b.id] ?? b.likes;
    return sortBy === "popular"
      ? bLikes - aLikes
      : new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  const handleAddComment = () => {
    if (!author.trim() || !content.trim()) {
      alert("닉네임과 댓글을 모두 입력해주세요.");
      return;
    }

    const newComment: Comment = {
      id: `user-comment-${Date.now()}`,
      postId,
      author,
      content,
      date: new Date().toISOString().split("T")[0],
      likes: 0,
    };

    setUserComments([...userComments, newComment]);
    setAuthor("");
    setContent("");
  };

  const handleDeleteComment = (id: string) => {
    setUserComments(userComments.filter((c) => c.id !== id));
  };

  const handleLikeComment = (id: string) => {
    const isLiked = likedComments[id];
    if (isLiked) {
      setLikes((prev) => ({ ...prev, [id]: (prev[id] ?? 0) - 1 }));
      setLikedComments((prev) => ({ ...prev, [id]: false }));
    } else {
      setLikes((prev) => ({ ...prev, [id]: (prev[id] ?? 0) + 1 }));
      setLikedComments((prev) => ({ ...prev, [id]: true }));
    }
  };

  const isUserComment = (id: string) => id.startsWith("user-comment-");

  return (
    <section style={{ marginTop: "48px", paddingTop: "32px", borderTop: "2px solid var(--border)" }}>
      <h2 style={{ fontSize: "1.25rem", fontWeight: "600", marginBottom: "20px" }}>
        댓글 ({allComments.length})
      </h2>

      {/* 댓글 작성 폼 */}
      <div
        style={{
          background: "var(--surface-2)",
          padding: "16px",
          borderRadius: "8px",
          marginBottom: "32px",
        }}
      >
        <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
          <input
            type="text"
            placeholder="닉네임"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            style={{
              flex: 1,
              padding: "8px 12px",
              borderRadius: "4px",
              border: "1px solid var(--border)",
              background: "var(--surface)",
              color: "var(--text)",
            }}
          />
        </div>
        <textarea
          placeholder="댓글을 작성해주세요"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "4px",
            border: "1px solid var(--border)",
            background: "var(--surface)",
            color: "var(--text)",
            fontFamily: "inherit",
            resize: "vertical",
            marginBottom: "12px",
          }}
        />
        <button
          onClick={handleAddComment}
          style={{
            padding: "8px 16px",
            borderRadius: "4px",
            border: "none",
            background: "var(--red-soft)",
            color: "white",
            cursor: "pointer",
            fontWeight: "500",
          }}
        >
          댓글 작성
        </button>
      </div>

      {/* 정렬 옵션 */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          marginBottom: "20px",
        }}
      >
        {SORTS.map((s) => (
          <button
            key={s.value}
            type="button"
            onClick={() => setSortBy(s.value)}
            aria-pressed={sortBy === s.value}
            style={{
              padding: "6px 12px",
              borderRadius: "999px",
              border: sortBy === s.value ? "2px solid var(--red-soft)" : "1px solid var(--border)",
              background: sortBy === s.value ? "var(--surface-2)" : "transparent",
              color: sortBy === s.value ? "var(--red-soft)" : "var(--text)",
              cursor: "pointer",
              fontWeight: sortBy === s.value ? 600 : 400,
              fontSize: "0.9rem",
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* 댓글 목록 */}
      <div>
        {sorted.length > 0 ? (
          sorted.map((comment) => (
            <div
              key={comment.id}
              style={{
                paddingBottom: "20px",
                marginBottom: "20px",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "8px",
                  fontSize: "0.9rem",
                  color: "var(--text-secondary)",
                }}
              >
                <span style={{ fontWeight: "500" }}>{comment.author}</span>
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <span>{comment.date}</span>
                  {isUserComment(comment.id) && (
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "var(--text-secondary)",
                        cursor: "pointer",
                        fontSize: "0.8rem",
                        textDecoration: "underline",
                      }}
                    >
                      삭제
                    </button>
                  )}
                </div>
              </div>
              <p
                style={{
                  marginBottom: "12px",
                  lineHeight: "1.6",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}
              >
                {comment.content}
              </p>
              <button
                onClick={() => handleLikeComment(comment.id)}
                style={{
                  background: "none",
                  border: "none",
                  padding: 0,
                  color: likedComments[comment.id] ? "var(--red-soft)" : "var(--text-secondary)",
                  cursor: "pointer",
                  fontSize: "0.85rem",
                  textDecoration: "underline",
                  fontWeight: likedComments[comment.id] ? "600" : "400",
                }}
              >
                {likedComments[comment.id] ? "❤️" : "👍"} 좋아요 {likes[comment.id] ?? comment.likes}
              </button>
            </div>
          ))
        ) : (
          <p
            style={{
              textAlign: "center",
              color: "var(--text-secondary)",
              padding: "40px 0",
            }}
          >
            아직 댓글이 없습니다. 첫 댓글을 남겨보세요!
          </p>
        )}
      </div>
    </section>
  );
}
