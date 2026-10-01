"use client";

import { useMemo, useState } from "react";
import PostList from "./PostList";
import { useLocalStorage } from "@/lib/hooks/useLocalStorage";
import type { Post, PostListItem } from "@/lib/types";

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
  const [userPosts, setUserPosts] = useLocalStorage<Post[]>("user_posts", []);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    content: "",
    category: "free" as const,
  });

  const allPosts = useMemo(() => {
    const combined = [
      ...posts,
      ...userPosts.map((p) => ({ ...p, content: undefined }) as PostListItem),
    ];
    return combined;
  }, [posts, userPosts]);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const result = allPosts.filter(
      (p) =>
        (activeTab === "all" || p.category === activeTab) &&
        (!q || p.title.toLowerCase().includes(q)),
    );
    return result.sort((a, b) =>
      sortBy === "popular"
        ? b.likes - a.likes
        : new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
  }, [allPosts, activeTab, sortBy, searchQuery]);

  const handleAddPost = () => {
    if (!formData.title.trim() || !formData.author.trim() || !formData.content.trim()) {
      alert("제목, 작성자, 내용을 모두 입력해주세요.");
      return;
    }

    const newPost: Post = {
      id: `user-${Date.now()}`,
      category: formData.category,
      title: formData.title,
      author: formData.author,
      date: new Date().toISOString().split("T")[0],
      views: 0,
      likes: 0,
      content: formData.content,
      excerpt: formData.content.substring(0, 100),
    };

    setUserPosts([newPost, ...userPosts]);
    setFormData({ title: "", author: "", content: "", category: "free" });
    setShowForm(false);
  };

  const handleDeletePost = (postId: string) => {
    if (confirm("이 게시물을 삭제하시겠습니까?")) {
      setUserPosts(userPosts.filter((p) => p.id !== postId));
    }
  };

  const isUserPost = (id: string) => id.startsWith("user-");

  return (
    <div>
      {/* 글 쓰기 폼 */}
      <div style={{ marginBottom: "32px" }}>
        {!showForm ? (
          <button
            onClick={() => setShowForm(true)}
            style={{
              width: "100%",
              padding: "16px",
              borderRadius: "8px",
              border: "2px solid var(--red-soft)",
              background: "var(--surface-2)",
              color: "var(--red-soft)",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "1rem",
            }}
          >
            ✏️ 새 글 쓰기
          </button>
        ) : (
          <div
            style={{
              padding: "20px",
              borderRadius: "8px",
              border: "1px solid var(--border)",
              background: "var(--surface-2)",
            }}
          >
            <h3 style={{ marginBottom: "16px", fontWeight: "600" }}>새 글 작성</h3>

            <div style={{ marginBottom: "12px" }}>
              <label style={{ display: "block", marginBottom: "6px", fontSize: "0.9rem" }}>
                작성자
              </label>
              <input
                type="text"
                placeholder="닉네임을 입력하세요"
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "6px",
                  border: "1px solid var(--border)",
                  background: "var(--surface)",
                  color: "var(--text)",
                }}
              />
            </div>

            <div style={{ marginBottom: "12px" }}>
              <label style={{ display: "block", marginBottom: "6px", fontSize: "0.9rem" }}>
                카테고리
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value as "notice" | "free" | "fanart" })
                }
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "6px",
                  border: "1px solid var(--border)",
                  background: "var(--surface)",
                  color: "var(--text)",
                }}
              >
                <option value="free">자유 게시판</option>
                <option value="fanart">팬 창작물</option>
              </select>
            </div>

            <div style={{ marginBottom: "12px" }}>
              <label style={{ display: "block", marginBottom: "6px", fontSize: "0.9rem" }}>
                제목
              </label>
              <input
                type="text"
                placeholder="제목을 입력하세요"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "6px",
                  border: "1px solid var(--border)",
                  background: "var(--surface)",
                  color: "var(--text)",
                }}
              />
            </div>

            <div style={{ marginBottom: "12px" }}>
              <label style={{ display: "block", marginBottom: "6px", fontSize: "0.9rem" }}>
                내용
              </label>
              <textarea
                placeholder="내용을 입력하세요"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={6}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "6px",
                  border: "1px solid var(--border)",
                  background: "var(--surface)",
                  color: "var(--text)",
                  fontFamily: "inherit",
                  resize: "vertical",
                }}
              />
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={handleAddPost}
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: "6px",
                  border: "none",
                  background: "var(--red-soft)",
                  color: "white",
                  cursor: "pointer",
                  fontWeight: "600",
                }}
              >
                작성하기
              </button>
              <button
                onClick={() => setShowForm(false)}
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: "6px",
                  border: "1px solid var(--border)",
                  background: "transparent",
                  color: "var(--text)",
                  cursor: "pointer",
                  fontWeight: "600",
                }}
              >
                취소
              </button>
            </div>
          </div>
        )}
      </div>

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

      {filtered.length === 0 ? (
        <p style={{ color: "var(--text-secondary)", textAlign: "center" }}>글이 없어요.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {filtered.map((post) => (
            <div
              key={post.id}
              style={{
                padding: "16px",
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: "12px",
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "16px", fontWeight: "600", marginBottom: "8px" }}>
                  {post.title}
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: "12px",
                    fontSize: "13px",
                    color: "var(--text-secondary)",
                  }}
                >
                  <span>{post.author}</span>
                  <span>{post.date}</span>
                  <span>👀 {post.views}</span>
                  <span>👍 {post.likes}</span>
                </div>
              </div>
              {isUserPost(post.id) && (
                <button
                  onClick={() => handleDeletePost(post.id)}
                  style={{
                    padding: "6px 12px",
                    background: "#fee",
                    color: "#c00",
                    border: "1px solid #fcc",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "12px",
                    fontWeight: "600",
                    whiteSpace: "nowrap",
                  }}
                >
                  🗑️ 삭제
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
