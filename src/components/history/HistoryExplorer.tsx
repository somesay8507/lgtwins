"use client";

import { useMemo, useState } from "react";
import type { HistoryEvent } from "@/lib/types";
import CategoryFilter, { type FilterValue } from "./CategoryFilter";
import Timeline from "./Timeline";

export default function HistoryExplorer({ events }: { events: HistoryEvent[] }) {
  const [selected, setSelected] = useState<FilterValue>("전체");

  const filtered = useMemo(
    () =>
      selected === "전체"
        ? events
        : events.filter((event) => event.category === selected),
    [events, selected],
  );

  return (
    <div>
      <CategoryFilter selected={selected} onSelect={setSelected} />
      {/* key={selected}: 필터가 바뀔 때마다 Timeline을 새로 마운트시켜서
          useScrollReveal의 등장 애니메이션이 매번 다시 실행되게 한다.
          (Task 4 코드 리뷰에서 발견: ref identity가 안 바뀌면 효과가 재실행되지 않음) */}
      <Timeline key={selected} events={filtered} />
    </div>
  );
}
