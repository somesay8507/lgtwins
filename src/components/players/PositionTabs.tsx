"use client";

import type { PlayerPosition } from "@/lib/types";
import styles from "./PositionTabs.module.css";

export type PositionFilter = "전체" | PlayerPosition;

const POSITIONS: PlayerPosition[] = ["투수", "포수", "내야수", "외야수"];

type Props = {
  selected: PositionFilter;
  onSelect: (value: PositionFilter) => void;
  counts: Record<PositionFilter, number>;
};

export default function PositionTabs({ selected, onSelect, counts }: Props) {
  const options: PositionFilter[] = ["전체", ...POSITIONS];

  return (
    <div className={styles.tabs} role="group" aria-label="포지션 필터">
      {options.map((value) => (
        <button
          key={value}
          type="button"
          className={styles.tab}
          aria-pressed={selected === value}
          onClick={() => onSelect(value)}
        >
          {value} {counts[value]}
        </button>
      ))}
    </div>
  );
}
