# LG 트윈스 팬사이트 1단계 (역사/우승 기록 페이지) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `/history` 페이지에서 LG 트윈스의 창단부터 현재까지 주요 연혁을 카테고리 필터가 있는 세로 타임라인으로 보여주고, 메인 페이지와 내비게이션을 실제 링크로 연결한다.

**Architecture:** `src/data/history.ts`에 검증된 연혁 데이터(`HISTORY_EVENTS`)를 두고, `src/lib/history.ts`의 `getHistoryEvents()`가 유일한 접근 창구가 된다. 기존 메인 페이지용 `getChampionships()`는 이 함수를 내부적으로 재사용하도록 리팩터링해 데이터 중복을 없앤다. UI는 서버 컴포넌트인 `page.tsx`가 데이터를 가져와 클라이언트 컴포넌트 `HistoryExplorer`(필터 상태 보유)에 넘기고, `HistoryExplorer`가 `CategoryFilter`와 `Timeline`을 조합한다. 스크롤 등장 애니메이션은 기존 `useScrollReveal` 훅을 그대로 재사용한다.

**Tech Stack:** Next.js (App Router), TypeScript, CSS Modules, GSAP(재사용), Vitest + Testing Library

**Spec:** `docs/superpowers/specs/2026-09-25-lg-twins-history-design.md`

**작업 디렉터리:** `D:\DW_practice` (git 저장소, 현재 HEAD는 `46d9970`)

**검증된 연혁 데이터** (사용자 검수 완료 — 확신도 낮은 준우승 연도·역대 감독 이력은 이번 단계에 포함하지 않는다):

| 연도 | 카테고리 | 제목 | 설명 |
|---|---|---|---|
| 1982 | 창단 | MBC 청룡 창단 | KBO 원년 6개 구단 중 하나로 창단, 잠실야구장을 홈구장으로 사용 |
| 1990 | 창단 | LG 트윈스로 재출범 | LG그룹이 MBC 청룡을 인수하며 구단명을 LG 트윈스로 변경 |
| 1990 | 우승 | 한국시리즈 우승 | (설명 없음) |
| 1994 | 우승 | 한국시리즈 우승 | (설명 없음) |
| 2023 | 우승 | 한국시리즈 우승 | 29년 만의 통산 3번째 우승 |

---

## File Structure

```
src/
  lib/
    types.ts              # HistoryCategory, HistoryEvent 타입 추가 (Championship은 그대로 둠)
    history.ts             # getHistoryEvents() 추가, getChampionships()는 이를 재사용하도록 리팩터링, HISTORY_CATEGORIES 상수 추가
  data/
    history.ts              # CHAMPIONSHIPS → HISTORY_EVENTS로 교체
  components/
    history/
      EventBadge.tsx / .module.css        # 카테고리 뱃지 (프레젠테이션)
      CategoryFilter.tsx / .module.css     # 필터 버튼 그룹 (클라이언트, 상태 없음 — 부모가 상태 보유)
      Timeline.tsx / .module.css           # 세로 타임라인 (클라이언트, useScrollReveal)
      HistoryExplorer.tsx                  # 필터 상태를 보유하고 CategoryFilter+Timeline을 조합 (클라이언트)
    home/
      HistoryPreview.tsx / .module.css    # "전체 역사 보기"를 실제 링크로 교체 (기존 파일 수정)
  app/
    history/
      page.tsx / page.module.css          # /history 라우트
tests/
  lib/
    data.test.ts            # history describe 블록 교체 (기존 파일 수정)
  components/
    EventBadge.test.tsx
    CategoryFilter.test.tsx
    Timeline.test.tsx
    HistoryExplorer.test.tsx
    HistoryPreview.test.tsx  # "준비 중" 검증 테스트를 실제 링크 검증으로 교체 (기존 파일 수정)
```

