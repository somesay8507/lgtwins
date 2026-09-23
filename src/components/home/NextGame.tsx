import Card from "@/components/ui/Card";
import SectionTitle from "@/components/ui/SectionTitle";
import type { Game } from "@/lib/types";
import Countdown from "./Countdown";
import styles from "./NextGame.module.css";

const formatter = new Intl.DateTimeFormat("ko-KR", {
  dateStyle: "full",
  timeStyle: "short",
  timeZone: "Asia/Seoul",
});

export default function NextGame({ game }: { game: Game }) {
  return (
    <section
      id="next-game"
      className={`container ${styles.section}`}
      aria-labelledby="next-game-title"
    >
      <SectionTitle id="next-game-title" eyebrow="Next Game" title="다음 경기" />
      <Card className={styles.card}>
        <div>
          <p className={styles.versus}>
            LG <em>vs</em> {game.opponent}
          </p>
          <p className={styles.meta}>
            {formatter.format(new Date(game.startsAt))} · {game.venue}
          </p>
        </div>
        <Countdown startsAt={game.startsAt} />
      </Card>
    </section>
  );
}
