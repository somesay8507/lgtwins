import type { PlayerCheerSong } from "@/lib/types";
import styles from "./PlayerSongList.module.css";

function groupByPlayer(songs: PlayerCheerSong[]): { player: string; titles: string[] }[] {
  const order: string[] = [];
  const map = new Map<string, string[]>();
  for (const song of songs) {
    if (!map.has(song.player)) {
      map.set(song.player, []);
      order.push(song.player);
    }
    map.get(song.player)!.push(song.title);
  }
  return order.map((player) => ({ player, titles: map.get(player)! }));
}

export default function PlayerSongList({ songs }: { songs: PlayerCheerSong[] }) {
  const grouped = groupByPlayer(songs);

  if (grouped.length === 0) {
    return <p className={styles.empty}>선수 응원가 정보가 없어요.</p>;
  }

  return (
    <ul className={styles.list}>
      {grouped.map((entry) => (
        <li key={entry.player} className={styles.item}>
          <p className={styles.player}>{entry.player}</p>
          {entry.titles.map((title) => (
            <p key={title} className={styles.title}>
              {title}
            </p>
          ))}
        </li>
      ))}
    </ul>
  );
}
