import Hero from "@/components/home/Hero";
import NextGame from "@/components/home/NextGame";
import Summary from "@/components/home/Summary";
import StarPlayers from "@/components/home/StarPlayers";
import HistoryPreview from "@/components/home/HistoryPreview";
import { getNextGame, getRecentGames } from "@/lib/games";
import { getStandingSummary } from "@/lib/standings";
import { getStarPlayers } from "@/lib/players";
import { getChampionships } from "@/lib/history";
import { safe } from "@/lib/safe";

// 더미 경기 시간이 빌드 시점에 고정되지 않도록 1분마다 재생성한다.
export const revalidate = 60;

export default async function Home() {
  const [nextGame, recent, standing, players, titles] = await Promise.all([
    safe(() => getNextGame()),
    safe(getRecentGames),
    safe(getStandingSummary),
    safe(getStarPlayers),
    safe(getChampionships),
  ]);

  return (
    <>
      <Hero />
      {nextGame && <NextGame game={nextGame} />}
      {recent && recent.length > 0 && standing && (
        <Summary recent={recent} standing={standing} />
      )}
      {players && players.length > 0 && <StarPlayers players={players} />}
      {titles && titles.length > 0 && <HistoryPreview titles={titles} />}
    </>
  );
}
