"use client";

import { HISTORY_CATEGORIES } from "@/lib/history";
import type { HistoryCategory } from "@/lib/types";
import styles from "./CategoryFilter.module.css";

export type FilterValue = "전체" | HistoryCategory;

type Props = {
  selected: FilterValue;
  onSelect: (value: FilterValue) => void;
};

export default function CategoryFilter({ selected, onSelect }: Props) {
  const options: FilterValue[] = ["전체", ...HISTORY_CATEGORIES];

  return (
    <div className={styles.filter} role="group" aria-label="카테고리 필터">
      {options.map((value) => (
        <button
          key={value}
          type="button"
          className={styles.chip}
          aria-pressed={selected === value}
          onClick={() => onSelect(value)}
        >
          {value}
        </button>
      ))}
    </div>
  );
}
