import type { TeamStat } from "@/lib/types";
import styles from "./TeamStatsGrid.module.css";

export default function TeamStatsGrid({ stats }: { stats: TeamStat[] }) {
  return (
    <section aria-label="LG 트윈스 팀 기록">
      <dl className={styles.grid}>
        {stats.map((stat) => (
          <div key={stat.label} className={styles.card}>
            <dt className={styles.label}>{stat.label}</dt>
            <dd className={styles.value}>{stat.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