책임 경계:
- `data/history.ts`: 값만 보관. 로직 없음.
- `lib/history.ts`: 컴포넌트가 부르는 유일한 데이터 창구. `getChampionships()`는 `getHistoryEvents()`의 파생 함수.
- `EventBadge`: 카테고리 하나를 뱃지로 그리는 것만 안다. 필터나 타임라인을 모른다.
- `CategoryFilter`: 선택 상태를 표시하고 클릭을 부모에 알리기만 한다. 필터링 로직 자체는 모른다(상태 없는 프레젠테이션 + 콜백).
- `Timeline`: 이미 필터링된 배열을 받아 그리기만 한다. 필터가 어떻게 정해졌는지 모른다.
- `HistoryExplorer`: 유일하게 필터 상태를 보유하는 곳. `page.tsx`는 데이터 가져오기만 하고 상태는 모른다(서버 컴포넌트 유지를 위해).

---

### Task 1: 데이터 모델 + history lib 리팩터링

**Files:**
- Modify: `src/lib/types.ts`
- Modify: `src/data/history.ts`
- Modify: `src/lib/history.ts`
- Modify: `tests/lib/data.test.ts`

- [ ] **Step 1: 타입 추가 (실패 없는 순수 추가라 먼저 진행)**

`src/lib/types.ts`에 다음을 추가한다 (기존 `Championship` 타입 등은 그대로 둔다):

```ts
export type HistoryCategory = "우승" | "준우승" | "창단" | "감독" | "기록";

export type HistoryEvent = {
  year: number;
  category: HistoryCategory;
  title: string;
  description?: string;
};
```

- [ ] **Step 2: data.test.ts의 history 블록을 새 기대값으로 교체 (실패 확인용)**

`tests/lib/data.test.ts`에서 다음 import 줄을 찾는다:

```ts
import { getChampionships } from "@/lib/history";
```

이를 다음으로 바꾼다:

```ts
import { getChampionships, getHistoryEvents } from "@/lib/history";
```

그리고 파일 안의 다음 블록을:

```ts
describe("history", () => {
  it("getChampionships returns unique years in ascending order", async () => {
    const titles = await getChampionships();
    const years = titles.map((t) => t.year);
    expect(years).toEqual([...years].sort((a, b) => a - b));
    expect(new Set(years).size).toBe(years.length);
  });
});
```

다음으로 교체한다:

```ts
describe("history", () => {
  it("getHistoryEvents returns all events in ascending year order", async () => {
    const events = await getHistoryEvents();
    const years = events.map((e) => e.year);
    expect(years).toEqual([...years].sort((a, b) => a - b));
    expect(events.length).toBeGreaterThan(0);
  });

  it("getChampionships returns only 우승 events, unique ascending years", async () => {
    const titles = await getChampionships();
    const years = titles.map((t) => t.year);
    expect(years).toEqual([...years].sort((a, b) => a - b));
    expect(new Set(years).size).toBe(years.length);
    expect(years).toEqual([1990, 1994, 2023]);
  });
});
```

- [ ] **Step 3: 실패 확인**

Run: `npx vitest run tests/lib/data.test.ts`
Expected: FAIL (`getHistoryEvents` is not exported from `@/lib/history`)

- [ ] **Step 4: data/history.ts를 검증된 연혁으로 교체**

`src/data/history.ts` 전체를 다음으로 교체한다:

```ts
import type { HistoryEvent } from "@/lib/types";

// 2026-09-25 사용자 검증 완료. 확신도 낮은 항목(준우승 연도, 역대 감독 이력)은
// 검증 전까지 넣지 않는다 — 프로젝트 규칙: 불확실한 사실 정보는 넣지 않는다.
export const HISTORY_EVENTS: HistoryEvent[] = [
  {
    year: 1982,
    category: "창단",
    title: "MBC 청룡 창단",
    description: "KBO 원년 6개 구단 중 하나로 창단, 잠실야구장을 홈구장으로 사용",
  },
  {
    year: 1990,
    category: "창단",
    title: "LG 트윈스로 재출범",
    description: "LG그룹이 MBC 청룡을 인수하며 구단명을 LG 트윈스로 변경",
  },
  { year: 1990, category: "우승", title: "한국시리즈 우승" },
  { year: 1994, category: "우승", title: "한국시리즈 우승" },
  {
    year: 2023,
    category: "우승",
    title: "한국시리즈 우승",
    description: "29년 만의 통산 3번째 우승",
  },
];
```

