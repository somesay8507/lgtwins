# LG 트윈스 팬사이트 2단계 (선수단 소개 페이지) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `/players` 페이지에서 포지션 탭(전체/투수/포수/내야수/외야수)으로 정규 등록 선수 74명을 카드 그리드로 보여주고, 카드를 클릭하면 `/players/[이름]` 개인 상세 페이지로 이동한다.

**Architecture:** `src/data/players.ts`에 검증된 74명 로스터(`ALL_PLAYERS`)를 두고, `src/lib/players.ts`의 `getPlayers()`가 유일한 접근 창구가 된다. 기존 메인 페이지용 `getStarPlayers()`는 이 함수를 내부적으로 재사용하도록 리팩터링해 데이터 중복을 없앤다(1단계에서 `getChampionships()`를 `getHistoryEvents()` 위에 재구축한 것과 같은 패턴). UI는 서버 컴포넌트인 `page.tsx`가 데이터를 가져와 클라이언트 컴포넌트 `PlayerGrid`(탭 상태 보유)에 넘기고, `PlayerGrid`가 `PositionTabs`와 `PlayerCard` 그리드를 조합한다. 상세 페이지는 이름을 그대로 URL 세그먼트로 쓰고, 없는 이름은 Next.js `notFound()`로 기존 전역 404 페이지로 보낸다.

**Tech Stack:** Next.js (App Router), TypeScript, CSS Modules, Vitest + Testing Library

**Spec:** `docs/superpowers/specs/2026-09-25-lg-twins-players-design.md`

**작업 디렉터리:** `D:\DW_practice` (git 저장소, 현재 HEAD는 `16c8186`)

**검증된 로스터 데이터**: `lgtwins.com/team/player-list`의 원본 HTML을 직접 파싱해 확보한 74명(투수 42, 포수 7, 내야수 15, 외야수 10). 사용자 확인 완료. 전체 목록은 Task 1의 코드 블록에 그대로 담겨 있다.

---

## File Structure

```
src/
  lib/
    types.ts               # PlayerPosition, Player 타입 갱신 (id 필드 제거, number 추가)
    players.ts               # getPlayers() 추가, getStarPlayers()는 이를 재사용하도록 리팩터링
  data/
    players.ts                # STAR_PLAYERS → ALL_PLAYERS(74명)로 교체
  components/
    home/
      StarPlayers.tsx          # key={p.id} → key={p.name} (Player 타입에서 id 제거됨)
    players/
      PlayerCard.tsx / .module.css     # 이니셜 원 + 큰 번호 + 이름 + 포지션, 상세 페이지 링크
      PositionTabs.tsx / .module.css    # 단일 선택 탭 (전체/투수/포수/내야수/외야수), 개수 표시
      PlayerGrid.tsx                     # 탭 상태 보유, PositionTabs + PlayerCard 그리드 조합
  app/
    players/
      page.tsx / page.module.css        # /players
      [name]/
        page.tsx / page.module.css        # /players/[name]
tests/
  lib/
    data.test.ts             # players describe 블록 교체 (기존 파일 수정)
  components/
    StarPlayers.test.tsx      # id 필드 제거 반영 (기존 파일 수정)
    PlayerCard.test.tsx
    PositionTabs.test.tsx
    PlayerGrid.test.tsx
```

책임 경계:
- `data/players.ts`: 값만 보관. 로직 없음.
- `lib/players.ts`: 컴포넌트가 부르는 유일한 데이터 창구. `getStarPlayers()`는 `getPlayers()`의 파생 함수.
- `PlayerCard`: 선수 한 명을 카드로 그리고 상세 페이지로 링크하는 것만 안다.
- `PositionTabs`: 선택 상태를 표시하고 클릭을 부모에 알리기만 한다(1단계 `CategoryFilter`와 동일한 상태 없는 프레젠테이션 패턴).
- `PlayerGrid`: 유일하게 탭 선택 상태를 보유하는 곳(1단계 `HistoryExplorer`와 동일한 역할). `page.tsx`는 데이터 가져오기만 하고 상태는 모른다.

---

