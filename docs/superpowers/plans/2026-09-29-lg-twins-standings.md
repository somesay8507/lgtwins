# LG 트윈스 팬사이트 5단계 (순위/기록 페이지) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `/standings` 페이지에서 팀 순위표, LG 팀 기록, 선수 기록 순위(가상 수치)를 탭 3개로 보여준다.

**Architecture:** `src/data`에 가상 더미 3종(순위 행, 팀 기록, 부문별 리더)을 두고, `src/lib/standings.ts`가 승률·게임차를 계산해 순위표를 만든다. 페이지(서버)가 `safe()`로 데이터를 읽어 `StandingsExplorer`(client, 탭 상태)에 넘기고, 탭별로 `StandingsTable` / `TeamStatsGrid` / `LeaderBoards`를 그린다. 홈페이지의 `Summary`와 `getStandingSummary()`는 건드리지 않는다.

**Tech Stack:** Next.js (App Router), TypeScript, CSS Modules, Vitest + Testing Library

**Spec:** `docs/superpowers/specs/2026-09-29-lg-twins-standings-design.md`

**작업 디렉터리:** `D:\DW_practice\LGtwins`

**프로젝트 규칙 (반드시 지킬 것):**
- 컴포넌트/페이지는 `src/data`를 직접 import하지 않고 `src/lib` 함수만 쓴다.
- 더미 데이터에는 반드시 `DUMMY` 주석을 붙인다. 실제 선수 이름은 쓰지 않는다.
- Next.js 16은 기존 지식과 다를 수 있다. 이 계획은 기존 `/schedule`, `/players` 페이지와 같은 패턴만 쓰므로 새 API는 없다.

---

## File Structure

```
src/
  lib/
    types.ts                 # StandingRow, StandingEntry, TeamStat, LeaderCategory 추가
    standings.ts             # getStandings/getTeamStats/getPlayerLeaders 추가 (getStandingSummary 유지)
    nav.ts                   # 순위 ready: true
  data/
    standings.ts             # DUMMY_STANDING_ROWS 추가 (DUMMY_STANDING 유지)
    teamStats.ts             # 신규
    playerLeaders.ts         # 신규
  components/standings/
    StandingsTable.tsx / .module.css
    TeamStatsGrid.tsx / .module.css
    LeaderBoards.tsx / .module.css
    StandingsExplorer.tsx / .module.css
  app/standings/
    page.tsx / page.module.css
tests/
  lib/standings.test.ts
  components/StandingsTable.test.tsx
  components/TeamStatsGrid.test.tsx
  components/LeaderBoards.test.tsx
  components/StandingsExplorer.test.tsx
```

---

### Task 1: 타입 + 더미 데이터 + lib 함수

**Files:**
- Modify: `src/lib/types.ts` (파일 끝에 추가)
- Modify: `src/data/standings.ts`
- Create: `src/data/teamStats.ts`, `src/data/playerLeaders.ts`
- Modify: `src/lib/standings.ts`
- Test: `tests/lib/standings.test.ts`

- [ ] **Step 1: 실패하는 테스트 작성**

