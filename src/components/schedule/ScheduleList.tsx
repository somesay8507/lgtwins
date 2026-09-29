import type { ScheduleEntry } from "@/lib/types";
import ScheduleItem from "./ScheduleItem";
import styles from "./ScheduleList.module.css";

export default function ScheduleList({ entries }: { entries: ScheduleEntry[] }) {
  if (entries.length === 0) {
    return <p className={styles.empty}>일정 정보가 없어요.</p>;
  }

  return (
    <ol className={styles.list}>
      {entries.map((entry) => (
        <ScheduleItem key={entry.id} entry={entry} />
      ))}
    </ol>
  );
}
