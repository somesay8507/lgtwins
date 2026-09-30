import Link from "next/link";
import type { PostListItem } from "@/lib/types";
import styles from "./community.module.css";

export default function PostCard({ post }: { post: PostListItem }) {
  return (
    <article className={styles.cardContainer}>
      <Link href={`/community/${post.id}`} className={styles.cardLink}>
        <h3 className={styles.title}>{post.title}</h3>
      </Link>
      <div className={styles.meta}>
        <span className={styles.badge + " " + styles[post.category]}>
          {post.category}
        </span>
        <span className={styles.metaItem}>{post.author}</span>
        <span className={styles.metaItem}>{post.date}</span>
        <span className={styles.metaItem}>조회 {post.views}</span>
        <span className={styles.metaItem}>좋아요 {post.likes}</span>
      </div>
    </article>
  );
}
