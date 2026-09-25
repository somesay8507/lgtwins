import type { Metadata } from "next";
import PlayerGrid from "@/components/players/PlayerGrid";
import { getPlayers } from "@/lib/players";
import { safe } from "@/lib/safe";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "선수단",
  description: "LG 트윈스 등록 선수 74명을 포지션별로 만나보세요.",
};

export default async function PlayersPage() {
  const players = await safe(getPlayers);

  return (
    <section
      className={`container ${styles.section}`}
      aria-labelledby="players-page-title"
    >
      <p className={styles.eyebrow}>Players</p>
      <h1 id="players-page-title" className={styles.heading}>
        선수단
      </h1>
      {players && players.length > 0 ? (
        <PlayerGrid players={players} />
      ) : (
        <p className={styles.error}>선수단 정보를 불러오지 못했어요.</p>
      )}
    </section>
  );
}