### Task 1: 데이터 모델 갱신 + players lib 리팩터링

**Files:**
- Modify: `src/lib/types.ts`
- Modify: `src/data/players.ts`
- Modify: `src/lib/players.ts`
- Modify: `src/components/home/StarPlayers.tsx`
- Modify: `tests/components/StarPlayers.test.tsx`
- Modify: `tests/lib/data.test.ts`

`Player` 타입이 바뀐다: 기존에는 `{id, name, position: string}`이었는데, 이제 `id`를 없애고(이름이 URL 슬러그이자 고유 키로 충분) `number`를 추가하며 `position`을 좁은 유니언 타입으로 바꾼다. `id`를 쓰던 곳은 `name`으로 바꿔야 한다.

- [ ] **Step 1: 타입 교체**

`src/lib/types.ts`에서 다음 블록을 찾는다:

```ts
export type Player = {
  id: string;
  name: string;
  position: string;
};
```

다음으로 교체한다:

```ts
export type PlayerPosition = "투수" | "포수" | "내야수" | "외야수";

export type Player = {
  name: string;
  number: string | null;
  position: PlayerPosition;
};
```

- [ ] **Step 2: 실패하는 방향으로 관련 테스트부터 수정**

`tests/components/StarPlayers.test.tsx` 전체를 다음으로 교체한다 (`id` 필드를 없애고 `number`를 추가):

```tsx
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import StarPlayers from "@/components/home/StarPlayers";

describe("StarPlayers", () => {
  it("renders a card per player", () => {
    render(
      <StarPlayers
        players={[
          { name: "선수A", number: "1", position: "투수" },
          { name: "선수B", number: "2", position: "포수" },
        ]}
      />,
    );
    expect(screen.getByText("선수A")).toBeInTheDocument();
    expect(screen.getByText("포수")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });
});
```

`tests/lib/data.test.ts`에서 다음 import 줄을 찾는다:

```ts
import { getStarPlayers } from "@/lib/players";
```

다음으로 바꾼다:

```ts
import { getPlayers, getStarPlayers } from "@/lib/players";
```

그리고 파일 안의 다음 블록을:

```ts
describe("players", () => {
  it("getStarPlayers returns 3-4 players with unique ids", async () => {
    const players = await getStarPlayers();
    expect(players.length).toBeGreaterThanOrEqual(3);
    expect(players.length).toBeLessThanOrEqual(4);
    expect(new Set(players.map((p) => p.id)).size).toBe(players.length);
  });
});
```

다음으로 교체한다:

```ts
describe("players", () => {
  it("getPlayers returns all 74 registered players across four positions", async () => {
    const players = await getPlayers();
    expect(players).toHaveLength(74);
    expect(players.filter((p) => p.position === "투수")).toHaveLength(42);
    expect(players.filter((p) => p.position === "포수")).toHaveLength(7);
    expect(players.filter((p) => p.position === "내야수")).toHaveLength(15);
    expect(players.filter((p) => p.position === "외야수")).toHaveLength(10);
  });

  it("getStarPlayers returns exactly the 4 known stars, a subset of all players", async () => {
    const all = await getPlayers();
    const stars = await getStarPlayers();
    expect(stars).toHaveLength(4);
    expect(new Set(stars.map((p) => p.name)).size).toBe(4);
    for (const star of stars) {
      expect(all.some((p) => p.name === star.name)).toBe(true);
    }
  });
});
```

- [ ] **Step 3: 실패 확인**

Run: `npm test`
Expected: FAIL — `src/data/players.ts`/`src/lib/players.ts`/`StarPlayers.tsx`가 아직 옛 `Player` 타입 형태라 타입 에러 및 테스트 실패가 난다 (`getPlayers` is not exported 등).

- [ ] **Step 4: data/players.ts를 74명 전체로 교체**

`src/data/players.ts` 전체를 다음으로 교체한다:

