import type { ScheduleEntry } from "@/lib/types";
import styles from "./ScheduleItem.module.css";

const RESULT_LABEL = { W: "승", L: "패", D: "무" } as const;

const dateTimeFormatter = new Intl.DateTimeFormat("ko-KR", {
  dateStyle: "long",
  timeStyle: "short",
  timeZone: "Asia/Seoul",
});

const dateFormatter = new Intl.DateTimeFormat("ko-KR", {
  dateStyle: "long",
  timeZone: "Asia/Seoul",
});

export default function ScheduleItem({ entry }: { entry: ScheduleEntry }) {
  if (entry.kind === "upcoming") {
    const meta = `${dateTimeFormatter.format(new Date(entry.startsAt))} · ${entry.venue}`;
    return (
      <li className={styles.item} aria-label={`예정, LG vs ${entry.opponent}, ${meta}`}>
        <span className={styles.badge} aria-hidden="true">
          예정
        </span>
        <div>
          <p className={styles.opponent}>LG vs {entry.opponent}</p>
          <p className={styles.meta}>{meta}</p>
        </div>
      </li>
    );
  }

  const meta = `${dateFormatter.format(new Date(entry.date))} · ${entry.score}`;
  return (
    <li
      className={styles.item}
      aria-label={`${RESULT_LABEL[entry.result]}, LG vs ${entry.opponent}, ${meta}`}
    >
      <span className={`${styles.badge} ${styles[entry.result]}`} aria-hidden="true">
        {RESULT_LABEL[entry.result]}
      </span>
      <div>
        <p className={styles.opponent}>LG vs {entry.opponent}</p>
        <p className={styles.meta}>{meta}</p>
      </div>
    </li>
  );
}
