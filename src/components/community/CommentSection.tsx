"use client";

import { useState } from "react";
import type { CommentListItem } from "@/lib/types";

type Sort = "latest" | "popular";

const SORTS: { value: Sort; label: string }[] = [
  { value: "latest", label: "최신순" },
  { value: "popular", label: "인기순" },
];

function CommentItem({ comment }: { comment: CommentListItem }) {
  return (
    <div
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
          marginBottom: "8px",
          fontSize: "0.9rem",
          color: "var(--text-secondary)",
        }}
      >
        <span style={{ fontWeight: "500" }}>{comment.author}</span>
        <span>{comment.date}</span>
      </div>
      <p style={{ marginBottom: "12px", lineHeight: "1.6", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
        {comment.content}
      </p>
      <button
        type="button"
        style={{
          background: "none",
          border: "none",
          padding: 0,
          color: "var(--text-secondary)",
          cursor: "pointer",
          fontSize: "0.85rem",
          textDecoration: "underline",
        }}
        aria-label={`좋아요 ${comment.likes}개`}
      >
        👍 좋아요 {comment.likes}
      </button>
    </div>
  );
}

export default function CommentSection({ comments }: { comments: CommentListItem[] }) {
  const [sortBy, setSortBy] = useState<Sort>("latest");

  const sorted = [...comments].sort((a, b) =>
    sortBy === "popular"
      ? b.likes - a.likes
      : new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  return (
    <section style={{ marginTop: "48px", paddingTop: "32px", borderTop: "2px solid var(--border)" }}>
      <h2 style={{ fontSize: "1.25rem", fontWeight: "600", marginBottom: "20px" }}>
        댓글 ({comments.length})
      </h2>

      {/* 댓글 작성 폼 (더미) */}
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
            disabled
            style={{
              flex: 1,
              padding: "8px 12px",
              borderRadius: "4px",
              border: "1px solid var(--border)",
              background: "var(--surface)",
              color: "var(--text-secondary)",
              cursor: "not-allowed",
            }}
          />
        </div>
        <textarea
          placeholder="댓글을 작성해주세요 (아직 기능 준비 중입니다)"
          disabled
          rows={3}
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "4px",
            border: "1px solid var(--border)",
            background: "var(--surface)",
            color: "var(--text-secondary)",
            fontFamily: "inherit",
            resize: "vertical",
            cursor: "not-allowed",
            marginBottom: "12px",
          }}
        />
        <button
          disabled
          style={{
            padding: "8px 16px",
            borderRadius: "4px",
            border: "1px solid var(--border)",
            background: "var(--surface)",
            color: "var(--text-secondary)",
            cursor: "not-allowed",
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
          sorted.map((comment) => <CommentItem key={comment.id} comment={comment} />)
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
