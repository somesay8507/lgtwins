# LG 트윈스 팬사이트 3단계 (응원 문화 페이지) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `/cheer` 페이지에서 팀 응원가, 선수 응원가, 응원단, 응원 도구, 응원 매너 5개 섹션을 한 페이지에 담아 보여준다.

**Architecture:** `src/data/cheer.ts`에 검증된 정적 데이터(팀 응원가 13곡, 선수 응원가 17곡, 응원단 16명)를 두고, `src/lib/cheer.ts`의 세 함수(`getTeamCheerSongs`/`getPlayerCheerSongs`/`getCheerStaff`)가 유일한 접근 창구가 된다. 5개 컴포넌트는 모두 상태 없는 프레젠테이션 컴포넌트로, 서버 컴포넌트인 `page.tsx`가 데이터를 가져와 그대로 내려준다(1·2단계와 달리 필터 상태가 없어 클라이언트 상태 관리 컴포넌트가 필요 없다).

**Tech Stack:** Next.js (App Router), TypeScript, CSS Modules, Vitest + Testing Library

**Spec:** `docs/superpowers/specs/2026-09-28-lg-twins-cheer-design.md`

**작업 디렉터리:** `D:\DW_practice` (git 저장소, 현재 HEAD는 `59fb77d`)

**검증된 데이터**: `lgtwins.com/fan/songs`, `lgtwins.com/fan/cheers`의 원본 HTML을 직접 파싱해 확보. 전체 목록은 Task 1의 코드 블록에 그대로 담겨 있다.

---

## File Structure

```
src/
  lib/
    types.ts               # TeamCheerSong, PlayerCheerSong, CheerStaffRole, CheerStaffMember 추가
    cheer.ts                 # getTeamCheerSongs(), getPlayerCheerSongs(), getCheerStaff()
  data/
    cheer.ts                  # TEAM_CHEER_SONGS, PLAYER_CHEER_SONGS, CHEER_STAFF
  components/
    cheer/
      TeamSongList.tsx / .module.css       # 팀 응원가 리스트, 빈 상태 처리
      PlayerSongList.tsx / .module.css      # 선수별로 응원가를 묶어서 표시
      CheerStaffList.tsx / .module.css      # 역할별로 응원단 인원을 묶어서 표시
      CheerTools.tsx / .module.css          # 응원 도구 카드 (정적 콘텐츠, props 없음)
      CheerManners.tsx / .module.css        # 응원 매너 리스트 (정적 콘텐츠, props 없음)
  app/
    cheer/
      page.tsx / page.module.css            # /cheer, 5개 섹션 조립 + 앵커 내비게이션
tests/
  lib/
    cheer.test.ts
  components/
    TeamSongList.test.tsx
    PlayerSongList.test.tsx
    CheerStaffList.test.tsx
    CheerTools.test.tsx
    CheerManners.test.tsx
```

책임 경계:
- `data/cheer.ts`: 값만 보관. 로직 없음.
- `lib/cheer.ts`: 컴포넌트가 부르는 유일한 데이터 창구. 세 함수 모두 독립적이다.
- `TeamSongList`/`PlayerSongList`/`CheerStaffList`: 각각 받은 배열을 그리는 것만 안다. 서로 모른다.
- `CheerTools`/`CheerManners`: 검증이 필요 없는 정적 콘텐츠라 props 없이 자체적으로 데이터를 갖는다(다른 세 컴포넌트와 달리 `lib/cheer.ts`를 거치지 않는다 — 일반 KBO 팬 문화 상식이라 별도 데이터 계층이 필요 없다).

---

### Task 1: 데이터 모델 + cheer lib 작성

**Files:**
- Modify: `src/lib/types.ts`
- Create: `src/data/cheer.ts`
- Create: `src/lib/cheer.ts`
- Test: `tests/lib/cheer.test.ts`

- [ ] **Step 1: 타입 추가**

`src/lib/types.ts`에 다음을 추가한다 (기존 타입들은 그대로 둔다):

```ts
export type TeamCheerSong = { title: string };
export type PlayerCheerSong = { player: string; title: string };
export type CheerStaffRole = "응원단장" | "부응원단장" | "장내아나운서" | "치어리더";
export type CheerStaffMember = { name: string; role: CheerStaffRole };
```

