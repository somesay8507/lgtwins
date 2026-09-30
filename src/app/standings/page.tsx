import type { Metadata } from "next";
import StandingsExplorer from "@/components/standings/StandingsExplorer";
import { safe } from "@/lib/safe";
import { getPlayerLeaders, getStandings, getTeamStats } from "@/lib/standings";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "순위/기록",
  description: "KBO 팀 순위와 LG 트윈스 팀 기록, 선수 기록 순위를 확인하세요.",
};

export default async function StandingsPage() {
  const [standings, teamStats, leaders] = await Promise.all([
    safe(getStandings),
    safe(getTeamStats),
    safe(getPlayerLeaders),
  ]);

  return (
    <section
      className={`container ${styles.section}`}
      aria-labelledby="standings-page-title"
    >
      <p className={styles.eyebrow}>Standings</p>
      <h1 id="standings-page-title" className={styles.heading}>
        순위/기록
      </h1>
      <p className={styles.notice}>
        이 페이지의 모든 수치는 화면 구성을 위한 가상의 샘플 데이터예요.
      </p>
      {standings && teamStats && leaders ? (
        <StandingsExplorer
          standings={standings}
          teamStats={teamStats}
          leaders={leaders}
        />
      ) : (
        <p className={styles.error}>순위 정보를 불러오지 못했어요.</p>
      )}
    </section>
  );
}
