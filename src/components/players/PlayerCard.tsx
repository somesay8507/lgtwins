import Link from "next/link";
import type { Player } from "@/lib/types";
import styles from "./PlayerCard.module.css";

export default function PlayerCard({ player }: { player: Player }) {
  return (
    <Link href={`/players/${player.name}`} className={styles.card}>
      <span className={styles.avatar} aria-hidden="true">
        {player.name.charAt(0)}
      </span>
      <p className={styles.number}>{player.number ?? "미정"}</p>
      <p className={styles.name}>{player.name}</p>
      <p className={styles.position}>{player.position}</p>
    </Link>
  );
}