`tests/lib/standings.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import {
  getPlayerLeaders,
  getStandings,
  getStandingSummary,
  getTeamStats,
} from "@/lib/standings";

describe("getStandings", () => {
  it("returns 10 teams ranked 1..10 by descending win percentage", async () => {
    const standings = await getStandings();
    expect(standings).toHaveLength(10);
    expect(standings.map((s) => s.rank)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    for (let i = 1; i < standings.length; i++) {
      expect(standings[i - 1].winPct).toBeGreaterThanOrEqual(standings[i].winPct);
    }
  });

  it("computes win percentage excluding draws", async () => {
    const [first] = await getStandings();
    expect(first.winPct).toBeCloseTo(first.wins / (first.wins + first.losses), 10);
  });

  it("gives the leader 0 games behind and computes the rest against it", async () => {
    const standings = await getStandings();
    const first = standings[0];
    expect(first.gamesBehind).toBe(0);
    const lg = standings.find((s) => s.isLg)!;
    expect(lg.gamesBehind).toBe(
      (first.wins - lg.wins + (lg.losses - first.losses)) / 2,
    );
  });

  it("has exactly one LG row that matches getStandingSummary", async () => {
    const [standings, summary] = await Promise.all([getStandings(), getStandingSummary()]);
    const lgRows = standings.filter((s) => s.isLg);
    expect(lgRows).toHaveLength(1);
    expect(lgRows[0]).toMatchObject({
      rank: summary!.rank,
      wins: summary!.wins,
      losses: summary!.losses,
      draws: summary!.draws,
    });
  });
});

describe("getTeamStats", () => {
  it("returns labelled stats", async () => {
    const stats = await getTeamStats();
    expect(stats.length).toBeGreaterThanOrEqual(6);
    for (const stat of stats) {
      expect(stat.label).not.toBe("");
      expect(stat.value).not.toBe("");
    }
  });
});

describe("getPlayerLeaders", () => {
  it("returns categories with 5 leaders each, including 타율", async () => {
    const categories = await getPlayerLeaders();
    expect(categories.map((c) => c.title)).toContain("타율");
    for (const category of categories) {
      expect(category.leaders).toHaveLength(5);
    }
  });

  it("uses only fictional names", async () => {
    const categories = await getPlayerLeaders();
    for (const category of categories) {
      for (const leader of category.leaders) {
        expect(leader.name).toMatch(/^선수 [A-Z]$/);
      }
    }
  });
});
```

- [ ] **Step 2: 실패 확인**

Run: `npx vitest run tests/lib/standings.test.ts`
Expected: FAIL (`getStandings` 등이 export되지 않음)

- [ ] **Step 3: 타입 추가**

`src/lib/types.ts` 맨 끝에 추가:

```ts

export type StandingRow = {
  team: string;
  wins: number;
  losses: number;
  draws: number;
};

export type StandingEntry = StandingRow & {
  rank: number;
  /** 승 / (승 + 패), 무승부 제외 */
  winPct: number;
  /** 1위 기준 게임차 */
  gamesBehind: number;
  isLg: boolean;
};

export type TeamStat = { label: string; value: string };

export type LeaderCategory = {
  title: string;
  leaders: { name: string; value: string }[];
};
```

- [ ] **Step 4: 더미 데이터 작성**

`src/data/standings.ts` 전체를 아래로 교체:

```ts
import type { StandingRow, StandingSummary } from "@/lib/types";

// DUMMY: 5단계(순위/기록)에서 실제 데이터로 교체한다.
export const DUMMY_STANDING: StandingSummary = {
  rank: 2,
  wins: 70,
  losses: 52,
  draws: 4,
};

// DUMMY: 구단명은 실제 KBO 구단이지만 승·패·무는 전부 가상 수치다.
// LG 트윈스 행은 위 DUMMY_STANDING과 반드시 같아야 한다(홈 화면과 불일치 방지).
export const DUMMY_STANDING_ROWS: StandingRow[] = [
  { team: "한화 이글스", wins: 74, losses: 49, draws: 3 },
  { team: "LG 트윈스", wins: 70, losses: 52, draws: 4 },
  { team: "삼성 라이온즈", wins: 68, losses: 55, draws: 3 },
  { team: "KT 위즈", wins: 65, losses: 58, draws: 3 },
  { team: "SSG 랜더스", wins: 63, losses: 60, draws: 3 },
  { team: "롯데 자이언츠", wins: 61, losses: 63, draws: 2 },
  { team: "NC 다이노스", wins: 59, losses: 64, draws: 3 },
  { team: "KIA 타이거즈", wins: 57, losses: 66, draws: 3 },
  { team: "두산 베어스", wins: 55, losses: 69, draws: 2 },
  { team: "키움 히어로즈", wins: 46, losses: 78, draws: 2 },
];
```

`src/data/teamStats.ts`:

