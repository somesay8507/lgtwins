import Link from "next/link";
import type { Post } from "@/lib/types";
import styles from "./community.module.css";

export default function PostContent({
  post,
  categoryLabel,
}: {
  post: Post;
  categoryLabel: string;
}) {
  return (
    <article>
      <div style={{ marginBottom: "24px", paddingBottom: "24px", borderBottom: "1px solid var(--border)" }}>
        <div style={{ marginBottom: "16px" }}>
          <span className={styles.badge + " " + styles[post.category]}>{categoryLabel}</span>
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
    </article>
  );
}