```ts
import type { Player } from "@/lib/types";

// 2026-09-25 기준 lgtwins.com/team/player-list 원본 HTML을 직접 파싱해 확보.
// 정규 등록 선수만 담는다(육성선수 39명은 범위 밖). 등번호 미정 선수는 number: null.
export const ALL_PLAYERS: Player[] = [
  // 투수 (42명)
  { name: "고우석", number: "19", position: "투수" },
  { name: "권우준", number: "49", position: "투수" },
  { name: "김강률", number: "37", position: "투수" },
  { name: "김대현", number: "12", position: "투수" },
  { name: "김동현", number: "43", position: "투수" },
  { name: "김영우", number: "67", position: "투수" },
  { name: "김유영", number: "0", position: "투수" },
  { name: "김윤식", number: "47", position: "투수" },
  { name: "김주온", number: "57", position: "투수" },
  { name: "김진성", number: "42", position: "투수" },
  { name: "김진수", number: "45", position: "투수" },
  { name: "박시원", number: "58", position: "투수" },
  { name: "박준성", number: "60", position: "투수" },
  { name: "배재준", number: "25", position: "투수" },
  { name: "백승현", number: "61", position: "투수" },
  { name: "성동현", number: "34", position: "투수" },
  { name: "손주영", number: "29", position: "투수" },
  { name: "송승기", number: "13", position: "투수" },
  { name: "양우진", number: "65", position: "투수" },
  { name: "우강훈", number: "20", position: "투수" },
  { name: "우명현", number: "69", position: "투수" },
  { name: "유영찬", number: "54", position: "투수" },
  { name: "이민호", number: "26", position: "투수" },
  { name: "이상영", number: "39", position: "투수" },
  { name: "이우찬", number: "21", position: "투수" },
  { name: "이정용", number: "31", position: "투수" },
  { name: "이종준", number: "40", position: "투수" },
  { name: "이지강", number: "32", position: "투수" },
  { name: "임찬규", number: "1", position: "투수" },
  { name: "장시환", number: "28", position: "투수" },
  { name: "장현식", number: "50", position: "투수" },
  { name: "정우영", number: "18", position: "투수" },
  { name: "조건희", number: "48", position: "투수" },
  { name: "조원태", number: "38", position: "투수" },
  { name: "최지명", number: "16", position: "투수" },
  { name: "카라스코", number: "59", position: "투수" },
  { name: "케네디", number: "68", position: "투수" },
  { name: "톨허스트", number: "30", position: "투수" },
  { name: "함덕주", number: "11", position: "투수" },
  { name: "박명근", number: null, position: "투수" },
  { name: "정지헌", number: null, position: "투수" },
  { name: "허용주", number: null, position: "투수" },

  // 포수 (7명)
  { name: "김민수", number: "62", position: "포수" },
  { name: "김준태", number: "44", position: "포수" },
  { name: "박동원", number: "27", position: "포수" },
  { name: "이주헌", number: "63", position: "포수" },
  { name: "전경원", number: "46", position: "포수" },
  { name: "김범석", number: null, position: "포수" },
  { name: "김성우", number: null, position: "포수" },

  // 내야수 (15명)
  { name: "강민균", number: "00", position: "내야수" },
  { name: "구본혁", number: "6", position: "내야수" },
  { name: "김대원", number: "64", position: "내야수" },
  { name: "김성진", number: "36", position: "내야수" },
  { name: "김정율", number: "14", position: "내야수" },
  { name: "김주성", number: "5", position: "내야수" },
  { name: "문보경", number: "2", position: "내야수" },
  { name: "문정빈", number: "56", position: "내야수" },
  { name: "손용준", number: "15", position: "내야수" },
  { name: "신민재", number: "4", position: "내야수" },
  { name: "오스틴", number: "23", position: "내야수" },
  { name: "오지환", number: "10", position: "내야수" },
  { name: "이영빈", number: "7", position: "내야수" },
  { name: "천성호", number: "53", position: "내야수" },
  { name: "추세현", number: "35", position: "내야수" },

  // 외야수 (10명)
  { name: "김현종", number: "66", position: "외야수" },
  { name: "문성주", number: "8", position: "외야수" },
  { name: "박해민", number: "17", position: "외야수" },
  { name: "서영준", number: "87", position: "외야수" },
  { name: "송찬의", number: "55", position: "외야수" },
  { name: "이재원", number: "52", position: "외야수" },
  { name: "최원영", number: "3", position: "외야수" },
  { name: "함창건", number: "24", position: "외야수" },
  { name: "홍창기", number: "51", position: "외야수" },
  { name: "박관우", number: null, position: "외야수" },
];
```

