# LG 트윈스 팬사이트 4단계 (경기 일정/결과 페이지) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `/schedule` 페이지에서 다가오는 5경기와 지난 10경기를 시간순(과거→미래) 세로 리스트로 보여준다.

**Architecture:** 기존 `src/data/games.ts`/`src/lib/games.ts`의 더미 경기 데이터를 확장한다. `dummyNextGame`을 `dummyUpcomingGames`로 일반화하고, `getRecentGames`에 `limit` 매개변수를 추가하며, 둘을 합쳐 시간순 배열을 만드는 `getSchedule`을 새로 추가한다. 홈페이지의 `NextGame`/`Summary` 컴포넌트와 `page.tsx`의 렌더링 구조는 건드리지 않고, 데이터 호출부만 개수를 명시하도록 한 줄 바꾼다. `/schedule` 페이지는 상태 없는 프레젠테이션 컴포넌트 2개(`ScheduleItem`, `ScheduleList`)로 구성한다 — 필터·탭이 없어 1~3단계보다 단순하다.

**Tech Stack:** Next.js (App Router), TypeScript, CSS Modules, Vitest + Testing Library

**Spec:** `docs/superpowers/specs/2026-09-29-lg-twins-schedule-design.md`

**작업 디렉터리:** `D:\DW_practice\LGtwins` (git 저장소, 현재 HEAD는 `3652474`)

---

## File Structure

```
src/
  lib/
    types.ts               # ScheduleEntry 유니언 타입 추가
    games.ts                 # getUpcomingGames() 추가, getNextGame() 리팩터링,
                              # getRecentGames(limit?) 매개변수 추가, getSchedule() 추가
  data/
    games.ts                  # dummyNextGame → dummyUpcomingGames로 일반화(5경기),
                              # DUMMY_RECENT_GAMES 5개 → 10개로 확장
  components/
    schedule/
      ScheduleItem.tsx / .module.css   # 항목 하나. kind별로 다르게 렌더링
      ScheduleList.tsx / .module.css    # ScheduleEntry[]를 세로 리스트로, 빈 배열 처리
  app/
    page.tsx                  # getRecentGames 호출부만 개수 명시하도록 수정
    schedule/
      page.tsx / page.module.css        # /schedule
tests/
  lib/
    data.test.ts             # games describe 블록 갱신 (기존 파일 수정)
  components/
    ScheduleItem.test.tsx
    ScheduleList.test.tsx
```

책임 경계:
- `data/games.ts`: 값과 "now 기준 상대 계산" 로직만 담당. 컴포넌트 구조를 모른다.
- `lib/games.ts`: 컴포넌트가 부르는 유일한 데이터 창구. `getNextGame()`은 `getUpcomingGames()`의 파생 함수, `getSchedule()`은 `getRecentGames()` + `getUpcomingGames()`의 파생 함수.
- `ScheduleItem`: 항목 하나를 `kind`에 따라 그리는 것만 안다.
- `ScheduleList`: 이미 정렬된 배열을 순서대로 그리는 것만 안다. 정렬 로직은 모른다(`lib/games.ts`의 `getSchedule()`이 이미 정렬해서 넘겨준다).

---

### Task 1: games 데이터 모델 확장 + 홈페이지 호출부 갱신

**Files:**
- Modify: `src/lib/types.ts`
- Modify: `src/data/games.ts`
- Modify: `src/lib/games.ts`
- Modify: `src/app/page.tsx`
- Modify: `tests/lib/data.test.ts`

- [ ] **Step 1: 타입 추가**

`src/lib/types.ts` 맨 끝에 다음을 추가한다 (기존 타입들은 그대로 둔다):

```ts
export type ScheduleEntry =
  | { kind: "upcoming"; id: string; opponent: string; venue: string; startsAt: string }
  | { kind: "past"; id: string; opponent: string; date: string; result: "W" | "L" | "D"; score: string };
```

- [ ] **Step 2: 실패하는 방향으로 테스트부터 수정**

`tests/lib/data.test.ts`에서 다음 import 줄을 찾는다:

```ts
import { getNextGame, getRecentGames } from "@/lib/games";
```

다음으로 바꾼다:

```ts
import { getNextGame, getRecentGames, getSchedule, getUpcomingGames } from "@/lib/games";
```

그리고 파일 안의 다음 블록을:

```ts
describe("games", () => {
  it("getNextGame returns a game that starts after now", async () => {
    const now = new Date("2026-09-20T03:00:00Z");
    const game = await getNextGame(now);
    expect(game).not.toBeNull();
    expect(new Date(game!.startsAt).getTime()).toBeGreaterThan(now.getTime());
  });

  it("getRecentGames returns 5 results with valid result codes", async () => {
    const games = await getRecentGames();
    expect(games).toHaveLength(5);
    for (const g of games) expect(["W", "L", "D"]).toContain(g.result);
  });
});
```

다음으로 교체한다:

```ts
describe("games", () => {
  it("getUpcomingGames returns 5 games all starting after now", async () => {
    const now = new Date("2026-09-20T03:00:00Z");
    const games = await getUpcomingGames(now);
    expect(games).toHaveLength(5);
    for (const g of games) {
      expect(new Date(g.startsAt).getTime()).toBeGreaterThan(now.getTime());
    }
  });

  it("getNextGame returns the first upcoming game", async () => {
    const now = new Date("2026-09-20T03:00:00Z");
    const [next, upcoming] = await Promise.all([
      getNextGame(now),
      getUpcomingGames(now),
    ]);
    expect(next).not.toBeNull();
    expect(next).toEqual(upcoming[0]);
  });

  it("getRecentGames returns all 10 results by default, with valid result codes", async () => {
    const games = await getRecentGames();
    expect(games).toHaveLength(10);
    for (const g of games) expect(["W", "L", "D"]).toContain(g.result);
  });

  it("getRecentGames returns only the requested number when a limit is given", async () => {
    const games = await getRecentGames(5);
    expect(games).toHaveLength(5);
  });

  it("getSchedule returns 15 entries: 10 past (chronological) then 5 upcoming", async () => {
    const now = new Date("2026-09-20T03:00:00Z");
    const entries = await getSchedule(now);
    expect(entries).toHaveLength(15);
    expect(entries.slice(0, 10).every((e) => e.kind === "past")).toBe(true);
    expect(entries.slice(10).every((e) => e.kind === "upcoming")).toBe(true);

    const pastDates = entries.slice(0, 10).map((e) => (e as { date: string }).date);
    expect(pastDates).toEqual([...pastDates].sort());
  });
});
```

- [ ] **Step 3: 실패 확인**

Run: `npx vitest run tests/lib/data.test.ts`
Expected: FAIL (`getUpcomingGames`/`getSchedule`이 `@/lib/games`에서 export되지 않음)

- [ ] **Step 4: data/games.ts 수정**

`src/data/games.ts` 전체를 다음으로 교체한다:

```ts
import type { Game, GameResult } from "@/lib/types";

// DUMMY: 4단계에서 실제 데이터로 교체한다. "now" 기준 상대적으로 계산해
// 시간이 지나도 날짜가 어색해지지 않는다. 첫 항목은 기존 dummyNextGame과
// 동일한 내용(두산 베어스, 잠실야구장, 내일 18:30)을 유지한다.
export function dummyUpcomingGames(now: Date): Game[] {
  const schedule: Array<{ offsetDays: number; opponent: string; venue: string }> = [
    { offsetDays: 1, opponent: "두산 베어스", venue: "잠실야구장" },
    { offsetDays: 3, opponent: "KT 위즈", venue: "잠실야구장" },
    { offsetDays: 5, opponent: "SSG 랜더스", venue: "문학야구장" },
    { offsetDays: 7, opponent: "키움 히어로즈", venue: "고척스카이돔" },
    { offsetDays: 9, opponent: "NC 다이노스", venue: "창원NC파크" },
  ];

  return schedule.map(({ offsetDays, opponent, venue }, index) => {
    const startsAt = new Date(now);
    startsAt.setUTCDate(startsAt.getUTCDate() + offsetDays);
    startsAt.setUTCHours(9, 30, 0, 0);
    return {
      id: `dummy-upcoming-${index}`,
      opponent,
      startsAt: startsAt.toISOString(),
      venue,
    };
  });
}

// DUMMY: 4단계에서 실제 데이터로 교체한다.
export const DUMMY_RECENT_GAMES: GameResult[] = [
  { id: "d1", opponent: "KIA", date: "2026-09-19", result: "W", score: "5:3" },
  { id: "d2", opponent: "KIA", date: "2026-09-18", result: "W", score: "7:2" },
  { id: "d3", opponent: "삼성", date: "2026-09-16", result: "L", score: "1:4" },
  { id: "d4", opponent: "삼성", date: "2026-09-15", result: "W", score: "6:5" },
  { id: "d5", opponent: "롯데", date: "2026-09-14", result: "D", score: "3:3" },
  { id: "d6", opponent: "롯데", date: "2026-09-12", result: "W", score: "4:2" },
  { id: "d7", opponent: "NC", date: "2026-09-11", result: "L", score: "2:6" },
  { id: "d8", opponent: "NC", date: "2026-09-09", result: "W", score: "3:1" },
  { id: "d9", opponent: "키움", date: "2026-09-08", result: "W", score: "8:4" },
  { id: "d10", opponent: "키움", date: "2026-09-06", result: "D", score: "2:2" },
];
```

- [ ] **Step 5: lib/games.ts 수정**

`src/lib/games.ts` 전체를 다음으로 교체한다:

```ts
import { DUMMY_RECENT_GAMES, dummyUpcomingGames } from "@/data/games";
import type { Game, GameResult, ScheduleEntry } from "./types";

export async function getUpcomingGames(now: Date = new Date()): Promise<Game[]> {
  return dummyUpcomingGames(now);
}

export async function getNextGame(now: Date = new Date()): Promise<Game | null> {
  const games = await getUpcomingGames(now);
  return games[0] ?? null;
}

export async function getRecentGames(limit?: number): Promise<GameResult[]> {
  if (limit === undefined) return DUMMY_RECENT_GAMES;
  return DUMMY_RECENT_GAMES.slice(0, limit);
}

export async function getSchedule(now: Date = new Date()): Promise<ScheduleEntry[]> {
  const [upcoming, past] = await Promise.all([
    getUpcomingGames(now),
    getRecentGames(),
  ]);

  const pastEntries: ScheduleEntry[] = [...past].reverse().map((game) => ({
    kind: "past",
    id: game.id,
    opponent: game.opponent,
    date: game.date,
    result: game.result,
    score: game.score,
  }));

  const upcomingEntries: ScheduleEntry[] = upcoming.map((game) => ({
    kind: "upcoming",
    id: game.id,
    opponent: game.opponent,
    venue: game.venue,
    startsAt: game.startsAt,
  }));

  return [...pastEntries, ...upcomingEntries];
}
```

- [ ] **Step 6: 홈페이지 호출부 수정**

`src/app/page.tsx`에서 다음 줄을:

```tsx
    safe(getRecentGames),
```

다음으로 바꾼다:

```tsx
    safe(() => getRecentGames(5)),
```

(이 파일의 다른 부분은 건드리지 않는다 — `NextGame`/`Summary` 렌더링 조건, `nextGame`/`recent` 변수명 등은 그대로 유지된다.)

- [ ] **Step 7: 통과 확인 후 커밋**

Run: `npm test`
Expected: 59 passed (기존 56 - 옛 games 테스트 2개 + 새 games 테스트 5개)

Run: `npm run lint && npx tsc --noEmit && npm run build`
Expected: 전부 통과

```bash
git add -A
git commit -m "feat: extend game schedule data model with upcoming/schedule accessors"
```
(커밋 메시지 끝에 `Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>` 트레일러를 붙인다)

