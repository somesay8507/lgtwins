"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { Post } from "@/lib/types";
import { useLocalStorage } from "@/lib/hooks/useLocalStorage";
import CommentSection from "./CommentSection";
import styles from "./community.module.css";

import type { CommentListItem } from "@/lib/types";

export default function PostContent({
  post: initialPost,
  categoryLabel,
  comments: initialComments,
}: {
  post: Post;
  categoryLabel: string;
  comments: CommentListItem[];
}) {
  const router = useRouter();
  const [userPosts] = useLocalStorage<Post[]>("user_posts", []);
  const [comments, setComments] = useState<CommentListItem[]>(initialComments);
  const [post, setPost] = useState(initialPost);

  useEffect(() => {
    const userPost = userPosts.find((p) => p.id === initialPost.id);
    if (userPost) {
      setPost(userPost);
    }
  }, [userPosts, initialPost.id]);

  const isUserPost = post.id.startsWith("user-");

  const handleDeletePost = () => {
    if (confirm("이 게시물을 삭제하시겠습니까?")) {
      const updatedPosts = userPosts.filter((p) => p.id !== post.id);
      localStorage.setItem("user_posts", JSON.stringify(updatedPosts));
      alert("✅ 게시물이 삭제되었습니다");
      router.push("/community");
    }
  };
  return (
    <article>
      <div style={{ marginBottom: "24px", paddingBottom: "24px", borderBottom: "1px solid var(--border)" }}>
        <div style={{ marginBottom: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span className={styles.badge + " " + styles[post.category]}>{categoryLabel}</span>
          {isUserPost && (
            <button
              onClick={handleDeletePost}
              style={{
                padding: "8px 16px",
                background: "#fee",
                color: "#c00",
                border: "1px solid #fcc",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "600",
              }}
            >
              🗑️ 게시물 삭제
            </button>
          )}
        </div>
        <h2 style={{ fontSize: "2rem", fontWeight: "600", marginBottom: "16px" }}>{post.title}</h2>
        <div className={styles.meta}>
          <span className={styles.metaItem}>{post.author}</span>
          <span className={styles.metaItem}>{post.date}</span>
          <span className={styles.metaItem}>조회 {post.views}</span>
          <span className={styles.metaItem}>좋아요 {post.likes}</span>
        </div>
      </div>
      <div style={{ lineHeight: "1.8", marginBottom: "32px", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
        {post.content}
      </div>
      <div style={{ textAlign: "center", marginTop: "48px" }}>
        <Link href="/community" style={{ display: "inline-block", padding: "12px 24px", background: "var(--surface)",
                                         border: "1px solid var(--border)", borderRadius: "999px", color: "var(--text)",
                                         textDecoration: "none", fontWeight: "500" }}>
          목록으로
        </Link>
      </div>

      <CommentSection comments={comments} postId={post.id} />
    </article>
  );
}