- [ ] **Step 5: lib/players.ts에 getPlayers() 추가, getStarPlayers() 리팩터링**

`src/lib/players.ts` 전체를 다음으로 교체한다:

```ts
import { ALL_PLAYERS } from "@/data/players";
import type { Player } from "./types";

const STAR_PLAYER_NAMES = ["오지환", "문보경", "박동원", "임찬규"];

export async function getPlayers(): Promise<Player[]> {
  return ALL_PLAYERS;
}

export async function getStarPlayers(): Promise<Player[]> {
  const players = await getPlayers();
  return players.filter((player) => STAR_PLAYER_NAMES.includes(player.name));
}
```

- [ ] **Step 6: StarPlayers.tsx에서 key를 id 대신 name으로**

`src/components/home/StarPlayers.tsx`에서 다음 줄을:

```tsx
          <li key={p.id} data-scroll-item>
```

다음으로 바꾼다:

```tsx
          <li key={p.name} data-scroll-item>
```

- [ ] **Step 7: 통과 확인 후 커밋**

Run: `npm test`
Expected: 38 passed (기존 37 - 옛 players 테스트 1개 + 새 players 테스트 2개, StarPlayers 테스트는 내용만 바뀌고 개수 동일)

Run: `npm run lint && npx tsc --noEmit && npm run build`
Expected: 전부 통과

```bash
git add -A
git commit -m "feat: replace player data model with full 74-player roster"
```
(커밋 메시지 끝에 `Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>` 트레일러를 붙인다)

## Before You Begin (Task 1)
`Player` 타입에서 `id`를 없애는 변경은 `StarPlayers.tsx` 외에 다른 곳에서도 `p.id`를 쓰고 있지 않은지 미리 grep으로 확인한다. 있다면 멈추고 NEEDS_CONTEXT로 보고한다(이 태스크에서 다루지 않은 곳이 있다는 뜻이므로).

---

### Task 2: PlayerCard 컴포넌트

**Files:**
- Create: `src/components/players/PlayerCard.tsx`, `PlayerCard.module.css`
- Test: `tests/components/PlayerCard.test.tsx`

- [ ] **Step 1: 실패 테스트 작성**

`tests/components/PlayerCard.test.tsx`:

```tsx
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import PlayerCard from "@/components/players/PlayerCard";

describe("PlayerCard", () => {
  it("renders name, number, and position, linking to the detail page", () => {
    render(
      <PlayerCard player={{ name: "오지환", number: "10", position: "내야수" }} />,
    );
    expect(screen.getByText("오지환")).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument();
    expect(screen.getByText("내야수")).toBeInTheDocument();
    expect(screen.getByRole("link")).toHaveAttribute("href", "/players/오지환");
  });

  it("shows 미정 when the player has no assigned number", () => {
    render(
      <PlayerCard player={{ name: "박명근", number: null, position: "투수" }} />,
    );
    expect(screen.getByText("미정")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: 실패 확인**

Run: `npx vitest run tests/components/PlayerCard.test.tsx`
Expected: FAIL (모듈 없음)

- [ ] **Step 3: 구현**

`src/components/players/PlayerCard.module.css`:

```css
.card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 4px;
  padding: 20px 12px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  transition: transform 0.2s, border-color 0.2s;
}
.card:hover {
  transform: translateY(-4px);
  border-color: var(--red);
}
.avatar {
  display: grid;
  place-items: center;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--red);
  color: #fff;
  font-family: var(--font-display);
  font-size: 1.4rem;
  margin-bottom: 6px;
}
.number {
  font-family: var(--font-display);
  font-size: 1.8rem;
  line-height: 1;
  color: var(--red-soft);
}
.name {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text);
}
.position {
  font-size: 0.75rem;
  color: var(--muted);
}
```

`src/components/players/PlayerCard.tsx`:

```tsx
import Link from "next/link";
import type { Player } from "@/lib/types";
import styles from "./PlayerCard.module.css";

