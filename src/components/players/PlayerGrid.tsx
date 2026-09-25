"use client";

import { useMemo, useState } from "react";
import type { Player, PlayerPosition } from "@/lib/types";
import PositionTabs, { type PositionFilter } from "./PositionTabs";
import PlayerCard from "./PlayerCard";
import styles from "./PlayerGrid.module.css";

const POSITIONS: PlayerPosition[] = ["투수", "포수", "내야수", "외야수"];

export default function PlayerGrid({ players }: { players: Player[] }) {
  const [selected, setSelected] = useState<PositionFilter>("전체");

  const counts = useMemo(() => {
    const result = { 전체: players.length } as Record<PositionFilter, number>;
    for (const position of POSITIONS) {
      result[position] = players.filter((p) => p.position === position).length;
    }
    return result;
  }, [players]);

  const filtered = useMemo(
    () =>
      selected === "전체"
        ? players
        : players.filter((player) => player.position === selected),
    [players, selected],
  );

  return (
    <div>
      <PositionTabs selected={selected} onSelect={setSelected} counts={counts} />
      <ul className={styles.grid}>
        {filtered.map((player) => (
          <li key={player.name}>
            <PlayerCard player={player} />
          </li>
        ))}
      </ul>
    </div>
  );
}
