import type { Metadata } from "next";
import SectionTitle from "@/components/ui/SectionTitle";
import TeamSongList from "@/components/cheer/TeamSongList";
import PlayerSongList from "@/components/cheer/PlayerSongList";
import CheerStaffList from "@/components/cheer/CheerStaffList";
import CheerTools from "@/components/cheer/CheerTools";
import CheerManners from "@/components/cheer/CheerManners";
import { getCheerStaff, getPlayerCheerSongs, getTeamCheerSongs } from "@/lib/cheer";
import { safe } from "@/lib/safe";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "응원 문화",
  description: "LG 트윈스 팬들의 응원가와 응원 문화를 소개해요.",
};

export default async function CheerPage() {
  const [teamSongs, playerSongs, staff] = await Promise.all([
    safe(getTeamCheerSongs),
    safe(getPlayerCheerSongs),
    safe(getCheerStaff),
  ]);

  return (
    <section
      className={`container ${styles.section}`}
      aria-labelledby="cheer-page-title"
    >
      <p className={styles.eyebrow}>Cheer</p>
      <h1 id="cheer-page-title" className={styles.heading}>
        응원 문화
      </h1>
      <nav className={styles.jump} aria-label="섹션 바로가기">
        <a href="#team-songs">팀 응원가</a>
        <a href="#player-songs">선수 응원가</a>
        <a href="#cheer-staff">응원단</a>
        <a href="#cheer-tools">응원 도구</a>
        <a href="#cheer-manners">응원 매너</a>
      </nav>

      <div id="team-songs" className={styles.block}>
        <SectionTitle id="team-songs-title" eyebrow="Team" title="팀 응원가" />
        {teamSongs ? (
          <TeamSongList songs={teamSongs} />
        ) : (
          <p className={styles.error}>팀 응원가 정보를 불러오지 못했어요.</p>
        )}
      </div>

      <div id="player-songs" className={styles.block}>
        <SectionTitle id="player-songs-title" eyebrow="Players" title="선수 응원가" />
        {playerSongs ? (
          <PlayerSongList songs={playerSongs} />
        ) : (
          <p className={styles.error}>선수 응원가 정보를 불러오지 못했어요.</p>
        )}
      </div>

      <div id="cheer-staff" className={styles.block}>
        <SectionTitle id="cheer-staff-title" eyebrow="Staff" title="응원단" />
        {staff ? (
          <CheerStaffList staff={staff} />
        ) : (
          <p className={styles.error}>응원단 정보를 불러오지 못했어요.</p>
        )}
      </div>

      <div id="cheer-tools" className={styles.block}>
        <SectionTitle id="cheer-tools-title" eyebrow="Tools" title="응원 도구" />
        <CheerTools />
      </div>

      <div id="cheer-manners" className={styles.block}>
        <SectionTitle id="cheer-manners-title" eyebrow="Manners" title="응원 매너" />
        <CheerManners />
      </div>
    </section>
  );
}