- [ ] **Step 2: 실패 테스트 작성**

`tests/lib/cheer.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { getCheerStaff, getPlayerCheerSongs, getTeamCheerSongs } from "@/lib/cheer";

describe("cheer", () => {
  it("getTeamCheerSongs returns all 13 team songs", async () => {
    const songs = await getTeamCheerSongs();
    expect(songs).toHaveLength(13);
  });

  it("getPlayerCheerSongs returns all 17 entries across 15 unique players", async () => {
    const songs = await getPlayerCheerSongs();
    expect(songs).toHaveLength(17);
    expect(new Set(songs.map((s) => s.player)).size).toBe(15);
  });

  it("getCheerStaff returns all 16 staff members with the expected role counts", async () => {
    const staff = await getCheerStaff();
    expect(staff).toHaveLength(16);
    expect(staff.filter((s) => s.role === "응원단장")).toHaveLength(1);
    expect(staff.filter((s) => s.role === "부응원단장")).toHaveLength(2);
    expect(staff.filter((s) => s.role === "장내아나운서")).toHaveLength(1);
    expect(staff.filter((s) => s.role === "치어리더")).toHaveLength(12);
  });
});
```

- [ ] **Step 3: 실패 확인**

Run: `npx vitest run tests/lib/cheer.test.ts`
Expected: FAIL (`@/lib/cheer` 모듈 없음)

- [ ] **Step 4: data/cheer.ts 작성**

`src/data/cheer.ts`:

```ts
import type { CheerStaffMember, PlayerCheerSong, TeamCheerSong } from "@/lib/types";

// 2026-09-28 기준 lgtwins.com/fan/songs, lgtwins.com/fan/cheers 원본 HTML을
// 직접 파싱해 확보. 가사 저작권 문제로 곡 제목만 담는다(가사 전문·멜로디 없음).
export const TEAM_CHEER_SONGS: TeamCheerSong[] = [
  { title: "2020 일어나라 LG" },
  { title: "강해져라" },
  { title: "깃발응원가" },
  { title: "라인업 송 - 유모레스크" },
  { title: "무적 LG 끝까지 트윈스" },
  { title: "무적의 LG" },
  { title: "사랑하는 LG" },
  { title: "사랑한다 LG" },
  { title: "승리를 위하여" },
  { title: "승리의 포효" },
  { title: "엘팬의 북소리" },
  { title: "GO TWINS" },
  { title: "LG의 승리 위해" },
];

export const PLAYER_CHEER_SONGS: PlayerCheerSong[] = [
  { player: "구본혁", title: "구본혁 응원가" },
  { player: "김주성", title: "김주성 응원가" },
  { player: "문성주", title: "문성주 응원가" },
  { player: "문정빈", title: "문정빈 응원가" },
  { player: "박동원", title: "박동원 응원가" },
  { player: "박해민", title: "박해민 응원가 1" },
  { player: "박해민", title: "박해민 응원가 2" },
  { player: "송찬의", title: "송찬의 응원가" },
  { player: "신민재", title: "신민재 응원가" },
  { player: "오스틴 딘", title: "오스틴 딘 응원가 1" },
  { player: "오스틴 딘", title: "오스틴 딘 응원가 2" },
  { player: "이영빈", title: "이영빈 응원가" },
  { player: "이재원", title: "이재원 응원가" },
  { player: "이주헌", title: "이주헌 응원가" },
  { player: "천성호", title: "천성호 응원가" },
  { player: "최원영", title: "최원영 응원가" },
  { player: "홍창기", title: "홍창기 응원가" },
];

export const CHEER_STAFF: CheerStaffMember[] = [
  { name: "이윤승", role: "응원단장" },
  { name: "김태리", role: "부응원단장" },
  { name: "최서용", role: "부응원단장" },
  { name: "황건하", role: "장내아나운서" },
  { name: "차영현", role: "치어리더" },
  { name: "진수화", role: "치어리더" },
  { name: "박예은", role: "치어리더" },
  { name: "신서윤", role: "치어리더" },
  { name: "임혜진", role: "치어리더" },
  { name: "우혜준", role: "치어리더" },
  { name: "고예지", role: "치어리더" },
  { name: "김태희", role: "치어리더" },
  { name: "서여진", role: "치어리더" },
  { name: "장로나", role: "치어리더" },
  { name: "양효주", role: "치어리더" },
  { name: "이서우", role: "치어리더" },
];
```