## Before You Begin (Task 1)
`src/app/page.tsx`를 수정할 때 `safe(getRecentGames)` 한 줄만 정확히 찾아서 바꾼다. 이 파일의 나머지 부분(`nextGame`, `standing`, `players`, `titles` 관련 코드)은 이번 태스크와 무관하니 손대지 않는다.

---

### Task 2: ScheduleItem 컴포넌트

**Files:**
- Create: `src/components/schedule/ScheduleItem.tsx`, `ScheduleItem.module.css`
- Test: `tests/components/ScheduleItem.test.tsx`

- [ ] **Step 1: 실패 테스트 작성**

`tests/components/ScheduleItem.test.tsx`:

```tsx
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import ScheduleItem from "@/components/schedule/ScheduleItem";

describe("ScheduleItem", () => {
  it("renders an upcoming game with a 예정 badge", () => {
    render(
      <ScheduleItem
        entry={{
          kind: "upcoming",
          id: "u1",
          opponent: "두산 베어스",
          venue: "잠실야구장",
          startsAt: "2026-09-30T09:30:00.000Z",
        }}
      />,
    );
    expect(screen.getByText("예정")).toBeInTheDocument();
    expect(screen.getByText("LG vs 두산 베어스")).toBeInTheDocument();
    expect(screen.getByText(/잠실야구장/)).toBeInTheDocument();
  });

  it("renders a past game with its result badge and score", () => {
    render(
      <ScheduleItem
        entry={{
          kind: "past",
          id: "p1",
          opponent: "KIA",
          date: "2026-09-19",
          result: "W",
          score: "5:3",
        }}
      />,
    );
    expect(screen.getByText("승")).toBeInTheDocument();
    expect(screen.getByText("LG vs KIA")).toBeInTheDocument();
    expect(screen.getByText(/5:3/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: 실패 확인**

Run: `npx vitest run tests/components/ScheduleItem.test.tsx`
Expected: FAIL (모듈 없음)

- [ ] **Step 3: 구현**

`src/components/schedule/ScheduleItem.module.css`:

```css
.item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
}
.badge {
  flex-shrink: 0;
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  font-weight: 900;
  font-size: 0.85rem;
  color: var(--red-soft);
  border: 1px solid var(--border);
}
.W {
  background: var(--red);
  color: #fff;
  border-color: var(--red);
}
.L {
  background: var(--surface-2);
  color: var(--muted);
  border-color: var(--surface-2);
}
.D {
  background: transparent;
  color: var(--muted);
}
.opponent {
  color: var(--text);
  font-weight: 700;
}
.meta {
  color: var(--muted);
  font-size: 0.9rem;
  margin-top: 2px;
}
```

`src/components/schedule/ScheduleItem.tsx`:

```tsx
import type { ScheduleEntry } from "@/lib/types";
import styles from "./ScheduleItem.module.css";

const RESULT_LABEL = { W: "승", L: "패", D: "무" } as const;

const dateTimeFormatter = new Intl.DateTimeFormat("ko-KR", {
  dateStyle: "long",
  timeStyle: "short",
  timeZone: "Asia/Seoul",
});

const dateFormatter = new Intl.DateTimeFormat("ko-KR", {
  dateStyle: "long",
  timeZone: "Asia/Seoul",
});

export default function ScheduleItem({ entry }: { entry: ScheduleEntry }) {
  if (entry.kind === "upcoming") {
    return (
      <li className={styles.item}>
        <span className={styles.badge}>예정</span>
        <div>
          <p className={styles.opponent}>LG vs {entry.opponent}</p>
          <p className={styles.meta}>
            {dateTimeFormatter.format(new Date(entry.startsAt))} · {entry.venue}
          </p>
        </div>
      </li>
    );
  }

  return (
    <li className={styles.item}>
      <span className={`${styles.badge} ${styles[entry.result]}`}>
        {RESULT_LABEL[entry.result]}
      </span>
      <div>
        <p className={styles.opponent}>LG vs {entry.opponent}</p>
        <p className={styles.meta}>
          {dateFormatter.format(new Date(entry.date))} · {entry.score}
        </p>
      </div>
    </li>
  );
}
```

- [ ] **Step 4: 통과 확인 후 커밋**

Run: `npm test`
Expected: 61 passed

```bash
git add -A
git commit -m "feat: add ScheduleItem component"
```
(커밋 메시지 끝에 Co-Authored-By 트레일러)

---

### Task 3: ScheduleList 컴포넌트

**Files:**
- Create: `src/components/schedule/ScheduleList.tsx`, `ScheduleList.module.css`
- Test: `tests/components/ScheduleList.test.tsx`

- [ ] **Step 1: 실패 테스트 작성**

`tests/components/ScheduleList.test.tsx`:

```tsx
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import ScheduleList from "@/components/schedule/ScheduleList";