- [ ] **Step 5: lib/history.ts에 getHistoryEvents() 추가, getChampionships() 리팩터링**

`src/lib/history.ts` 전체를 다음으로 교체한다:

```ts
import { HISTORY_EVENTS } from "@/data/history";
import type { Championship, HistoryCategory, HistoryEvent } from "./types";

export const HISTORY_CATEGORIES: HistoryCategory[] = [
  "우승",
  "준우승",
  "창단",
  "감독",
  "기록",
];

export async function getHistoryEvents(): Promise<HistoryEvent[]> {
  return HISTORY_EVENTS;
}

export async function getChampionships(): Promise<Championship[]> {
  const events = await getHistoryEvents();
  return events
    .filter((event) => event.category === "우승")
    .map((event) => ({ year: event.year }));
}
```

- [ ] **Step 6: 통과 확인 후 커밋**

Run: `npm test`
Expected: 25 passed (기존 24 - 옛 history 테스트 1개 + 새 history 테스트 2개)

```bash
git add -A
git commit -m "feat: add history events data model and refactor championships accessor"
```
(커밋 메시지 끝에 `Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>` 트레일러를 붙인다)

---

### Task 2: EventBadge 컴포넌트

**Files:**
- Create: `src/components/history/EventBadge.tsx`, `EventBadge.module.css`
- Test: `tests/components/EventBadge.test.tsx`

- [ ] **Step 1: 실패 테스트 작성**

`tests/components/EventBadge.test.tsx`:

```tsx
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import EventBadge from "@/components/history/EventBadge";

describe("EventBadge", () => {
  it("renders the category text", () => {
    render(<EventBadge category="창단" />);
    expect(screen.getByText("창단")).toBeInTheDocument();
  });

  it("highlights the 우승 category", () => {
    render(<EventBadge category="우승" />);
    expect(screen.getByText("우승").className).toMatch(/highlight/);
  });

  it("does not highlight other categories", () => {
    render(<EventBadge category="감독" />);
    expect(screen.getByText("감독").className).not.toMatch(/highlight/);
  });
});
```

- [ ] **Step 2: 실패 확인**

Run: `npx vitest run tests/components/EventBadge.test.tsx`
Expected: FAIL (모듈 없음)

- [ ] **Step 3: 구현**

`src/components/history/EventBadge.module.css`:

```css
.badge {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 999px;
  border: 1px solid var(--border);
  color: var(--muted);
  font-size: 0.75rem;
  font-weight: 700;
}
.highlight {
  border-color: var(--red);
  background: var(--red);
  color: #fff;
}
```

`src/components/history/EventBadge.tsx`:

```tsx
import type { HistoryCategory } from "@/lib/types";
import styles from "./EventBadge.module.css";

export default function EventBadge({ category }: { category: HistoryCategory }) {
  const highlight = category === "우승";
  return (
    <span className={`${styles.badge} ${highlight ? styles.highlight : ""}`}>
      {category}
    </span>
  );
}
```

- [ ] **Step 4: 통과 확인 후 커밋**

Run: `npm test`
Expected: 28 passed

```bash
git add -A
git commit -m "feat: add EventBadge component for history categories"
```

---

### Task 3: CategoryFilter 컴포넌트

**Files:**
- Create: `src/components/history/CategoryFilter.tsx`, `CategoryFilter.module.css`
- Test: `tests/components/CategoryFilter.test.tsx`