- [ ] **Step 5: lib/cheer.ts 작성**

`src/lib/cheer.ts`:

```ts
import { CHEER_STAFF, PLAYER_CHEER_SONGS, TEAM_CHEER_SONGS } from "@/data/cheer";
import type { CheerStaffMember, PlayerCheerSong, TeamCheerSong } from "./types";

export async function getTeamCheerSongs(): Promise<TeamCheerSong[]> {
  return TEAM_CHEER_SONGS;
}

export async function getPlayerCheerSongs(): Promise<PlayerCheerSong[]> {
  return PLAYER_CHEER_SONGS;
}

export async function getCheerStaff(): Promise<CheerStaffMember[]> {
  return CHEER_STAFF;
}
```

- [ ] **Step 6: 통과 확인 후 커밋**

Run: `npm test`
Expected: 48 passed (기존 45 + 새 cheer 테스트 3개)

Run: `npm run lint && npx tsc --noEmit && npm run build`
Expected: 전부 통과

```bash
git add -A
git commit -m "feat: add cheer culture data model"
```
(커밋 메시지 끝에 `Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>` 트레일러를 붙인다)

---

### Task 2: TeamSongList 컴포넌트

**Files:**
- Create: `src/components/cheer/TeamSongList.tsx`, `TeamSongList.module.css`
- Test: `tests/components/TeamSongList.test.tsx`

- [ ] **Step 1: 실패 테스트 작성**

`tests/components/TeamSongList.test.tsx`:

```tsx
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import TeamSongList from "@/components/cheer/TeamSongList";

describe("TeamSongList", () => {
  it("renders each song title", () => {
    render(<TeamSongList songs={[{ title: "강해져라" }, { title: "GO TWINS" }]} />);
    expect(screen.getByText("강해져라")).toBeInTheDocument();
    expect(screen.getByText("GO TWINS")).toBeInTheDocument();
  });

  it("shows an empty-state message when there are no songs", () => {
    render(<TeamSongList songs={[]} />);
    expect(screen.getByText("팀 응원가 정보가 없어요.")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: 실패 확인**

Run: `npx vitest run tests/components/TeamSongList.test.tsx`
Expected: FAIL (모듈 없음)

- [ ] **Step 3: 구현**

`src/components/cheer/TeamSongList.module.css`:

```css
.list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
}
.item {
  padding: 16px 20px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  color: var(--text);
  font-weight: 700;
}
.empty {
  color: var(--muted);
}
```

`src/components/cheer/TeamSongList.tsx`:

```tsx
import type { TeamCheerSong } from "@/lib/types";
import styles from "./TeamSongList.module.css";

export default function TeamSongList({ songs }: { songs: TeamCheerSong[] }) {
  if (songs.length === 0) {
    return <p className={styles.empty}>팀 응원가 정보가 없어요.</p>;
  }

  return (
    <ul className={styles.list}>
      {songs.map((song) => (
        <li key={song.title} className={styles.item}>
          {song.title}
        </li>
      ))}
    </ul>
  );
}
```

- [ ] **Step 4: 통과 확인 후 커밋**

Run: `npm test`
Expected: 50 passed

```bash
git add -A
git commit -m "feat: add TeamSongList component"
```
(커밋 메시지 끝에 Co-Authored-By 트레일러)

---

### Task 3: PlayerSongList 컴포넌트

**Files:**
- Create: `src/components/cheer/PlayerSongList.tsx`, `PlayerSongList.module.css`
- Test: `tests/components/PlayerSongList.test.tsx`

- [ ] **Step 1: 실패 테스트 작성**

`tests/components/PlayerSongList.test.tsx`:

```tsx
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import PlayerSongList from "@/components/cheer/PlayerSongList";

