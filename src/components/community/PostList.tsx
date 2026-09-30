import PostCard from "./PostCard";
import type { PostListItem } from "@/lib/types";
import styles from "./community.module.css";

export default function PostList({ items }: { items: PostListItem[] }) {
  if (items.length === 0) {
    return <p style={{ color: "var(--muted)", textAlign: "center" }}>글이 없어요.</p>;
  }
  return (
    <ol className={styles.list}>
      {items.map((item) => (
        <li key={item.id}>
          <PostCard post={item} />
        </li>
      ))}
    </ol>
  );
}