- [ ] **Step 1: 실패 테스트 작성**

`tests/components/CategoryFilter.test.tsx`:

```tsx
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CategoryFilter from "@/components/history/CategoryFilter";

describe("CategoryFilter", () => {
  it("renders 전체 plus every history category", () => {
    render(<CategoryFilter selected="전체" onSelect={() => {}} />);
    for (const label of ["전체", "우승", "준우승", "창단", "감독", "기록"]) {
      expect(screen.getByRole("button", { name: label })).toBeInTheDocument();
    }
  });

  it("marks the selected option as pressed", () => {
    render(<CategoryFilter selected="우승" onSelect={() => {}} />);
    expect(screen.getByRole("button", { name: "우승" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: "전체" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  it("calls onSelect with the clicked category", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<CategoryFilter selected="전체" onSelect={onSelect} />);
    await user.click(screen.getByRole("button", { name: "감독" }));
    expect(onSelect).toHaveBeenCalledWith("감독");
  });
});
```

- [ ] **Step 2: 실패 확인**

Run: `npx vitest run tests/components/CategoryFilter.test.tsx`
Expected: FAIL (모듈 없음)

- [ ] **Step 3: 구현**

`src/components/history/CategoryFilter.module.css`:

```css
.filter {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 32px;
}
.chip {
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
.chip:hover {
  border-color: var(--red-soft);
  color: var(--text);
}
.chip[aria-pressed="true"] {
  background: var(--red);
  border-color: var(--red);
  color: #fff;
}
```

`src/components/history/CategoryFilter.tsx`:

```tsx
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
```

- [ ] **Step 4: 통과 확인 후 커밋**

Run: `npm test`
Expected: 31 passed

```bash
git add -A
git commit -m "feat: add CategoryFilter component"
```

---

### Task 4: Timeline 컴포넌트

**Files:**
- Create: `src/components/history/Timeline.tsx`, `Timeline.module.css`
- Test: `tests/components/Timeline.test.tsx`

- [ ] **Step 1: 실패 테스트 작성**

`tests/components/Timeline.test.tsx`:

```tsx
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import Timeline from "@/components/history/Timeline";
import type { HistoryEvent } from "@/lib/types";

const events: HistoryEvent[] = [
  { year: 1982, category: "창단", title: "MBC 청룡 창단" },
  { year: 1990, category: "우승", title: "한국시리즈 우승" },
];

describe("Timeline", () => {
  it("renders each event's year, title, and category badge", () => {
    render(<Timeline events={events} />);
    expect(screen.getByText("1982")).toBeInTheDocument();
    expect(screen.getByText("MBC 청룡 창단")).toBeInTheDocument();
    expect(screen.getByText("창단")).toBeInTheDocument();
    expect(screen.getByText("1990")).toBeInTheDocument();
    expect(screen.getByText("한국시리즈 우승")).toBeInTheDocument();
  });

  it("renders a description when present", () => {
    render(
      <Timeline
        events={[
          {
            year: 2023,
            category: "우승",
            title: "한국시리즈 우승",
            description: "29년 만의 통산 3번째 우승",
          },
        ]}
      />,
    );
    expect(screen.getByText("29년 만의 통산 3번째 우승")).toBeInTheDocument();
  });

  it("shows an empty-state message when there are no events", () => {
    render(<Timeline events={[]} />);
    expect(screen.getByText("해당 카테고리 기록이 없어요.")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: 실패 확인**

Run: `npx vitest run tests/components/Timeline.test.tsx`
Expected: FAIL (모듈 없음)

- [ ] **Step 3: 구현**

`src/components/history/Timeline.module.css`:

```css
.timeline {
  display: flex;
  flex-direction: column;
  gap: 0;
  border-left: 2px solid var(--border);
  margin-left: 8px;
}
.item {
  position: relative;
  padding: 0 0 32px 28px;
}
.item::before {
  content: "";
  position: absolute;
  left: -9px;
  top: 14px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--border);
}
.item.highlight::before {
  background: var(--red);
}
.year {
  font-family: var(--font-display);
  font-size: 1.8rem;
  line-height: 1;
  color: var(--muted);
}
.item.highlight .year {
  font-size: 3rem;
  color: var(--red-soft);
}
.meta {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 6px;
}
.title {
  color: var(--text);
  font-weight: 700;
}
.desc {
  margin-top: 4px;
  color: var(--muted);
  font-size: 0.9rem;
}
.empty {
  color: var(--muted);
}
```

`src/components/history/Timeline.tsx`:

```tsx
"use client";