```ts
import type { TeamStat } from "@/lib/types";

// DUMMY: 전부 가상 수치. 실제 팀 기록이 아니다.
export const DUMMY_TEAM_STATS: TeamStat[] = [
  { label: "팀 타율", value: "0.279" },
  { label: "팀 평균자책점", value: "3.98" },
  { label: "홈런", value: "118" },
  { label: "도루", value: "96" },
  { label: "세이브", value: "38" },
  { label: "실책", value: "71" },
];
```

`src/data/playerLeaders.ts`:

```ts
import type { LeaderCategory } from "@/lib/types";

// DUMMY: 이름·수치 모두 가상이다. 실제 선수와 무관하다.
export const DUMMY_LEADERS: LeaderCategory[] = [
  {
    title: "타율",
    leaders: [
      { name: "선수 A", value: "0.331" },
      { name: "선수 B", value: "0.324" },
      { name: "선수 C", value: "0.317" },
      { name: "선수 D", value: "0.309" },
      { name: "선수 E", value: "0.302" },
    ],
  },
  {
    title: "홈런",
    leaders: [
      { name: "선수 F", value: "31" },
      { name: "선수 G", value: "27" },
      { name: "선수 H", value: "24" },
      { name: "선수 I", value: "22" },
      { name: "선수 J", value: "19" },
    ],
  },
  {
    title: "타점",
    leaders: [
      { name: "선수 K", value: "104" },
      { name: "선수 L", value: "97" },
      { name: "선수 M", value: "91" },
      { name: "선수 N", value: "86" },
      { name: "선수 O", value: "80" },
    ],
  },
  {
    title: "승리",
    leaders: [
      { name: "선수 P", value: "14" },
      { name: "선수 Q", value: "13" },
      { name: "선수 R", value: "12" },
      { name: "선수 S", value: "11" },
      { name: "선수 T", value: "10" },
    ],
  },
  {
    title: "세이브",
    leaders: [
      { name: "선수 U", value: "32" },
      { name: "선수 V", value: "28" },
      { name: "선수 W", value: "24" },
      { name: "선수 X", value: "20" },
      { name: "선수 Y", value: "17" },
    ],
  },
];
```

- [ ] **Step 5: lib 함수 작성**

`src/lib/standings.ts` 전체를 교체:

```ts
import { DUMMY_STANDING, DUMMY_STANDING_ROWS } from "@/data/standings";
import { DUMMY_TEAM_STATS } from "@/data/teamStats";
import { DUMMY_LEADERS } from "@/data/playerLeaders";
import type {
  LeaderCategory,
  StandingEntry,
  StandingSummary,
  TeamStat,
} from "./types";

const LG_TEAM = "LG 트윈스";

export async function getStandingSummary(): Promise<StandingSummary | null> {
  return DUMMY_STANDING;
}

export async function getStandings(): Promise<StandingEntry[]> {
  const sorted = DUMMY_STANDING_ROWS.map((row) => ({
    ...row,
    winPct: row.wins / (row.wins + row.losses),
  })).sort((a, b) => b.winPct - a.winPct || b.wins - a.wins);

  const first = sorted[0];
  return sorted.map((row, index) => ({
    ...row,
    rank: index + 1,
    gamesBehind: (first.wins - row.wins + (row.losses - first.losses)) / 2,
    isLg: row.team === LG_TEAM,
  }));
}

export async function getTeamStats(): Promise<TeamStat[]> {
  return [...DUMMY_TEAM_STATS];
}

export async function getPlayerLeaders(): Promise<LeaderCategory[]> {
  return DUMMY_LEADERS.map((category) => ({
    ...category,
    leaders: [...category.leaders],
  }));
}
```

- [ ] **Step 6: 통과 확인 후 커밋**

Run: `npx vitest run tests/lib/standings.test.ts && npx tsc --noEmit`
Expected: 테스트 통과, 타입 에러 없음

```bash
git add src/lib/types.ts src/lib/standings.ts src/data/standings.ts src/data/teamStats.ts src/data/playerLeaders.ts tests/lib/standings.test.ts
git commit -m "feat: add standings, team stats, leaders dummy data and accessors"
```

---

### Task 2: StandingsTable 컴포넌트

