"use client";

import { useMemo, useState } from "react";
import PostList from "./PostList";
import type { PostListItem } from "@/lib/types";

type Tab = "all" | "notice" | "free" | "fanart";
type Sort = "latest" | "popular";

const CATEGORIES: { value: Tab; label: string }[] = [
  { value: "all", label: "전체" },
  { value: "notice", label: "공지" },
  { value: "free", label: "자유" },
  { value: "fanart", label: "팬창작물" },
];

const SORTS: { value: Sort; label: string }[] = [
  { value: "latest", label: "최신순" },
  { value: "popular", label: "인기순" },
];

function pillStyle(active: boolean): React.CSSProperties {
  return {
    padding: "8px 16px",
    borderRadius: "999px",
    border: active ? "2px solid var(--red-soft)" : "1px solid var(--border)",
    background: active ? "var(--surface-2)" : "transparent",
    color: active ? "var(--red-soft)" : "var(--text)",
    cursor: "pointer",
    fontWeight: active ? 600 : 400,
  };
}

export default function PostExplorer({ posts }: { posts: PostListItem[] }) {
  const [activeTab, setActiveTab] = useState<Tab>("all");
  const [sortBy, setSortBy] = useState<Sort>("latest");
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const result = posts.filter(
      (p) =>
        (activeTab === "all" || p.category === activeTab) &&
        (!q || p.title.toLowerCase().includes(q)),
    );
    return result.sort((a, b) =>
      sortBy === "popular"
        ? b.likes - a.likes
        : new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
  }, [posts, activeTab, sortBy, searchQuery]);

  return (
    <div>
      <div style={{ marginBottom: "32px" }}>
        <div
          role="group"
          aria-label="카테고리"
          style={{ display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap" }}
        >
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              type="button"
              onClick={() => setActiveTab(cat.value)}
              aria-pressed={activeTab === cat.value}
              style={pillStyle(activeTab === cat.value)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div
          role="group"
          aria-label="정렬"
          style={{ display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap" }}
        >
          {SORTS.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => setSortBy(s.value)}
              aria-pressed={sortBy === s.value}
              style={pillStyle(sortBy === s.value)}
            >
              {s.label}
            </button>
          ))}
        </div>

        <input
          type="text"
          placeholder="제목으로 검색"
          aria-label="제목으로 검색"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "8px",
            border: "1px solid var(--border)",
            background: "var(--surface)",
            color: "var(--text)",
            fontSize: "1rem",
          }}
        />
      </div>

      <PostList items={filtered} />
    </div>
  );
}