import { useRef } from "react";
import { useScrollReveal } from "@/lib/animations";
import type { HistoryEvent } from "@/lib/types";
import EventBadge from "./EventBadge";
import styles from "./Timeline.module.css";

export default function Timeline({ events }: { events: HistoryEvent[] }) {
  const ref = useRef<HTMLOListElement>(null);
  useScrollReveal(ref);

  if (events.length === 0) {
    return <p className={styles.empty}>해당 카테고리 기록이 없어요.</p>;
  }

  return (
    <ol ref={ref} className={styles.timeline}>
      {events.map((event, index) => (
        <li
          key={`${event.year}-${event.category}-${index}`}
          className={`${styles.item} ${
            event.category === "우승" ? styles.highlight : ""
          }`}
          data-scroll-item
        >
          <p className={styles.year}>{event.year}</p>
          <div className={styles.meta}>
            <EventBadge category={event.category} />
            <p className={styles.title}>{event.title}</p>
          </div>
          {event.description && <p className={styles.desc}>{event.description}</p>}
        </li>
      ))}
    </ol>
  );
}
```

- [ ] **Step 4: 통과 확인 후 커밋**

Run: `npm test`
Expected: 34 passed

```bash
git add -A
git commit -m "feat: add Timeline component with scroll reveal"
```

---

### Task 5: HistoryExplorer (필터 상태 보유 클라이언트 컴포넌트)

**Files:**
- Create: `src/components/history/HistoryExplorer.tsx`
- Test: `tests/components/HistoryExplorer.test.tsx`

- [ ] **Step 1: 실패 테스트 작성**

`tests/components/HistoryExplorer.test.tsx`:

```tsx
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import HistoryExplorer from "@/components/history/HistoryExplorer";
import type { HistoryEvent } from "@/lib/types";

const events: HistoryEvent[] = [
  { year: 1982, category: "창단", title: "MBC 청룡 창단" },
  { year: 1990, category: "우승", title: "한국시리즈 우승" },
  { year: 1994, category: "우승", title: "한국시리즈 우승" },
];