**Files:**
- Create: `src/components/standings/StandingsTable.tsx`, `StandingsTable.module.css`
- Test: `tests/components/StandingsTable.test.tsx`

- [ ] **Step 1: 실패하는 테스트 작성**

```tsx
import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import StandingsTable from "@/components/standings/StandingsTable";
import type { StandingEntry } from "@/lib/types";

const entries: StandingEntry[] = [
  { rank: 1, team: "한화 이글스", wins: 74, losses: 49, draws: 3, winPct: 74 / 123, gamesBehind: 0, isLg: false },
  { rank: 2, team: "LG 트윈스", wins: 70, losses: 52, draws: 4, winPct: 70 / 122, gamesBehind: 3.5, isLg: true },
];

describe("StandingsTable", () => {
  it("renders a caption and one row per team plus the header", () => {
    render(<StandingsTable entries={entries} />);
    expect(screen.getByText("KBO 팀 순위")).toBeInTheDocument();
    expect(screen.getAllByRole("row")).toHaveLength(3);
  });

  it("formats win percentage and games behind", () => {
    render(<StandingsTable entries={entries} />);
    const lgRow = screen.getByRole("row", { name: /LG 트윈스/ });
    expect(within(lgRow).getByText(".574")).toBeInTheDocument();
    expect(within(lgRow).getByText("3.5")).toBeInTheDocument();
    const leaderRow = screen.getByRole("row", { name: /한화 이글스/ });
    expect(within(leaderRow).getByText(".602")).toBeInTheDocument();
    expect(within(leaderRow).getByText("-")).toBeInTheDocument();
  });

  it("marks only the LG row as current with a visible tag", () => {
    render(<StandingsTable entries={entries} />);
    expect(screen.getByRole("row", { name: /LG 트윈스/ })).toHaveAttribute(
      "aria-current",
      "true",
    );
    expect(screen.getByRole("row", { name: /한화 이글스/ })).not.toHaveAttribute(
      "aria-current",
    );
    expect(screen.getByText("우리팀")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: 실패 확인**

Run: `npx vitest run tests/components/StandingsTable.test.tsx`
Expected: FAIL (모듈 없음)

- [ ] **Step 3: 구현**

`src/components/standings/StandingsTable.tsx`:

```tsx
import type { StandingEntry } from "@/lib/types";
import styles from "./StandingsTable.module.css";

const formatPct = (value: number) => value.toFixed(3).replace(/^0/, "");
const formatGamesBehind = (value: number) => (value === 0 ? "-" : String(value));