describe("PlayerSongList", () => {
  it("groups multiple songs under the same player", () => {
    render(
      <PlayerSongList
        songs={[
          { player: "박해민", title: "박해민 응원가 1" },
          { player: "박해민", title: "박해민 응원가 2" },
          { player: "홍창기", title: "홍창기 응원가" },
        ]}
      />,
    );
    expect(screen.getAllByText("박해민")).toHaveLength(1);
    expect(screen.getByText("박해민 응원가 1")).toBeInTheDocument();
    expect(screen.getByText("박해민 응원가 2")).toBeInTheDocument();
    expect(screen.getByText("홍창기")).toBeInTheDocument();
    expect(screen.getByText("홍창기 응원가")).toBeInTheDocument();
  });

  it("shows an empty-state message when there are no songs", () => {
    render(<PlayerSongList songs={[]} />);
    expect(screen.getByText("선수 응원가 정보가 없어요.")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: 실패 확인**

Run: `npx vitest run tests/components/PlayerSongList.test.tsx`
Expected: FAIL (모듈 없음)

- [ ] **Step 3: 구현**

`src/components/cheer/PlayerSongList.module.css`:

```css
.list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 12px;
}
.item {
  padding: 16px 20px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
}
.player {
  color: var(--red-soft);
  font-weight: 900;
  margin-bottom: 6px;
}
.title {
  color: var(--text);
  font-size: 0.9rem;
}
.empty {
  color: var(--muted);
}
```

`src/components/cheer/PlayerSongList.tsx`:

```tsx
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
```

- [ ] **Step 4: 통과 확인 후 커밋**

Run: `npm test`
Expected: 52 passed

```bash
git add -A
git commit -m "feat: add PlayerSongList component"
```
(커밋 메시지 끝에 Co-Authored-By 트레일러)

---

### Task 4: CheerStaffList 컴포넌트

**Files:**
- Create: `src/components/cheer/CheerStaffList.tsx`, `CheerStaffList.module.css`
- Test: `tests/components/CheerStaffList.test.tsx`

- [ ] **Step 1: 실패 테스트 작성**

`tests/components/CheerStaffList.test.tsx`:

```tsx
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import CheerStaffList from "@/components/cheer/CheerStaffList";

describe("CheerStaffList", () => {
  it("groups staff by role in a fixed order", () => {
    render(
      <CheerStaffList
        staff={[
          { name: "차영현", role: "치어리더" },
          { name: "이윤승", role: "응원단장" },
          { name: "김태리", role: "부응원단장" },
        ]}
      />,
    );
    const roleLabels = screen
      .getAllByText(/^(응원단장|부응원단장|장내아나운서|치어리더)$/)
      .map((el) => el.textContent);
    expect(roleLabels).toEqual(["응원단장", "부응원단장", "치어리더"]);
    expect(screen.getByText("이윤승")).toBeInTheDocument();
    expect(screen.getByText("차영현")).toBeInTheDocument();
  });

  it("shows an empty-state message when there is no staff", () => {
    render(<CheerStaffList staff={[]} />);
    expect(screen.getByText("응원단 정보가 없어요.")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: 실패 확인**

Run: `npx vitest run tests/components/CheerStaffList.test.tsx`
Expected: FAIL (모듈 없음)

- [ ] **Step 3: 구현**

`src/components/cheer/CheerStaffList.module.css`:

```css
.groups {
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.role {
  color: var(--red-soft);
  font-weight: 900;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}
.names {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.name {
  padding: 6px 14px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 999px;
  color: var(--text);
  font-size: 0.9rem;
}
.empty {
  color: var(--muted);
}
```

`src/components/cheer/CheerStaffList.tsx`:

```tsx
import type { CheerStaffMember, CheerStaffRole } from "@/lib/types";
import styles from "./CheerStaffList.module.css";

const ROLE_ORDER: CheerStaffRole[] = ["응원단장", "부응원단장", "장내아나운서", "치어리더"];

export default function CheerStaffList({ staff }: { staff: CheerStaffMember[] }) {
  if (staff.length === 0) {
    return <p className={styles.empty}>응원단 정보가 없어요.</p>;
  }

  return (
    <div className={styles.groups}>
      {ROLE_ORDER.map((role) => {
        const members = staff.filter((member) => member.role === role);
        if (members.length === 0) return null;
        return (
          <div key={role} className={styles.group}>
            <p className={styles.role}>{role}</p>
            <ul className={styles.names}>
              {members.map((member) => (
                <li key={member.name} className={styles.name}>
                  {member.name}
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 4: 통과 확인 후 커밋**

Run: `npm test`
Expected: 54 passed

```bash
git add -A
git commit -m "feat: add CheerStaffList component"
```
(커밋 메시지 끝에 Co-Authored-By 트레일러)

---

### Task 5: CheerTools + CheerManners 컴포넌트 (정적 콘텐츠)

**Files:**
- Create: `src/components/cheer/CheerTools.tsx`, `CheerTools.module.css`
- Create: `src/components/cheer/CheerManners.tsx`, `CheerManners.module.css`
- Test: `tests/components/CheerTools.test.tsx`, `CheerManners.test.tsx`

이 둘은 props 없이 자체적으로 정적 콘텐츠(검증이 필요 없는 KBO 통용 팬 문화 상식)를 갖는 컴포넌트다. `lib/cheer.ts`를 거치지 않는다.

- [ ] **Step 1: 실패 테스트 작성**

`tests/components/CheerTools.test.tsx`:

```tsx
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import CheerTools from "@/components/cheer/CheerTools";

describe("CheerTools", () => {
  it("renders the cheer tool cards", () => {
    render(<CheerTools />);
    expect(screen.getByText("막대풍선")).toBeInTheDocument();
    expect(screen.getByText("대형 응원 카드")).toBeInTheDocument();
    expect(screen.getByText("유니폼")).toBeInTheDocument();
    expect(screen.getByText("응원봉")).toBeInTheDocument();
  });
});
```

`tests/components/CheerManners.test.tsx`:

```tsx
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import CheerManners from "@/components/cheer/CheerManners";

describe("CheerManners", () => {
  it("renders the cheer manner guidelines", () => {
    render(<CheerManners />);
    expect(
      screen.getByText("우리 팀 공격 이닝에 크게 응원하고, 수비 이닝에는 목소리를 낮춰요."),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(4);
  });
});
```

- [ ] **Step 2: 실패 확인**

Run: `npx vitest run tests/components/CheerTools.test.tsx tests/components/CheerManners.test.tsx`
Expected: FAIL (모듈 없음)

- [ ] **Step 3: 구현**

`src/components/cheer/CheerTools.module.css`:

```css
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
}
.card {
  padding: 20px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
}
.name {
  color: var(--red-soft);
  font-weight: 900;
  margin-bottom: 8px;
}
.desc {
  color: var(--muted);
  font-size: 0.9rem;
}
```

`src/components/cheer/CheerTools.tsx`:

```tsx
import styles from "./CheerTools.module.css";

const TOOLS = [
  {
    name: "막대풍선",
    description: "두 손에 하나씩 들고 부딪치며 소리를 내는 대표적인 응원 도구예요.",
  },
  {
    name: "대형 응원 카드",
    description: "관중석 전체가 함께 들어 올려 그림이나 문구를 만드는 카드 응원이에요.",
  },
  {
    name: "유니폼",
    description: "선수 이름과 번호가 새겨진 유니폼을 입고 응원하는 팬들을 쉽게 볼 수 있어요.",
  },
  {
    name: "응원봉",
    description: "LED 응원봉을 흔들며 응원가에 맞춰 리듬을 타는 팬들도 많아요.",
  },
];

export default function CheerTools() {
  return (
    <ul className={styles.grid}>
      {TOOLS.map((tool) => (
        <li key={tool.name} className={styles.card}>
          <p className={styles.name}>{tool.name}</p>
          <p className={styles.desc}>{tool.description}</p>
        </li>
      ))}
    </ul>
  );
}
```

`src/components/cheer/CheerManners.module.css`:

```css
.list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  counter-reset: manner;
}
.item {
  position: relative;
  padding-left: 32px;
  color: var(--text);
}
.item::before {
  counter-increment: manner;
  content: counter(manner);
  position: absolute;
  left: 0;
  top: 0;
  width: 22px;
  height: 22px;
  display: grid;
  place-items: center;
  background: var(--red);
  color: #fff;
  border-radius: 50%;
  font-size: 0.75rem;
  font-weight: 900;
}
```

`src/components/cheer/CheerManners.tsx`:

```tsx
import styles from "./CheerManners.module.css";

const MANNERS = [
  "우리 팀 공격 이닝에 크게 응원하고, 수비 이닝에는 목소리를 낮춰요.",
  "파울볼이 날아올 땐 주변을 살피고 다치지 않게 조심해요.",
  "상대팀을 응원하는 팬도 같은 관중석의 손님이에요. 배려하는 말과 행동을 해요.",
  "통로나 계단에서는 이동하는 다른 관람객을 위해 길을 비켜줘요.",
];

export default function CheerManners() {
  return (
    <ol className={styles.list}>
      {MANNERS.map((manner) => (
        <li key={manner} className={styles.item}>
          {manner}
        </li>
      ))}
    </ol>
  );
}
```

- [ ] **Step 4: 통과 확인 후 커밋**

Run: `npm test`
Expected: 56 passed

```bash
git add -A
git commit -m "feat: add CheerTools and CheerManners components"
```
(커밋 메시지 끝에 Co-Authored-By 트레일러)

---

### Task 6: /cheer 페이지 라우트

**Files:**
- Create: `src/app/cheer/page.tsx`, `src/app/cheer/page.module.css`

- [ ] **Step 1: page.module.css 작성**

`src/app/cheer/page.module.css`:

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
  margin: 8px 0 24px;
}
.jump {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 48px;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--border);
}
.jump a {
  color: var(--muted);
  font-weight: 700;
  font-size: 0.9rem;
}
.jump a:hover {
  color: var(--red-soft);
}
.block {
  margin-bottom: 64px;
}
.error {
  color: var(--muted);
}
```

- [ ] **Step 2: page.tsx 작성**

`src/app/cheer/page.tsx`:

```tsx
import type { Metadata } from "next";
import SectionTitle from "@/components/ui/SectionTitle";
import TeamSongList from "@/components/cheer/TeamSongList";
import PlayerSongList from "@/components/cheer/PlayerSongList";
import CheerStaffList from "@/components/cheer/CheerStaffList";
import CheerTools from "@/components/cheer/CheerTools";
import CheerManners from "@/components/cheer/CheerManners";
import { getCheerStaff, getPlayerCheerSongs, getTeamCheerSongs } from "@/lib/cheer";
import { safe } from "@/lib/safe";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "응원 문화",
  description: "LG 트윈스 팬들의 응원가와 응원 문화를 소개해요.",
};

export default async function CheerPage() {
  const [teamSongs, playerSongs, staff] = await Promise.all([
    safe(getTeamCheerSongs),
    safe(getPlayerCheerSongs),
    safe(getCheerStaff),
  ]);

  if (!teamSongs || !playerSongs || !staff) {
    return (
      <section className={`container ${styles.section}`}>
        <p className={styles.error}>응원 정보를 불러오지 못했어요.</p>
      </section>
    );
  }

  return (
    <section
      className={`container ${styles.section}`}
      aria-labelledby="cheer-page-title"
    >
      <p className={styles.eyebrow}>Cheer</p>
      <h1 id="cheer-page-title" className={styles.heading}>
        응원 문화
      </h1>
      <nav className={styles.jump} aria-label="섹션 바로가기">
        <a href="#team-songs">팀 응원가</a>
        <a href="#player-songs">선수 응원가</a>
        <a href="#cheer-staff">응원단</a>
        <a href="#cheer-tools">응원 도구</a>
        <a href="#cheer-manners">응원 매너</a>
      </nav>

      <div id="team-songs" className={styles.block}>
        <SectionTitle id="team-songs-title" eyebrow="Team" title="팀 응원가" />
        <TeamSongList songs={teamSongs} />
      </div>

      <div id="player-songs" className={styles.block}>
        <SectionTitle id="player-songs-title" eyebrow="Players" title="선수 응원가" />
        <PlayerSongList songs={playerSongs} />
      </div>

      <div id="cheer-staff" className={styles.block}>
        <SectionTitle id="cheer-staff-title" eyebrow="Staff" title="응원단" />
        <CheerStaffList staff={staff} />
      </div>

      <div id="cheer-tools" className={styles.block}>
        <SectionTitle id="cheer-tools-title" eyebrow="Tools" title="응원 도구" />
        <CheerTools />
      </div>

      <div id="cheer-manners" className={styles.block}>
        <SectionTitle id="cheer-manners-title" eyebrow="Manners" title="응원 매너" />
        <CheerManners />
      </div>
    </section>
  );
}
```

주의: 페이지 최상단에는 `SectionTitle`(내부적으로 `<h2>`를 렌더링)을 쓰지 않고 직접 `<h1>`을 쓴다 — 1·2단계와 같은 이유로, 이 페이지는 독립 페이지라 문서에 `<h1>`이 하나 있어야 한다. 반면 5개 하위 섹션은 이 페이지 안에 실제로 여러 개 있으므로 `SectionTitle`(`<h2>`)을 그대로 재사용한다.

- [ ] **Step 3: 빌드 확인 후 커밋**

Run: `npm run build`
Expected: 성공, 라우트 목록에 `/cheer` 포함

```bash
git add -A
git commit -m "feat: add /cheer page route"
```
(커밋 메시지 끝에 Co-Authored-By 트레일러)

---

### Task 7: 내비게이션 연결 (nav.ts)

**Files:**
- Modify: `src/lib/nav.ts`

- [ ] **Step 1: 응원 항목 활성화**

`src/lib/nav.ts`에서 다음 줄을:

```ts
  { label: "응원", href: "/cheer", ready: false },
```

다음으로 바꾼다:

```ts
  { label: "응원", href: "/cheer", ready: true },
```

- [ ] **Step 2: 전체 테스트 통과 확인 후 커밋**

Run: `npm test`
Expected: 56 passed (Header.test.tsx는 `NAV_ITEMS.filter(i => !i.ready).length`를 동적으로 계산하므로 수정 없이 그대로 통과한다)

Run: `npm run lint && npx tsc --noEmit && npm run build`
Expected: 전부 통과

```bash
git add -A
git commit -m "feat: activate cheer nav item"
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

Expected: 전부 에러 없이 통과, 테스트 56개 통과

- [ ] **Step 2: 데이터 실패 격리 확인**

`src/lib/cheer.ts`의 `getTeamCheerSongs` 본문을 임시로 `throw new Error("test");`로 바꾸고 `npm run build && npm start`(3000번 포트가 이미 쓰이고 있다면 `PORT=3001 npm start`) 후 `/cheer`에 접속해 확인한다.

Expected: 페이지가 크래시하지 않고 "응원 정보를 불러오지 못했어요." 문구만 보인다(`Promise.all` 중 하나라도 `null`이면 전체를 이 안내로 대체하도록 설계했다 — 정적 데이터라 부분 실패보다 단순한 전체 실패 처리가 충분하다). 확인 후 서버를 끄고 원래 코드로 되돌린다 (`git diff`가 비어야 한다).

- [ ] **Step 3: 브라우저로 직접 확인**

`npm run dev` (또는 이미 떠 있는 서버)로 `/cheer`에 접속해 다음을 확인한다:

- 팀 응원가 13개, 선수 응원가(박해민·오스틴 딘은 2곡씩 묶여서), 응원단(응원단장→부응원단장→장내아나운서→치어리더 순), 응원 도구 4개, 응원 매너 4개가 순서대로 다 보임
- 상단 섹션 바로가기 링크를 누르면 해당 섹션으로 스크롤 이동함
- 헤더 메뉴에서 "응원" 항목이 더 이상 "준비 중"이 아니고 실제로 클릭 가능함
- 모바일 폭(375px)에서 카드 그리드가 줄어들며 가로 스크롤 없음
- 키보드 Tab으로 상단 바로가기 링크들을 순서대로 탐색 가능함

- [ ] **Step 4: 마무리 커밋**

```bash
git status
git add -A
git commit -m "chore: verify cheer stage" --allow-empty
```
