import Card from "@/components/ui/Card";
import SectionTitle from "@/components/ui/SectionTitle";
import type { GameResult, StandingSummary } from "@/lib/types";
import styles from "./Summary.module.css";

const RESULT_LABEL = { W: "승", L: "패", D: "무" } as const;

type Props = { recent: GameResult[]; standing: StandingSummary };

export default function Summary({ recent, standing }: Props) {
  return (
    <section
      className={`container ${styles.section}`}
      aria-labelledby="summary-title"
    >
      <SectionTitle id="summary-title" eyebrow="Summary" title="요즘 트윈스" />
      <div className={styles.grid}>
        <Card>
          <p className={styles.caption}>현재 순위</p>
          <p className={styles.rank}>{standing.rank}위</p>
          <p className={styles.record}>
            {standing.wins}승 {standing.losses}패 {standing.draws}무
          </p>
        </Card>
        <Card>
          <p className={styles.caption}>최근 {recent.length}경기</p>
          <ul className={styles.chips}>
            {recent.map((g) => (
              <li
                key={g.id}
                className={`${styles.chip} ${styles[g.result]}`}
                aria-label={`${RESULT_LABEL[g.result]}, ${g.opponent} ${g.score}`}
              >
                <span aria-hidden="true">{RESULT_LABEL[g.result]}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </section>
  );
}