export default function StandingsTable({ entries }: { entries: StandingEntry[] }) {
  return (
    <div className={styles.wrap}>
      <table className={styles.table}>
        <caption className={styles.caption}>KBO 팀 순위</caption>
        <thead>
          <tr>
            <th scope="col">순위</th>
            <th scope="col" className={styles.team}>팀</th>
            <th scope="col">승</th>
            <th scope="col">패</th>
            <th scope="col">무</th>
            <th scope="col">승률</th>
            <th scope="col">게임차</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr
              key={entry.team}
              className={entry.isLg ? styles.lg : undefined}
              aria-current={entry.isLg ? "true" : undefined}
            >
              <td>{entry.rank}</td>
              <th scope="row" className={styles.team}>
                {entry.team}
                {entry.isLg && <span className={styles.tag}>우리팀</span>}
              </th>
              <td>{entry.wins}</td>
              <td>{entry.losses}</td>
              <td>{entry.draws}</td>
              <td>{formatPct(entry.winPct)}</td>
              <td>{formatGamesBehind(entry.gamesBehind)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

`src/components/standings/StandingsTable.module.css`:

```css
.wrap {
  overflow-x: auto;
}
.table {
  width: 100%;
  border-collapse: collapse;
  font-variant-numeric: tabular-nums;
}
.caption {
  text-align: left;
  color: var(--muted);
  font-size: 0.9rem;
  padding-bottom: 12px;
}
.table th,
.table td {
  padding: 12px 8px;
  text-align: center;
  border-bottom: 1px solid var(--border);
  font-weight: 400;
}
.table thead th {
  color: var(--muted);
  font-size: 0.85rem;
}
.table th.team {
  text-align: left;
  font-weight: 700;
}
.lg {
  background: var(--surface-2);
  box-shadow: inset 3px 0 0 var(--red);
}
.tag {
  margin-left: 8px;
  padding: 2px 8px;
  border-radius: 999px;
  border: 1px solid var(--red-soft);
  color: var(--red-soft);
  font-size: 0.75rem;
  font-weight: 700;
}
```

- [ ] **Step 4: 통과 확인 후 커밋**

Run: `npx vitest run tests/components/StandingsTable.test.tsx`
Expected: 3 passed

```bash
git add src/components/standings/StandingsTable.tsx src/components/standings/StandingsTable.module.css tests/components/StandingsTable.test.tsx
git commit -m "feat: add StandingsTable component"
```

---

### Task 3: TeamStatsGrid 컴포넌트

**Files:**
- Create: `src/components/standings/TeamStatsGrid.tsx`, `TeamStatsGrid.module.css`
- Test: `tests/components/TeamStatsGrid.test.tsx`

- [ ] **Step 1: 실패하는 테스트 작성**

```tsx
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import TeamStatsGrid from "@/components/standings/TeamStatsGrid";

const stats = [
  { label: "팀 타율", value: "0.279" },
  { label: "홈런", value: "118" },
];

describe("TeamStatsGrid", () => {
  it("renders every stat label with its value", () => {
    render(<TeamStatsGrid stats={stats} />);
    expect(screen.getByText("팀 타율")).toBeInTheDocument();
    expect(screen.getByText("0.279")).toBeInTheDocument();
    expect(screen.getByText("홈런")).toBeInTheDocument();
    expect(screen.getByText("118")).toBeInTheDocument();
  });

  it("is labelled as the LG team record section", () => {
    render(<TeamStatsGrid stats={stats} />);
    expect(
      screen.getByRole("region", { name: "LG 트윈스 팀 기록" }),
    ).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: 실패 확인**

Run: `npx vitest run tests/components/TeamStatsGrid.test.tsx`
Expected: FAIL (모듈 없음)

- [ ] **Step 3: 구현**

`src/components/standings/TeamStatsGrid.tsx`:

```tsx
import type { TeamStat } from "@/lib/types";
import styles from "./TeamStatsGrid.module.css";

export default function TeamStatsGrid({ stats }: { stats: TeamStat[] }) {
  return (
    <section aria-label="LG 트윈스 팀 기록">
      <dl className={styles.grid}>
        {stats.map((stat) => (
          <div key={stat.label} className={styles.card}>
            <dt className={styles.label}>{stat.label}</dt>
            <dd className={styles.value}>{stat.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
```

`src/components/standings/TeamStatsGrid.module.css`:

```css
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 16px;
  margin: 0;
}
.card {
  padding: 20px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
}
.label {
  color: var(--muted);
  font-size: 0.9rem;
}
.value {
  margin: 8px 0 0;
  font-family: var(--font-display);
  font-size: 2.5rem;
  line-height: 1;
}
```

- [ ] **Step 4: 통과 확인 후 커밋**

Run: `npx vitest run tests/components/TeamStatsGrid.test.tsx`
Expected: 2 passed

```bash
git add src/components/standings/TeamStatsGrid.tsx src/components/standings/TeamStatsGrid.module.css tests/components/TeamStatsGrid.test.tsx
git commit -m "feat: add TeamStatsGrid component"
```

---

### Task 4: LeaderBoards 컴포넌트

**Files:**
- Create: `src/components/standings/LeaderBoards.tsx`, `LeaderBoards.module.css`
- Test: `tests/components/LeaderBoards.test.tsx`

- [ ] **Step 1: 실패하는 테스트 작성**

```tsx
import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import LeaderBoards from "@/components/standings/LeaderBoards";

const categories = [
  {
    title: "타율",
    leaders: [
      { name: "선수 A", value: "0.331" },
      { name: "선수 B", value: "0.324" },
    ],
  },
  { title: "홈런", leaders: [{ name: "선수 F", value: "31" }] },
];

describe("LeaderBoards", () => {
  it("renders a heading and an ordered list per category", () => {
    render(<LeaderBoards categories={categories} />);
    expect(screen.getByRole("heading", { name: "타율" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "홈런" })).toBeInTheDocument();
    expect(screen.getAllByRole("list")).toHaveLength(2);
  });

  it("lists leaders in the given order with their values", () => {
    render(<LeaderBoards categories={categories} />);
    const [firstList] = screen.getAllByRole("list");
    const items = within(firstList).getAllByRole("listitem");
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent("선수 A");
    expect(items[0]).toHaveTextContent("0.331");
    expect(items[1]).toHaveTextContent("선수 B");
  });

  it("shows a sample-data notice", () => {
    render(<LeaderBoards categories={categories} />);
    expect(screen.getByText(/가상의 샘플 데이터/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: 실패 확인**

Run: `npx vitest run tests/components/LeaderBoards.test.tsx`
Expected: FAIL (모듈 없음)

- [ ] **Step 3: 구현**

`src/components/standings/LeaderBoards.tsx`:

```tsx
import type { LeaderCategory } from "@/lib/types";
import styles from "./LeaderBoards.module.css";

export default function LeaderBoards({ categories }: { categories: LeaderCategory[] }) {
  return (
    <div>
      <p className={styles.notice}>
        선수 이름과 기록은 모두 가상의 샘플 데이터이며 실제 선수와 무관해요.
      </p>
      <div className={styles.grid}>
        {categories.map((category) => (
          <section key={category.title} className={styles.card}>
            <h3 className={styles.title}>{category.title}</h3>
            <ol className={styles.list}>
              {category.leaders.map((leader) => (
                <li key={leader.name} className={styles.row}>
                  <span>{leader.name}</span>
                  <span className={styles.value}>{leader.value}</span>
                </li>
              ))}
            </ol>
          </section>
        ))}
      </div>
    </div>
  );
}
```

`src/components/standings/LeaderBoards.module.css`:

```css
.notice {
  color: var(--muted);
  font-size: 0.9rem;
  margin-bottom: 20px;
}
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
}
.card {
  padding: 20px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
}
.title {
  margin: 0 0 12px;
  font-size: 1.1rem;
  color: var(--red-soft);
}
.list {
  margin: 0;
  padding-left: 24px;
}
.row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 6px 0;
  border-bottom: 1px solid var(--border);
}
.value {
  font-variant-numeric: tabular-nums;
  font-weight: 700;
}
```

- [ ] **Step 4: 통과 확인 후 커밋**

Run: `npx vitest run tests/components/LeaderBoards.test.tsx`
Expected: 3 passed

```bash
git add src/components/standings/LeaderBoards.tsx src/components/standings/LeaderBoards.module.css tests/components/LeaderBoards.test.tsx
git commit -m "feat: add LeaderBoards component"
```

---

### Task 5: StandingsExplorer (탭)

**Files:**
- Create: `src/components/standings/StandingsExplorer.tsx`, `StandingsExplorer.module.css`
- Test: `tests/components/StandingsExplorer.test.tsx`

- [ ] **Step 1: 실패하는 테스트 작성**

```tsx
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import StandingsExplorer from "@/components/standings/StandingsExplorer";
import type { StandingEntry } from "@/lib/types";

const standings: StandingEntry[] = [
  { rank: 1, team: "LG 트윈스", wins: 70, losses: 52, draws: 4, winPct: 70 / 122, gamesBehind: 0, isLg: true },
];
const teamStats = [{ label: "팀 타율", value: "0.279" }];
const leaders = [{ title: "타율", leaders: [{ name: "선수 A", value: "0.331" }] }];

function setup() {
  render(<StandingsExplorer standings={standings} teamStats={teamStats} leaders={leaders} />);
}

describe("StandingsExplorer", () => {
  it("shows the standings tab by default", () => {
    setup();
    expect(screen.getByRole("button", { name: "팀 순위" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(screen.queryByText("팀 타율")).not.toBeInTheDocument();
  });

  it("switches to the team stats tab", async () => {
    const user = userEvent.setup();
    setup();
    await user.click(screen.getByRole("button", { name: "팀 기록" }));
    expect(screen.getByRole("button", { name: "팀 기록" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("팀 타율")).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  it("switches to the player leaders tab", async () => {
    const user = userEvent.setup();
    setup();
    await user.click(screen.getByRole("button", { name: "선수 기록" }));
    expect(screen.getByRole("heading", { name: "타율" })).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: 실패 확인**

Run: `npx vitest run tests/components/StandingsExplorer.test.tsx`
Expected: FAIL (모듈 없음)

- [ ] **Step 3: 구현**

`src/components/standings/StandingsExplorer.tsx`:

```tsx
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
```

`src/components/standings/StandingsExplorer.module.css` (PositionTabs와 동일한 스타일):

```css
.tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 32px;
}
.tab {
  padding: 8px 16px;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--muted);
  font: inherit;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s, color 0.2s, border-color 0.2s;
}
.tab:hover {
  border-color: var(--red-soft);
  color: var(--text);
}
.tab[aria-pressed="true"] {
  background: var(--red);
  border-color: var(--red);
  color: #fff;
}
```

- [ ] **Step 4: 통과 확인 후 커밋**

Run: `npx vitest run tests/components/StandingsExplorer.test.tsx`
Expected: 3 passed

```bash
git add src/components/standings/StandingsExplorer.tsx src/components/standings/StandingsExplorer.module.css tests/components/StandingsExplorer.test.tsx
git commit -m "feat: add StandingsExplorer tabs"
```

---

### Task 6: /standings 페이지 + 내비 활성화

**Files:**
- Create: `src/app/standings/page.tsx`, `src/app/standings/page.module.css`
- Modify: `src/lib/nav.ts` (순위 항목)

- [ ] **Step 1: page.module.css 작성**

```css
.section {
  padding: 64px 0 96px;
}
.eyebrow {
  color: var(--red-soft);
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}
.heading {
  font-family: var(--font-display);
  font-size: clamp(2.5rem, 6vw, 4rem);
  font-weight: 400;
  margin: 8px 0 16px;
}
.notice {
  color: var(--muted);
  font-size: 0.9rem;
  margin-bottom: 32px;
}
.error {
  color: var(--muted);
}
```

- [ ] **Step 2: page.tsx 작성**

```tsx
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
```

- [ ] **Step 3: nav 활성화**

`src/lib/nav.ts`에서

```ts
  { label: "순위", href: "/standings", ready: false },
```

를 아래로 바꾼다:

```ts
  { label: "순위", href: "/standings", ready: true },
```

- [ ] **Step 4: 전체 검증 후 커밋**

Run: `npm test && npm run lint && npx tsc --noEmit && npm run build`
Expected: 전부 통과, 빌드 라우트 목록에 `/standings`가 보인다 (Header 테스트는 `NAV_ITEMS`에서 개수를 계산하므로 수정 불필요).

```bash
git add src/app/standings src/lib/nav.ts
git commit -m "feat: add /standings page and activate nav item"
```

---

### Task 7: 최종 검증

- [ ] **Step 1: 정적 검사**

Run: `npm run lint && npx tsc --noEmit && npm test && npm run build`
Expected: 전부 에러 없이 통과

- [ ] **Step 2: 홈 회귀 확인**

`npm run dev` 후 `/`의 "현재 순위"가 2위 · 70-52-4로 그대로이고, `/standings` 순위표의 LG 행이 같은 값(2위, 70/52/4)인지 확인한다.

- [ ] **Step 3: 브라우저 확인**

- `/standings`: 탭 3개 전환, 순위표에서 LG 행 강조 + "우리팀" 태그, 샘플 데이터 고지 표시
- 헤더의 "순위"가 "준비 중"이 아니고 클릭 가능
- 375px 폭에서 순위표가 잘 보이고 페이지 가로 스크롤 없음

- [ ] **Step 4: 마무리 커밋**

```bash
git status
git commit --allow-empty -m "chore: verify standings stage"
```
