import type { HistoryCategory } from "@/lib/types";
import styles from "./EventBadge.module.css";

export default function EventBadge({ category }: { category: HistoryCategory }) {
  const highlight = category === "우승";
  return (
    <span className={`${styles.badge} ${highlight ? styles.highlight : ""}`}>
      {category}
    </span>
  );
}
