import type { StandingEntry } from "@/lib/types";
import styles from "./StandingsTable.module.css";

const formatPct = (value: number) => value.toFixed(3).replace(/^0/, "");
const formatGamesBehind = (value: number) => (value === 0 ? "-" : String(value));

export default function StandingsTable({ entries }: { entries: StandingEntry[] }) {
  return (
    <div className={styles.wrap}>
      <table className={styles.table}>
        <caption className={styles.caption}>KBO 팀 순위</caption>
        <thead>
          <tr>
            <th scope="col">순위</th>
            <th scope="col" className={styles.team}>팀</th>
            <th scope="col">승</th>
            <th scope="col">패</th>
            <th scope="col">무</th>
            <th scope="col">승률</th>
            <th scope="col">게임차</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr
              key={entry.team}
              className={entry.isLg ? styles.lg : undefined}
              aria-current={entry.isLg ? "true" : undefined}
            >
              <td>{entry.rank}</td>
              <th scope="row" className={styles.team}>
                {entry.team}
                {entry.isLg && <span className={styles.tag}>우리팀</span>}
              </th>
              <td>{entry.wins}</td>
              <td>{entry.losses}</td>
              <td>{entry.draws}</td>
              <td>{formatPct(entry.winPct)}</td>
              <td>{formatGamesBehind(entry.gamesBehind)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