export default function PlayerCard({ player }: { player: Player }) {
  return (
    <Link href={`/players/${player.name}`} className={styles.card}>
      <span className={styles.avatar} aria-hidden="true">
        {player.name.charAt(0)}
      </span>
      <p className={styles.number}>{player.number ?? "미정"}</p>
      <p className={styles.name}>{player.name}</p>
      <p className={styles.position}>{player.position}</p>
    </Link>
  );
}
```

- [ ] **Step 4: 통과 확인 후 커밋**

Run: `npm test`
Expected: 40 passed

```bash
git add -A
git commit -m "feat: add PlayerCard component"
```
(커밋 메시지 끝에 Co-Authored-By 트레일러)

---

### Task 3: PositionTabs 컴포넌트

**Files:**
- Create: `src/components/players/PositionTabs.tsx`, `PositionTabs.module.css`
- Test: `tests/components/PositionTabs.test.tsx`

- [ ] **Step 1: 실패 테스트 작성**

`tests/components/PositionTabs.test.tsx`:

```tsx
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PositionTabs from "@/components/players/PositionTabs";

const counts = { 전체: 74, 투수: 42, 포수: 7, 내야수: 15, 외야수: 10 };

describe("PositionTabs", () => {
  it("renders 전체 plus every position with its count", () => {
    render(<PositionTabs selected="전체" onSelect={() => {}} counts={counts} />);
    expect(screen.getByRole("button", { name: "전체 74" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "투수 42" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "포수 7" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "내야수 15" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "외야수 10" })).toBeInTheDocument();
  });

  it("marks the selected option as pressed", () => {
    render(<PositionTabs selected="투수" onSelect={() => {}} counts={counts} />);
    expect(screen.getByRole("button", { name: "투수 42" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: "전체 74" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  it("calls onSelect with the clicked position", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<PositionTabs selected="전체" onSelect={onSelect} counts={counts} />);
    await user.click(screen.getByRole("button", { name: "포수 7" }));
    expect(onSelect).toHaveBeenCalledWith("포수");
  });
});
```

- [ ] **Step 2: 실패 확인**

Run: `npx vitest run tests/components/PositionTabs.test.tsx`
Expected: FAIL (모듈 없음)

- [ ] **Step 3: 구현**

`src/components/players/PositionTabs.module.css`:

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

`src/components/players/PositionTabs.tsx`:

```tsx
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
```

- [ ] **Step 4: 통과 확인 후 커밋**

Run: `npm test`
Expected: 43 passed

```bash
git add -A
git commit -m "feat: add PositionTabs component"
```
(커밋 메시지 끝에 Co-Authored-By 트레일러)

---

### Task 4: PlayerGrid (탭 상태 보유 클라이언트 컴포넌트)

**Files:**
- Create: `src/components/players/PlayerGrid.tsx`, `PlayerGrid.module.css`
- Test: `tests/components/PlayerGrid.test.tsx`

- [ ] **Step 1: 실패 테스트 작성**

`tests/components/PlayerGrid.test.tsx`:

```tsx
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PlayerGrid from "@/components/players/PlayerGrid";
import type { Player } from "@/lib/types";

const players: Player[] = [
  { name: "선수A", number: "1", position: "투수" },
  { name: "선수B", number: "2", position: "포수" },
  { name: "선수C", number: "3", position: "포수" },
];

describe("PlayerGrid", () => {
  it("shows all players by default", () => {
    render(<PlayerGrid players={players} />);
    expect(screen.getByText("선수A")).toBeInTheDocument();
    expect(screen.getByText("선수B")).toBeInTheDocument();
    expect(screen.getByText("선수C")).toBeInTheDocument();
  });

  it("filters players when a position tab is selected", async () => {
    const user = userEvent.setup();
    render(<PlayerGrid players={players} />);
    await user.click(screen.getByRole("button", { name: "포수 2" }));
    expect(screen.queryByText("선수A")).not.toBeInTheDocument();
    expect(screen.getByText("선수B")).toBeInTheDocument();
    expect(screen.getByText("선수C")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: 실패 확인**

Run: `npx vitest run tests/components/PlayerGrid.test.tsx`
Expected: FAIL (모듈 없음)

- [ ] **Step 3: 구현**

`src/components/players/PlayerGrid.module.css`:

```css
.grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

@media (min-width: 640px) {
  .grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (min-width: 960px) {
  .grid {
    grid-template-columns: repeat(5, 1fr);
  }
}
```

`src/components/players/PlayerGrid.tsx`:

```tsx
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
```

- [ ] **Step 4: 통과 확인 후 커밋**

Run: `npm test`
Expected: 45 passed

```bash
git add -A
git commit -m "feat: add PlayerGrid combining position tabs and card grid"
```
(커밋 메시지 끝에 Co-Authored-By 트레일러)

---

### Task 5: /players 페이지 라우트

**Files:**
- Create: `src/app/players/page.tsx`, `src/app/players/page.module.css`

- [ ] **Step 1: page.module.css 작성**

`src/app/players/page.module.css`:

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

`src/app/players/page.tsx`:

```tsx
import type { Metadata } from "next";
import PlayerGrid from "@/components/players/PlayerGrid";
import { getPlayers } from "@/lib/players";
import { safe } from "@/lib/safe";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "선수단",
  description: "LG 트윈스 등록 선수 74명을 포지션별로 만나보세요.",
};

export default async function PlayersPage() {
  const players = await safe(getPlayers);

  return (
    <section
      className={`container ${styles.section}`}
      aria-labelledby="players-page-title"
    >
      <p className={styles.eyebrow}>Players</p>
      <h1 id="players-page-title" className={styles.heading}>
        선수단
      </h1>
      {players && players.length > 0 ? (
        <PlayerGrid players={players} />
      ) : (
        <p className={styles.error}>선수단 정보를 불러오지 못했어요.</p>
      )}
    </section>
  );
}
```

- [ ] **Step 3: 빌드 확인 후 커밋**

Run: `npm run build`
Expected: 성공, 라우트 목록에 `/players` 포함

```bash
git add -A
git commit -m "feat: add /players page route"
```
(커밋 메시지 끝에 Co-Authored-By 트레일러)

---

### Task 6: /players/[name] 개인 상세 페이지

**Files:**
- Create: `src/app/players/[name]/page.tsx`, `src/app/players/[name]/page.module.css`

- [ ] **Step 1: page.module.css 작성**

`src/app/players/[name]/page.module.css`:

```css
.section {
  padding: 64px 0 96px;
}
.back {
  display: inline-block;
  margin-bottom: 32px;
  color: var(--muted);
  font-size: 0.9rem;
}
.back:hover {
  color: var(--red-soft);
}
.number {
  font-family: var(--font-display);
  font-size: clamp(3rem, 10vw, 6rem);
  line-height: 1;
  color: var(--red-soft);
}
.name {
  font-family: var(--font-display);
  font-size: clamp(2.5rem, 7vw, 4.5rem);
  font-weight: 400;
  margin-top: 8px;
}
.position {
  margin-top: 12px;
  color: var(--muted);
  font-size: 1.1rem;
}
```

- [ ] **Step 2: page.tsx 작성**

`src/app/players/[name]/page.tsx`:

```tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPlayers } from "@/lib/players";
import { safe } from "@/lib/safe";
import styles from "./page.module.css";

type Props = { params: Promise<{ name: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { name } = await params;
  return { title: `${name} | 선수단` };
}

export default async function PlayerDetailPage({ params }: Props) {
  const { name } = await params;
  const players = await safe(getPlayers);
  const player = players?.find((p) => p.name === name);

  if (!player) {
    notFound();
  }

  return (
    <section
      className={`container ${styles.section}`}
      aria-labelledby="player-name"
    >
      <Link href="/players" className={styles.back}>
        ← 선수단으로
      </Link>
      <p className={styles.number}>{player.number ?? "미정"}</p>
      <h1 id="player-name" className={styles.name}>
        {player.name}
      </h1>
      <p className={styles.position}>{player.position}</p>
    </section>
  );
}
```

**주의:** 이 프로젝트는 Next.js 16이고, `src/app/AGENTS.md`가 경고하는 대로 학습 데이터 시점의 관례와 다를 수 있다. 동적 라우트의 `params`가 Promise인 것은 Next 15+/16의 알려진 관례이지만, 빌드가 실패하거나 타입 에러가 나면 추측으로 코드를 바꾸지 말고 `node_modules/next/dist/docs/`에서 관련 문서를 확인한 뒤 진행하거나, 확신이 없으면 NEEDS_CONTEXT로 보고한다.

- [ ] **Step 3: 빌드 확인 후 커밋**

Run: `npm run build`
Expected: 성공. `/players/[name]`이 동적 라우트로 표시된다.

```bash
git add -A
git commit -m "feat: add player detail page route"
```
(커밋 메시지 끝에 Co-Authored-By 트레일러)

---

### Task 7: 내비게이션 연결 (nav.ts)

**Files:**
- Modify: `src/lib/nav.ts`

- [ ] **Step 1: 선수단 항목 활성화**

`src/lib/nav.ts`에서 다음 줄을:

```ts
  { label: "선수단", href: "/players", ready: false },
```

다음으로 바꾼다:

```ts
  { label: "선수단", href: "/players", ready: true },
```

- [ ] **Step 2: 전체 테스트 통과 확인 후 커밋**

Run: `npm test`
Expected: 45 passed (Header.test.tsx는 `NAV_ITEMS.filter(i => !i.ready).length`를 동적으로 계산하므로 수정 없이 그대로 통과한다)

Run: `npm run lint && npx tsc --noEmit && npm run build`
Expected: 전부 통과

```bash
git add -A
git commit -m "feat: activate players nav item"
```
(커밋 메시지 끝에 Co-Authored-By 트레일러)

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

Expected: 전부 에러 없이 통과, 테스트 45개 통과

- [ ] **Step 2: 데이터 실패 격리 확인**

`src/lib/players.ts`의 `getPlayers` 본문을 임시로 `throw new Error("test");`로 바꾸고 `npm run build && npm start`(3000번 포트가 이미 쓰이고 있다면 `PORT=3001 npm start`) 후 확인한다.

- `/players`: 크래시 없이 "선수단 정보를 불러오지 못했어요." 문구만 보인다.
- `/players/오지환`: `getPlayers()`가 실패하므로 `players?.find(...)`가 `undefined`가 되고 `notFound()`가 호출되어 전역 404 페이지("준비 중이에요")로 간다. 이는 의도된 동작이다(스펙에 명시된 대로, 목록 페이지만 별도의 "불러오지 못함" 문구를 가진다).
- 홈페이지(`/`): `getStarPlayers()`도 내부적으로 실패한 `getPlayers()`를 호출하므로 스타 플레이어 섹션만 조용히 사라지고 나머지는 정상. 크래시 없음을 확인한다.

확인 후 서버를 끄고 원래 코드로 되돌린다 (`git diff`가 비어야 한다).

- [ ] **Step 3: 브라우저로 직접 확인**

`npm run dev` (또는 이미 떠 있는 서버)로 확인한다:

- `/players`: 기본 탭이 "전체"이고 74명 카드가 다 보임. 탭 클릭 시 해당 포지션만 필터링됨(개수 표시 포함)
- 카드 클릭 시 `/players/{이름}`으로 이동하고 번호·이름·포지션이 크게 보임. "← 선수단으로" 링크로 돌아옴
- 존재하지 않는 이름(`/players/없는선수`)은 커스텀 404로 감
- 모바일 폭(375px)에서 카드 그리드가 2열로 줄어들고 가로 스크롤 없음
- 헤더 메뉴에서 "선수단" 항목이 더 이상 "준비 중"이 아니고 실제로 클릭 가능함
- 키보드로 탭 버튼 탐색 및 Enter로 선택 가능

- [ ] **Step 4: 마무리 커밋**

```bash
git status
git add -A
git commit -m "chore: verify players stage" --allow-empty
```
