import type { TeamCheerSong } from "@/lib/types";
import styles from "./TeamSongList.module.css";

export default function TeamSongList({ songs }: { songs: TeamCheerSong[] }) {
  if (songs.length === 0) {
    return <p className={styles.empty}>팀 응원가 정보가 없어요.</p>;
  }

  return (
    <ul className={styles.list}>
      {songs.map((song) => (
        <li key={song.title} className={styles.item}>
          {song.title}
        </li>
      ))}
    </ul>
  );
}
