"use client";

import { useState } from "react";
import type { LeaderCategory, StandingEntry, TeamStat } from "@/lib/types";
import LeaderBoards from "./LeaderBoards";
import StandingsTable from "./StandingsTable";
import TeamStatsGrid from "./TeamStatsGrid";
import styles from "./StandingsExplorer.module.css";

type Tab = "standings" | "teamStats" | "leaders";

const TABS: { id: Tab; label: string }[] = [
  { id: "standings", label: "팀 순위" },
  { id: "teamStats", label: "팀 기록" },
  { id: "leaders", label: "선수 기록" },
];

type Props = {
  standings: StandingEntry[];
  teamStats: TeamStat[];
  leaders: LeaderCategory[];
};

export default function StandingsExplorer({ standings, teamStats, leaders }: Props) {
  const [selected, setSelected] = useState<Tab>("standings");

  return (
    <div>
      <div className={styles.tabs} role="group" aria-label="기록 구분">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={styles.tab}
            aria-pressed={selected === tab.id}
            onClick={() => setSelected(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {selected === "standings" && <StandingsTable entries={standings} />}
      {selected === "teamStats" && <TeamStatsGrid stats={teamStats} />}
      {selected === "leaders" && <LeaderBoards categories={leaders} />}
    </div>
  );
}