describe("HistoryExplorer", () => {
  it("shows all events by default", () => {
    render(<HistoryExplorer events={events} />);
    expect(screen.getByText("MBC 청룡 창단")).toBeInTheDocument();
    expect(screen.getAllByText("한국시리즈 우승")).toHaveLength(2);
  });

  it("filters the timeline when a category is selected", async () => {
    const user = userEvent.setup();
    render(<HistoryExplorer events={events} />);
    await user.click(screen.getByRole("button", { name: "우승" }));
    expect(screen.queryByText("MBC 청룡 창단")).not.toBeInTheDocument();
    expect(screen.getAllByText("한국시리즈 우승")).toHaveLength(2);
  });

  it("shows the empty state for a category with no events", async () => {
    const user = userEvent.setup();
    render(<HistoryExplorer events={events} />);
    await user.click(screen.getByRole("button", { name: "감독" }));
    expect(screen.getByText("해당 카테고리 기록이 없어요.")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: 실패 확인**

Run: `npx vitest run tests/components/HistoryExplorer.test.tsx`
Expected: FAIL (모듈 없음)

- [ ] **Step 3: 구현**

`src/components/history/HistoryExplorer.tsx`:

```tsx
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
      <Timeline events={filtered} />
    </div>
  );
}
```

- [ ] **Step 4: 통과 확인 후 커밋**

Run: `npm test`
Expected: 37 passed

```bash
git add -A
git commit -m "feat: add HistoryExplorer combining filter and timeline"
```

---

### Task 6: /history 페이지 라우트

**Files:**
- Create: `src/app/history/page.tsx`, `src/app/history/page.module.css`

- [ ] **Step 1: page.module.css 작성**

`src/app/history/page.module.css`:

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

`src/app/history/page.tsx`:

```tsx
import type { Metadata } from "next";
import HistoryExplorer from "@/components/history/HistoryExplorer";
import { getHistoryEvents } from "@/lib/history";
import { safe } from "@/lib/safe";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "역사",
  description: "LG 트윈스의 창단부터 지금까지, 주요 순간들을 한눈에.",
};

export default async function HistoryPage() {
  const events = await safe(getHistoryEvents);

  return (
    <section
      className={`container ${styles.section}`}
      aria-labelledby="history-page-title"
    >
      <p className={styles.eyebrow}>History</p>
      <h1 id="history-page-title" className={styles.heading}>
        LG 트윈스의 역사
      </h1>
      {events && events.length > 0 ? (
        <HistoryExplorer events={events} />
      ) : (
        <p className={styles.error}>기록을 불러오지 못했어요.</p>
      )}
    </section>
  );
}
```

주의: `SectionTitle` UI 컴포넌트를 쓰지 않고 직접 `<h1>`을 쓴다. `SectionTitle`은 `<h2>`를 렌더링하도록 고정돼 있는데, 이 페이지는 독립 페이지라 문서에 `<h1>`이 하나 있어야 한다(홈페이지의 Hero가 이미 `<h1>`을 쓰는 것과 같은 이유).

- [ ] **Step 3: 빌드 확인 후 커밋**

Run: `npm run build`
Expected: 성공, 라우트 목록에 `/history` 포함

```bash
git add -A
git commit -m "feat: add /history page route"
```

---

### Task 7: 내비게이션 연결 (nav.ts + 메인 페이지 링크)

**Files:**
- Modify: `src/lib/nav.ts`
- Modify: `src/components/home/HistoryPreview.tsx`
- Modify: `src/components/home/HistoryPreview.module.css`
- Modify: `tests/components/HistoryPreview.test.tsx`

- [ ] **Step 1: 실패하는 방향으로 테스트부터 수정**

`tests/components/HistoryPreview.test.tsx`에서 다음 테스트를:

```tsx
  it("shows the full-history link as coming soon", () => {
    render(<HistoryPreview titles={[{ year: 1990 }]} />);
    expect(screen.getByText(/전체 역사 보기/)).toHaveAttribute(
      "aria-disabled",
      "true",
    );
  });
```

다음으로 교체한다:

```tsx
  it("links to the full history page", () => {
    render(<HistoryPreview titles={[{ year: 1990 }]} />);
    expect(screen.getByText("전체 역사 보기")).toHaveAttribute(
      "href",
      "/history",
    );
  });
```

- [ ] **Step 2: 실패 확인**

Run: `npx vitest run tests/components/HistoryPreview.test.tsx`
Expected: FAIL (현재 컴포넌트는 `href` 속성이 없는 `<span aria-disabled>`를 렌더링하므로 `toHaveAttribute("href", ...)`가 실패)

- [ ] **Step 3: HistoryPreview.tsx 수정**

`src/components/home/HistoryPreview.tsx`에서 다음 import 줄을 찾는다:

```tsx
"use client";

import { useRef } from "react";
import SectionTitle from "@/components/ui/SectionTitle";
```

`useRef` 줄 아래에 `Link` import를 추가한다:

```tsx
"use client";

import Link from "next/link";
import { useRef } from "react";
import SectionTitle from "@/components/ui/SectionTitle";
```

그리고 다음 블록을:

```tsx
      {/* 1단계(역사 페이지)에서 /history 링크로 교체 */}
      <span aria-disabled="true" className={styles.more}>
        전체 역사 보기 <small>준비 중</small>
      </span>
```

다음으로 교체한다:

```tsx
      <Link href="/history" className={styles.more}>
        전체 역사 보기
      </Link>
```

- [ ] **Step 4: CSS에서 더 이상 쓰지 않는 규칙 정리**

`src/components/home/HistoryPreview.module.css`에서 다음 블록을 삭제한다:

```css
.more small {
  font-size: 0.7rem;
  border: 1px solid var(--border);
  border-radius: 999px;
  padding: 0 8px;
}
```

같은 파일의 `.more` 규칙에 hover 스타일을 추가한다 (기존 `.more { ... }` 블록 바로 아래):

```css
.more:hover {
  color: var(--red-soft);
}
```

- [ ] **Step 5: 통과 확인**

Run: `npx vitest run tests/components/HistoryPreview.test.tsx`
Expected: 2 passed

- [ ] **Step 6: nav.ts에서 역사 항목 활성화**

`src/lib/nav.ts`에서 다음 줄을:

```ts
  { label: "역사", href: "/history", ready: false },
```

다음으로 바꾼다:

```ts
  { label: "역사", href: "/history", ready: true },
```

- [ ] **Step 7: 전체 테스트 통과 확인 후 커밋**

Run: `npm test`
Expected: 37 passed (Header.test.tsx는 `NAV_ITEMS.filter(i => !i.ready).length`를 동적으로 계산하므로 수정 없이 그대로 통과한다)

```bash
git add -A
git commit -m "feat: wire up history nav item and home page link"
```

---

### Task 8: 최종 검증

**Files:** 없음 (검증만, 문제 발견 시 해당 파일 수정)

- [ ] **Step 1: 정적 검사**

```bash
npm run lint
npx tsc --noEmit
npm test
npm run build
```

Expected: 전부 에러 없이 통과, 테스트 37개 통과

- [ ] **Step 2: 데이터 실패 격리 확인**

`src/lib/history.ts`의 `getHistoryEvents` 본문을 임시로 `throw new Error("test");`로 바꾸고 `npm run build && npm start`(3000번 포트가 이미 쓰이고 있다면 `PORT=3001 npm start`) 후 `/history`에 접속해 확인한다.

Expected: 페이지가 크래시하지 않고 "기록을 불러오지 못했어요." 문구만 보인다. 확인 후 서버를 끄고 원래 코드로 되돌린다 (`git diff`가 비어야 한다).

- [ ] **Step 3: 브라우저로 직접 확인**

`npm run dev` (또는 이미 떠 있는 서버)로 `/history`에 접속해 다음을 확인한다:

- 타임라인이 연도순으로 보이고, 우승 항목만 빨간 강조(큰 연도 + 빨간 점 + 빨간 뱃지)로 구분됨
- 상단 필터 버튼(전체/우승/준우승/창단/감독/기록) 클릭 시 목록이 바뀜. "준우승"/"감독"/"기록"을 누르면 "해당 카테고리 기록이 없어요." 표시
- 키보드로 필터 버튼 탐색 및 Enter로 선택 가능
- 메인 페이지(`/`)의 "전체 역사 보기" 링크가 실제로 `/history`로 이동함
- 헤더 메뉴에서 "역사" 항목이 더 이상 "준비 중"이 아니고 실제로 클릭 가능함
- `prefers-reduced-motion` 에뮬레이션 시 애니메이션 없이 즉시 전체 표시
- 모바일 폭(375px)에서 필터 버튼이 줄바꿈되며 가로 스크롤 없음

- [ ] **Step 4: 마무리 커밋**

```bash
git status
git add -A
git commit -m "chore: verify history stage" --allow-empty
```