describe("ScheduleList", () => {
  it("renders one item per entry in the given order", () => {
    render(
      <ScheduleList
        entries={[
          { kind: "past", id: "p1", opponent: "KIA", date: "2026-09-19", result: "W", score: "5:3" },
          {
            kind: "upcoming",
            id: "u1",
            opponent: "두산 베어스",
            venue: "잠실야구장",
            startsAt: "2026-09-30T09:30:00.000Z",
          },
        ]}
      />,
    );
    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent("KIA");
    expect(items[1]).toHaveTextContent("두산 베어스");
  });

  it("shows an empty-state message when there are no entries", () => {
    render(<ScheduleList entries={[]} />);
    expect(screen.getByText("일정 정보가 없어요.")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: 실패 확인**

Run: `npx vitest run tests/components/ScheduleList.test.tsx`
Expected: FAIL (모듈 없음)

- [ ] **Step 3: 구현**

`src/components/schedule/ScheduleList.module.css`:

```css
.list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.empty {
  color: var(--muted);
}
```

`src/components/schedule/ScheduleList.tsx`:

```tsx
import type { ScheduleEntry } from "@/lib/types";
import ScheduleItem from "./ScheduleItem";
import styles from "./ScheduleList.module.css";

export default function ScheduleList({ entries }: { entries: ScheduleEntry[] }) {
  if (entries.length === 0) {
    return <p className={styles.empty}>일정 정보가 없어요.</p>;
  }

  return (
    <ol className={styles.list}>
      {entries.map((entry) => (
        <ScheduleItem key={entry.id} entry={entry} />
      ))}
    </ol>
  );
}
```

- [ ] **Step 4: 통과 확인 후 커밋**

Run: `npm test`
Expected: 63 passed

```bash
git add -A
git commit -m "feat: add ScheduleList component"
```
(커밋 메시지 끝에 Co-Authored-By 트레일러)

---

### Task 4: /schedule 페이지 라우트

**Files:**
- Create: `src/app/schedule/page.tsx`, `src/app/schedule/page.module.css`

- [ ] **Step 1: page.module.css 작성**

`src/app/schedule/page.module.css`:

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
  margin: 8px 0 40px;
}
.error {
  color: var(--muted);
}
```

- [ ] **Step 2: page.tsx 작성**

`src/app/schedule/page.tsx`:

```tsx
import type { Metadata } from "next";
import ScheduleList from "@/components/schedule/ScheduleList";
import { getSchedule } from "@/lib/games";
import { safe } from "@/lib/safe";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "경기 일정",
  description: "LG 트윈스의 다가오는 경기와 최근 결과를 한눈에 확인하세요.",
};

// 더미 경기 일정이 빌드 시점에 고정되지 않도록 1분마다 재생성한다.
export const revalidate = 60;

export default async function SchedulePage() {
  const entries = await safe(getSchedule);

  return (
    <section
      className={`container ${styles.section}`}
      aria-labelledby="schedule-page-title"
    >
      <p className={styles.eyebrow}>Schedule</p>
      <h1 id="schedule-page-title" className={styles.heading}>
        경기 일정
      </h1>
      {entries ? (
        <ScheduleList entries={entries} />
      ) : (
        <p className={styles.error}>일정 정보를 불러오지 못했어요.</p>
      )}
    </section>
  );
}
```

주의: `entries`가 빈 배열([])인 경우에도 `ScheduleList`가 자체적으로 "일정 정보가 없어요." 안내를 보여주므로, 페이지에서는 `null`(실패)과 빈 배열(정상이지만 데이터 없음)을 구분해 `entries ? ... : ...`로만 처리한다(`entries && entries.length > 0` 형태로 쓰지 않는다 — 1단계 `/history`와 달리 이번엔 빈 배열도 `ScheduleList`에 그대로 넘겨 그 안에서 처리하게 한다).

- [ ] **Step 3: 빌드 확인 후 커밋**

Run: `npm run build`
Expected: 성공, 라우트 목록에 `/schedule` 포함

```bash
git add -A
git commit -m "feat: add /schedule page route"
```
(커밋 메시지 끝에 Co-Authored-By 트레일러)

---

### Task 5: 내비게이션 연결 (nav.ts)

**Files:**
- Modify: `src/lib/nav.ts`

- [ ] **Step 1: 일정 항목 활성화**

`src/lib/nav.ts`에서 다음 줄을:

```ts
  { label: "일정", href: "/schedule", ready: false },
```

다음으로 바꾼다:

```ts
  { label: "일정", href: "/schedule", ready: true },
```

- [ ] **Step 2: 전체 테스트 통과 확인 후 커밋**

Run: `npm test`
Expected: 63 passed (Header.test.tsx는 `NAV_ITEMS.filter(i => !i.ready).length`를 동적으로 계산하므로 수정 없이 그대로 통과한다)

Run: `npm run lint && npx tsc --noEmit && npm run build`
Expected: 전부 통과

```bash
git add -A
git commit -m "feat: activate schedule nav item"
```
(커밋 메시지 끝에 Co-Authored-By 트레일러)

---

### Task 6: 최종 검증

**Files:** 없음 (검증만, 문제 발견 시 해당 파일 수정)

- [ ] **Step 1: 정적 검사**

```bash
npm run lint
npx tsc --noEmit
npm test
npm run build
```

Expected: 전부 에러 없이 통과, 테스트 63개 통과

- [ ] **Step 2: 데이터 실패 격리 확인**

`src/lib/games.ts`의 `getSchedule` 본문 맨 앞에 임시로 `throw new Error("test");`를 추가하고 `npm run build && npm start`(3000번 포트가 이미 쓰이고 있다면 `PORT=3001 npm start`) 후 확인한다.

- `/schedule`: 크래시 없이 "일정 정보를 불러오지 못했어요." 문구만 보인다.
- `/`(홈페이지): `getSchedule()`은 홈페이지가 쓰지 않으므로(홈페이지는 여전히 `getNextGame()`/`getRecentGames(5)`를 직접 부른다) 전혀 영향받지 않고 정상 작동한다. 이를 통해 `/schedule` 전용 함수의 실패가 홈페이지로 번지지 않는다는 걸 확인한다.

확인 후 서버를 끄고 원래 코드로 되돌린다 (`git diff`가 비어야 한다).

- [ ] **Step 3: 브라우저로 직접 확인**

`npm run dev` (또는 이미 떠 있는 서버)로 확인한다:

- `/schedule`: 지난 10경기(오래된 순, 승/패/무 뱃지 + 스코어)와 다가오는 5경기(예정 뱃지 + 날짜·시간·구장)가 순서대로 쭉 보임
- 헤더 메뉴에서 "일정" 항목이 더 이상 "준비 중"이 아니고 실제로 클릭 가능함
- 홈페이지의 "다음 경기" 카운트다운과 "요즘 트윈스" 최근 5경기 표시가 이전과 똑같이 정상 작동함(회귀 없음)
- 모바일 폭(375px)에서 리스트 항목이 줄바꿈되며 가로 스크롤 없음
- 키보드 Tab으로 페이지 탐색 시 이상 없음(이 페이지엔 링크·버튼이 없어 포커스 이동 테스트는 헤더/푸터 수준에서만 확인)

- [ ] **Step 4: 마무리 커밋**

```bash
git status
git add -A
git commit -m "chore: verify schedule stage" --allow-empty
```
