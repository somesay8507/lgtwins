# LG 트윈스 팬사이트 0단계 (기반 세팅 + 메인 페이지) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Next.js 기반 비공식 LG 트윈스 팬사이트의 공통 레이아웃과 6개 섹션 메인 페이지를 다크 & 볼드 테마로 만든다.

**Architecture:** Next.js App Router. 페이지와 컴포넌트는 `src/lib/`의 async 함수로만 데이터에 접근하고, 그 함수가 `src/data/`의 정적/더미 데이터를 반환한다. 이후 단계에서 `lib/` 내부만 교체하면 된다. 각 섹션은 독립 컴포넌트이고, 데이터 실패 시 해당 섹션만 숨긴다. GSAP은 클라이언트 컴포넌트의 훅으로 분리하고 `prefers-reduced-motion`을 지킨다.

**Tech Stack:** Next.js (App Router), TypeScript, CSS Modules + CSS 변수, GSAP, Vitest + Testing Library

**Spec:** `docs/superpowers/specs/2026-09-20-lg-twins-foundation-design.md`

**작업 디렉터리:** `D:\DW_practice` (현재 git 저장소가 아니므로 Task 1에서 `git init`)

---

## File Structure

```
src/
  app/
    layout.tsx              # 폰트, 메타데이터, Header/Footer, skip link
    page.tsx                # 섹션 조립 + safe() 로 실패 격리
    not-found.tsx           # 커스텀 404 ("준비 중" 안내)
    sitemap.ts  robots.ts  opengraph-image.tsx
  components/
    layout/  Header.tsx Header.module.css Footer.tsx Footer.module.css
    ui/      Button.tsx SectionTitle.tsx Card.tsx ui.module.css
    home/    Hero / NextGame / Countdown / Summary / StarPlayers / HistoryPreview (.tsx + .module.css)
  data/      games.ts standings.ts players.ts history.ts
  lib/       types.ts site.ts nav.ts safe.ts countdown.ts
             games.ts standings.ts players.ts history.ts animations.ts
  styles/    tokens.css globals.css
tests/
  setup.ts
  lib/        countdown.test.ts data.test.ts safe.test.ts
  components/ Header.test.tsx Countdown.test.tsx Summary.test.tsx StarPlayers.test.tsx HistoryPreview.test.tsx
```

책임 경계:
- `data/`: 값만 보관. 로직 없음.
- `lib/*.ts` (games/standings/players/history): 컴포넌트가 부르는 유일한 데이터 창구.
- `lib/countdown.ts`: 순수 함수. 시간 계산만.
- `lib/animations.ts`: GSAP 훅. 컴포넌트는 GSAP을 직접 import하지 않는다.

---

### Task 1: 프로젝트 스캐폴딩 + 테스트 환경

**Files:**
- Create: `package.json`, `tsconfig.json`, `src/app/*` (create-next-app 생성물)
- Create: `vitest.config.ts`, `tests/setup.ts`, `tests/smoke.test.ts`
- Modify: `.gitignore`, `package.json` (scripts)

- [ ] **Step 1: git 초기화**

```bash
cd /d/DW_practice
git init
```
Expected: `Initialized empty Git repository`

- [ ] **Step 2: Next.js 생성**

```bash
npx create-next-app@latest . --ts --eslint --app --src-dir --no-tailwind --import-alias "@/*" --use-npm --yes
```
Expected: 프로젝트 파일 생성, `npm install` 완료. 기존 `docs/`, `.superpowers/`, `desktop.ini`는 그대로 둔다. 폴더가 비어있지 않다고 실패하면, 임시 폴더에 생성한 뒤 `docs/`, `.superpowers/`를 제외한 파일을 옮긴다.

- [ ] **Step 3: 의존성 설치**

```bash
npm install gsap
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

- [ ] **Step 4: .gitignore에 브레인스토밍 산출물 제외 추가**

`.gitignore` 맨 아래에 추가:
```
# visual companion
.superpowers/
desktop.ini
```

- [ ] **Step 5: Vitest 설정**

`vitest.config.ts`:
```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { "@": path.resolve(__dirname, "src") } },
  test: {
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/**/*.test.{ts,tsx}"],
  },
});
```

`tests/setup.ts` (jsdom에는 matchMedia가 없어서 GSAP matchMedia용 스텁이 필요하다):
```ts
import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

afterEach(() => cleanup());

if (!window.matchMedia) {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList;
}
```

`package.json`의 `scripts`에 추가:
```json
"test": "vitest run",
"test:watch": "vitest"
```

`tests/smoke.test.ts`:
```ts
import { describe, expect, it } from "vitest";

describe("test env", () => {
  it("runs with jsdom", () => {
    expect(document.body).toBeDefined();
  });
});
```

- [ ] **Step 6: 테스트 실행 확인**

Run: `npm test`
Expected: `1 passed`

- [ ] **Step 7: PixelConnect 표준 구조 적용**

`pixelconnect-standards` 스킬을 호출해서 `CLAUDE.md`, `.claude/rules`, `.claude/skills`, `tests/`, `docs/`를 세팅한다. 이미 있는 `src/`, `tests/`, `docs/`는 덮어쓰지 않고, 스킬이 만든 CLAUDE.md에 이 프로젝트의 규칙(아래)을 추가한다.

```markdown
## 프로젝트 규칙
- 컴포넌트/페이지는 src/data를 직접 import하지 않는다. src/lib의 함수만 쓴다.
- GSAP은 src/lib/animations.ts 훅으로만 쓴다. prefers-reduced-motion을 지킨다.
- 구단 공식 로고와 선수 사진은 쓰지 않는다. 비공식 팬사이트 고지를 유지한다.
- 더미 데이터는 반드시 "DUMMY" 주석을 붙인다. 불확실한 사실 정보는 넣지 않는다.
```

- [ ] **Step 8: 기본 dev 서버 확인 후 커밋**

Run: `npm run build`
Expected: 빌드 성공

```bash
git add -A
git commit -m "chore: scaffold Next.js app with vitest and pixelconnect standards"
```

---

### Task 2: 디자인 토큰, 전역 스타일, 루트 레이아웃 뼈대

**Files:**
- Create: `src/styles/tokens.css`, `src/styles/globals.css`, `src/lib/site.ts`
- Modify: `src/app/layout.tsx`
- Delete: `src/app/globals.css`, `src/app/page.module.css`

- [ ] **Step 1: 토큰 작성**

`src/styles/tokens.css`:
```css
:root {
  --bg: #16161a;
  --surface: #1f1f25;
  --surface-2: #2a2a32;
  --border: #33333d;
  --text: #f5f5f7;
  --muted: #a1a1aa;
  /* 대비 3:1 (큰 글씨/장식 전용). 배경 위 작은 텍스트는 --red-soft 사용 */
  --red: #c30452;
  --red-soft: #ff4d8d;

  --radius: 16px;
  --gutter: clamp(16px, 4vw, 32px);
  --max: 1120px;

  --font-sans: var(--font-noto), system-ui, sans-serif;
  --font-display: var(--font-bebas), Impact, sans-serif;
}
```

- [ ] **Step 2: 전역 스타일 작성**

`src/styles/globals.css`:
```css
@import "./tokens.css";

*,
*::before,
*::after {
  box-sizing: border-box;
}

html {
  color-scheme: dark;
  scroll-behavior: smooth;
}

body {
  margin: 0;
  background: var(--bg);
  color: var(--text);
  font-family: var(--font-sans);
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}

a {
  color: inherit;
  text-decoration: none;
}

ul,
ol {
  margin: 0;
  padding: 0;
  list-style: none;
}

h1,
h2,
h3,
p {
  margin: 0;
}

:focus-visible {
  outline: 3px solid var(--red-soft);
  outline-offset: 3px;
  border-radius: 4px;
}

.container {
  width: min(100% - 2 * var(--gutter), var(--max));
  margin-inline: auto;
}

.skip-link {
  position: absolute;
  left: 8px;
  top: -48px;
  z-index: 100;
  padding: 8px 14px;
  background: var(--red);
  color: #fff;
  border-radius: 8px;
}
.skip-link:focus {
  top: 8px;
}

@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }
  *,
  *::before,
  *::after {
    animation: none !important;
    transition: none !important;
  }
}
```

- [ ] **Step 3: 사이트 상수**

`src/lib/site.ts`:
```ts
export const SITE_NAME = "LG TWINS FAN";
export const SITE_DESCRIPTION =
  "LG 트윈스를 응원하는 팬들이 만든 비공식 팬사이트. 일정, 선수단, 역사, 응원 문화를 한곳에서.";
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
```

- [ ] **Step 4: 루트 레이아웃 (Header/Footer는 Task 4에서 추가)**

`src/app/layout.tsx`:
```tsx
import type { Metadata } from "next";
import { Noto_Sans_KR, Bebas_Neue } from "next/font/google";
import "@/styles/globals.css";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";

const noto = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
  display: "swap",
  variable: "--font-noto",
});

const bebas = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  variable: "--font-bebas",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_NAME, template: `%s | ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  openGraph: {
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    locale: "ko_KR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className={`${noto.variable} ${bebas.variable}`}>
      <body>
        <a href="#main" className="skip-link">
          본문으로 건너뛰기
        </a>
        <main id="main">{children}</main>
      </body>
    </html>
  );
}
```

- [ ] **Step 5: 기본 생성물 정리**

`src/app/globals.css`, `src/app/page.module.css` 삭제. `src/app/page.tsx`는 임시로:
```tsx
export default function Home() {
  return <h1>LG TWINS</h1>;
}
```

- [ ] **Step 6: 빌드 확인 후 커밋**

Run: `npm run build`
Expected: 성공

```bash
git add -A
git commit -m "feat: add design tokens, global styles, root layout"
```

---

### Task 3: 데이터 레이어 (타입, 더미/정적 데이터, lib 함수, safe)

**Files:**
- Create: `src/lib/types.ts`, `src/lib/safe.ts`, `src/lib/countdown.ts`
- Create: `src/data/games.ts`, `src/data/standings.ts`, `src/data/players.ts`, `src/data/history.ts`
- Create: `src/lib/games.ts`, `src/lib/standings.ts`, `src/lib/players.ts`, `src/lib/history.ts`
- Test: `tests/lib/countdown.test.ts`, `tests/lib/data.test.ts`, `tests/lib/safe.test.ts`

- [ ] **Step 1: 타입 작성**

`src/lib/types.ts`:
```ts
export type Game = {
  id: string;
  opponent: string;
  /** ISO 8601 (UTC) */
  startsAt: string;
  venue: string;
};

export type GameResult = {
  id: string;
  opponent: string;
  /** YYYY-MM-DD */
  date: string;
  result: "W" | "L" | "D";
  score: string;
};

export type StandingSummary = {
  rank: number;
  wins: number;
  losses: number;
  draws: number;
};

export type Player = {
  id: string;
  name: string;
  position: string;
};

export type Championship = {
  year: number;
};
```

- [ ] **Step 2: countdown 실패 테스트 작성**

`tests/lib/countdown.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import { getCountdown } from "@/lib/countdown";

const target = new Date("2026-09-21T09:30:00Z");

describe("getCountdown", () => {
  it("returns remaining time while upcoming", () => {
    const now = new Date("2026-09-20T00:00:00Z");
    expect(getCountdown(target, now)).toEqual({
      status: "upcoming",
      days: 1,
      hours: 9,
      minutes: 30,
      seconds: 0,
    });
  });

  it("floors partial seconds", () => {
    const now = new Date(target.getTime() - 1500);
    expect(getCountdown(target, now).seconds).toBe(1);
  });

  it("is live from start until 3 hours after", () => {
    expect(getCountdown(target, target).status).toBe("live");
    const almost = new Date(target.getTime() + 3 * 3600 * 1000 - 1);
    expect(getCountdown(target, almost).status).toBe("live");
  });

  it("is ended 3 hours after start", () => {
    const after = new Date(target.getTime() + 3 * 3600 * 1000);
    expect(getCountdown(target, after).status).toBe("ended");
  });
});
```

- [ ] **Step 3: 실패 확인**

Run: `npx vitest run tests/lib/countdown.test.ts`
Expected: FAIL (`Cannot find module '@/lib/countdown'`)

- [ ] **Step 4: countdown 구현**

`src/lib/countdown.ts`:
```ts
export type CountdownState = {
  status: "upcoming" | "live" | "ended";
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

/** 경기 시작 후 이 시간 동안은 "진행 중"으로 본다. */
const LIVE_WINDOW_MS = 3 * 60 * 60 * 1000;

export function getCountdown(target: Date, now: Date): CountdownState {
  const diff = target.getTime() - now.getTime();

  if (diff <= 0) {
    return {
      status: -diff < LIVE_WINDOW_MS ? "live" : "ended",
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    };
  }

  const total = Math.floor(diff / 1000);
  return {
    status: "upcoming",
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  };
}
```

- [ ] **Step 5: 통과 확인**

Run: `npx vitest run tests/lib/countdown.test.ts`
Expected: `4 passed`

- [ ] **Step 6: safe 실패 테스트 작성**

`tests/lib/safe.test.ts`:
```ts
import { describe, expect, it, vi } from "vitest";
import { safe } from "@/lib/safe";

describe("safe", () => {
  it("returns the resolved value", async () => {
    await expect(safe(async () => 42)).resolves.toBe(42);
  });

  it("returns null and logs when the function throws", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    await expect(
      safe(async () => {
        throw new Error("boom");
      }),
    ).resolves.toBeNull();
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});
```

- [ ] **Step 7: 실패 확인 후 구현**

Run: `npx vitest run tests/lib/safe.test.ts`
Expected: FAIL (모듈 없음)

`src/lib/safe.ts`:
```ts
/** 섹션 하나의 데이터 실패가 페이지 전체를 깨지 않도록 격리한다. */
export async function safe<T>(fn: () => Promise<T>): Promise<T | null> {
  try {
    return await fn();
  } catch (error) {
    console.error("[safe] data load failed:", error);
    return null;
  }
}
```

Run: `npx vitest run tests/lib/safe.test.ts`
Expected: `2 passed`

- [ ] **Step 8: 데이터 lib 함수 실패 테스트 작성**

`tests/lib/data.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import { getNextGame, getRecentGames } from "@/lib/games";
import { getStandingSummary } from "@/lib/standings";
import { getStarPlayers } from "@/lib/players";
import { getChampionships } from "@/lib/history";

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

describe("standings", () => {
  it("getStandingSummary returns a positive rank", async () => {
    const s = await getStandingSummary();
    expect(s).not.toBeNull();
    expect(s!.rank).toBeGreaterThan(0);
  });
});

describe("players", () => {
  it("getStarPlayers returns 3-4 players with unique ids", async () => {
    const players = await getStarPlayers();
    expect(players.length).toBeGreaterThanOrEqual(3);
    expect(players.length).toBeLessThanOrEqual(4);
    expect(new Set(players.map((p) => p.id)).size).toBe(players.length);
  });
});

describe("history", () => {
  it("getChampionships returns unique years in ascending order", async () => {
    const titles = await getChampionships();
    const years = titles.map((t) => t.year);
    expect(years).toEqual([...years].sort((a, b) => a - b));
    expect(new Set(years).size).toBe(years.length);
  });
});
```

- [ ] **Step 9: 실패 확인**

Run: `npx vitest run tests/lib/data.test.ts`
Expected: FAIL (모듈 없음)

- [ ] **Step 10: data 파일 작성**

`src/data/games.ts`:
```ts
import type { Game, GameResult } from "@/lib/types";

// DUMMY: 4단계(경기 일정/결과)에서 실제 데이터로 교체한다.
export function dummyNextGame(now: Date): Game {
  // 내일 18:30 KST (= 09:30 UTC)
  const startsAt = new Date(now);
  startsAt.setUTCDate(startsAt.getUTCDate() + 1);
  startsAt.setUTCHours(9, 30, 0, 0);
  return {
    id: "dummy-next",
    opponent: "두산 베어스",
    startsAt: startsAt.toISOString(),
    venue: "잠실야구장",
  };
}

// DUMMY: 4단계에서 실제 데이터로 교체한다.
export const DUMMY_RECENT_GAMES: GameResult[] = [
  { id: "d1", opponent: "KIA", date: "2026-09-19", result: "W", score: "5:3" },
  { id: "d2", opponent: "KIA", date: "2026-09-18", result: "W", score: "7:2" },
  { id: "d3", opponent: "삼성", date: "2026-09-16", result: "L", score: "1:4" },
  { id: "d4", opponent: "삼성", date: "2026-09-15", result: "W", score: "6:5" },
  { id: "d5", opponent: "롯데", date: "2026-09-14", result: "D", score: "3:3" },
];
```

`src/data/standings.ts`:
```ts
import type { StandingSummary } from "@/lib/types";

// DUMMY: 5단계(순위/기록)에서 실제 데이터로 교체한다.
export const DUMMY_STANDING: StandingSummary = {
  rank: 2,
  wins: 70,
  losses: 52,
  draws: 4,
};
```

`src/data/players.ts`:
```ts
import type { Player } from "@/lib/types";

// 확인 필요: 이름/포지션은 시즌 로스터와 대조해 2단계(선수단 소개)에서 검증한다.
// 등번호와 기록은 검증 전이라 넣지 않는다.
export const STAR_PLAYERS: Player[] = [
  { id: "oh-jihwan", name: "오지환", position: "유격수" },
  { id: "moon-bokyung", name: "문보경", position: "내야수" },
  { id: "park-dongwon", name: "박동원", position: "포수" },
  { id: "im-chanyu", name: "임찬규", position: "투수" },
];
```

`src/data/history.ts`:
```ts
import type { Championship } from "@/lib/types";

// 확실한 것만 기재한다. 이후 우승은 확인 후 추가한다 (1단계에서 검증).
export const CHAMPIONSHIPS: Championship[] = [
  { year: 1990 },
  { year: 1994 },
  { year: 2023 },
];
```

- [ ] **Step 11: lib 접근 함수 작성**

`src/lib/games.ts`:
```ts
import { DUMMY_RECENT_GAMES, dummyNextGame } from "@/data/games";
import type { Game, GameResult } from "./types";

export async function getNextGame(now: Date = new Date()): Promise<Game | null> {
  return dummyNextGame(now);
}

export async function getRecentGames(): Promise<GameResult[]> {
  return DUMMY_RECENT_GAMES;
}
```

`src/lib/standings.ts`:
```ts
import { DUMMY_STANDING } from "@/data/standings";
import type { StandingSummary } from "./types";

export async function getStandingSummary(): Promise<StandingSummary | null> {
  return DUMMY_STANDING;
}
```

`src/lib/players.ts`:
```ts
import { STAR_PLAYERS } from "@/data/players";
import type { Player } from "./types";

export async function getStarPlayers(): Promise<Player[]> {
  return STAR_PLAYERS;
}
```

`src/lib/history.ts`:
```ts
import { CHAMPIONSHIPS } from "@/data/history";
import type { Championship } from "./types";

export async function getChampionships(): Promise<Championship[]> {
  return CHAMPIONSHIPS;
}
```

- [ ] **Step 12: 통과 확인 후 커밋**

Run: `npm test`
Expected: 전체 통과 (smoke 1 + countdown 4 + safe 2 + data 5 = 12)

```bash
git add -A
git commit -m "feat: add data layer, countdown logic and safe wrapper"
```

---

### Task 4: 공통 UI, Header, Footer, 404

**Files:**
- Create: `src/lib/nav.ts`
- Create: `src/components/ui/Button.tsx`, `SectionTitle.tsx`, `Card.tsx`, `ui.module.css`
- Create: `src/components/layout/Header.tsx`, `Header.module.css`, `Footer.tsx`, `Footer.module.css`
- Create: `src/app/not-found.tsx`
- Modify: `src/app/layout.tsx`
- Test: `tests/components/Header.test.tsx`

- [ ] **Step 1: nav 데이터**

`src/lib/nav.ts`:
```ts
export type NavItem = { label: string; href: string; ready: boolean };

/** 페이지를 만들 때마다 해당 항목의 ready를 true로 바꾼다. */
export const NAV_ITEMS: NavItem[] = [
  { label: "일정", href: "/schedule", ready: false },
  { label: "선수단", href: "/players", ready: false },
  { label: "역사", href: "/history", ready: false },
  { label: "응원", href: "/cheer", ready: false },
  { label: "순위", href: "/standings", ready: false },
  { label: "커뮤니티", href: "/community", ready: false },
];
```

- [ ] **Step 2: Header 실패 테스트 작성**

`tests/components/Header.test.tsx`:
```tsx
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Header from "@/components/layout/Header";
import { NAV_ITEMS } from "@/lib/nav";

describe("Header", () => {
  it("links the logo to home", () => {
    render(<Header />);
    expect(screen.getByRole("link", { name: "LG TWINS" })).toHaveAttribute(
      "href",
      "/",
    );
  });

  it("renders every nav label", () => {
    render(<Header />);
    for (const item of NAV_ITEMS) {
      expect(screen.getByText(item.label)).toBeInTheDocument();
    }
  });

  it("marks pages that are not ready as disabled with a notice", () => {
    render(<Header />);
    const notReady = NAV_ITEMS.filter((i) => !i.ready).length;
    expect(screen.getAllByText("준비 중")).toHaveLength(notReady);
  });

  it("toggles the mobile menu", async () => {
    const user = userEvent.setup();
    render(<Header />);
    const button = screen.getByRole("button", { name: "메뉴" });
    expect(button).toHaveAttribute("aria-expanded", "false");
    await user.click(button);
    expect(screen.getByRole("button", { name: "닫기" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
  });
});
```

- [ ] **Step 3: 실패 확인**

Run: `npx vitest run tests/components/Header.test.tsx`
Expected: FAIL (모듈 없음)

- [ ] **Step 4: UI 컴포넌트 작성**

`src/components/ui/ui.module.css`:
```css
.button {
  display: inline-block;
  padding: 12px 24px;
  border-radius: 999px;
  font-weight: 700;
  transition: transform 0.2s, background 0.2s;
}
.button:hover {
  transform: translateY(-2px);
}
.primary {
  background: var(--red);
  color: #fff;
}
.ghost {
  border: 1px solid var(--border);
  color: var(--text);
}
.ghost:hover {
  background: var(--surface-2);
}

.title {
  margin-bottom: 32px;
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
  font-size: clamp(2rem, 5vw, 3.2rem);
  font-weight: 400;
  letter-spacing: 0.02em;
  line-height: 1.1;
}

.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 24px;
}
```

`src/components/ui/Button.tsx`:
```tsx
import Link from "next/link";
import styles from "./ui.module.css";

type Props = {
  href: string;
  variant?: "primary" | "ghost";
  children: React.ReactNode;
};

export default function Button({ href, variant = "primary", children }: Props) {
  return (
    <Link href={href} className={`${styles.button} ${styles[variant]}`}>
      {children}
    </Link>
  );
}
```

`src/components/ui/SectionTitle.tsx`:
```tsx
import styles from "./ui.module.css";

type Props = { id: string; eyebrow: string; title: string };

export default function SectionTitle({ id, eyebrow, title }: Props) {
  return (
    <div className={styles.title}>
      <p className={styles.eyebrow}>{eyebrow}</p>
      <h2 id={id} className={styles.heading}>
        {title}
      </h2>
    </div>
  );
}
```

`src/components/ui/Card.tsx`:
```tsx
import styles from "./ui.module.css";

type Props = { className?: string; children: React.ReactNode };

export default function Card({ className = "", children }: Props) {
  return <div className={`${styles.card} ${className}`}>{children}</div>;
}
```

- [ ] **Step 5: Header 구현**

`src/components/layout/Header.module.css`:
```css
.header {
  position: sticky;
  top: 0;
  z-index: 50;
  background: color-mix(in srgb, var(--bg) 88%, transparent);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--border);
}
.inner {
  width: min(100% - 2 * var(--gutter), var(--max));
  margin-inline: auto;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.logo {
  font-family: var(--font-display);
  font-size: 1.8rem;
  letter-spacing: 0.06em;
  color: var(--red-soft);
}
.toggle {
  background: none;
  border: 1px solid var(--border);
  color: var(--text);
  padding: 6px 14px;
  border-radius: 999px;
  font: inherit;
  cursor: pointer;
}
.nav {
  display: none;
  position: absolute;
  top: 64px;
  left: 0;
  right: 0;
  background: var(--bg);
  border-bottom: 1px solid var(--border);
  padding: 8px var(--gutter) 16px;
}
.nav.open {
  display: block;
}
.nav ul {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.nav a,
.soon {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 4px;
  font-weight: 500;
}
.nav a:hover {
  color: var(--red-soft);
}
.soon {
  color: var(--muted);
  cursor: not-allowed;
}
.soon small {
  font-size: 0.7rem;
  border: 1px solid var(--border);
  border-radius: 999px;
  padding: 0 8px;
}

@media (min-width: 820px) {
  .toggle {
    display: none;
  }
  .nav {
    display: block;
    position: static;
    background: none;
    border: 0;
    padding: 0;
  }
  .nav ul {
    flex-direction: row;
    gap: 20px;
  }
}
```

`src/components/layout/Header.tsx`:
```tsx
"use client";

import Link from "next/link";
import { useState } from "react";
import { NAV_ITEMS } from "@/lib/nav";
import styles from "./Header.module.css";

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/" className={styles.logo}>
          LG TWINS
        </Link>
        <button
          type="button"
          className={styles.toggle}
          aria-expanded={open}
          aria-controls="site-nav"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "닫기" : "메뉴"}
        </button>
        <nav
          id="site-nav"
          aria-label="주 메뉴"
          className={`${styles.nav} ${open ? styles.open : ""}`}
        >
          <ul>
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                {item.ready ? (
                  <Link href={item.href} onClick={() => setOpen(false)}>
                    {item.label}
                  </Link>
                ) : (
                  <span aria-disabled="true" className={styles.soon}>
                    {item.label}
                    <small>준비 중</small>
                  </span>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
```

- [ ] **Step 6: Footer 구현**

`src/components/layout/Footer.module.css`:
```css
.footer {
  margin-top: 96px;
  border-top: 1px solid var(--border);
  padding: 40px 0;
  color: var(--muted);
  font-size: 0.9rem;
}
.brand {
  font-family: var(--font-display);
  font-size: 1.6rem;
  color: var(--red-soft);
  letter-spacing: 0.06em;
  margin-bottom: 12px;
}
.notice {
  max-width: 62ch;
}
```

`src/components/layout/Footer.tsx`:
```tsx
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className="container">
        <p className={styles.brand}>LG TWINS FAN</p>
        <p className={styles.notice}>
          이 사이트는 팬이 만든 비공식 팬사이트이며 LG 트윈스 및 KBO와 관련이
          없습니다. 구단 공식 로고와 선수 사진은 사용하지 않습니다.
        </p>
      </div>
    </footer>
  );
}
```

- [ ] **Step 7: 404 페이지**

`src/app/not-found.tsx`:
```tsx
import Button from "@/components/ui/Button";

export default function NotFound() {
  return (
    <section
      className="container"
      style={{ padding: "120px 0", textAlign: "center" }}
    >
      <h1
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(3rem, 10vw, 6rem)",
          color: "var(--red-soft)",
        }}
      >
        준비 중이에요
      </h1>
      <p style={{ color: "var(--muted)", margin: "16px 0 32px" }}>
        찾는 페이지가 없거나 아직 만들고 있는 중이야. 곧 열게!
      </p>
      <Button href="/">메인으로</Button>
    </section>
  );
}
```

- [ ] **Step 8: 루트 레이아웃에 Header/Footer 연결**

`src/app/layout.tsx`의 import에 추가:
```tsx
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
```
`<body>` 내부를 다음으로 교체:
```tsx
      <body>
        <a href="#main" className="skip-link">
          본문으로 건너뛰기
        </a>
        <Header />
        <main id="main">{children}</main>
        <Footer />
      </body>
```

- [ ] **Step 9: 통과 확인 후 커밋**

Run: `npm test`
Expected: 전체 통과 (Header 4개 추가)

```bash
git add -A
git commit -m "feat: add shared ui, header, footer and 404 page"
```

---

### Task 5: GSAP 훅 + Hero

**Files:**
- Create: `src/lib/animations.ts`
- Create: `src/components/home/Hero.tsx`, `Hero.module.css`

- [ ] **Step 1: 애니메이션 훅 작성**

`src/lib/animations.ts`:
```ts
"use client";

import { useEffect, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/** 모션 줄이기 설정이 아닐 때만 애니메이션을 실행한다. */
const NO_MOTION_PREF = "(prefers-reduced-motion: no-preference)";

/** scope 안의 [data-reveal] 요소를 아래에서 올라오며 등장시킨다. */
export function useHeroReveal(scope: RefObject<HTMLElement | null>) {
  useEffect(() => {
    if (!scope.current) return;
    const mm = gsap.matchMedia(scope.current);
    mm.add(NO_MOTION_PREF, () => {
      gsap.from("[data-reveal]", {
        yPercent: 110,
        opacity: 0,
        duration: 0.9,
        ease: "power4.out",
        stagger: 0.12,
      });
    });
    return () => mm.revert();
  }, [scope]);
}

/** scope가 화면에 들어오면 [data-scroll-item] 요소를 순서대로 등장시킨다. */
export function useScrollReveal(scope: RefObject<HTMLElement | null>) {
  useEffect(() => {
    if (!scope.current) return;
    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia(scope.current);
    mm.add(NO_MOTION_PREF, () => {
      gsap.from("[data-scroll-item]", {
        opacity: 0,
        y: 32,
        duration: 0.7,
        ease: "power3.out",
        stagger: 0.12,
        scrollTrigger: { trigger: scope.current, start: "top 80%" },
      });
    });
    return () => mm.revert();
  }, [scope]);
}
```

- [ ] **Step 2: Hero 작성**

`src/components/home/Hero.module.css`:
```css
.hero {
  position: relative;
  overflow: hidden;
  padding: clamp(72px, 14vw, 160px) 0 clamp(64px, 10vw, 120px);
}
.orb {
  position: absolute;
  right: -12vw;
  bottom: -18vw;
  width: min(60vw, 560px);
  aspect-ratio: 1;
  border-radius: 50%;
  background: var(--red);
  opacity: 0.85;
  z-index: 0;
}
.content {
  position: relative;
  z-index: 1;
}
.title {
  font-family: var(--font-display);
  font-weight: 400;
  font-size: clamp(4.5rem, 18vw, 11rem);
  line-height: 0.92;
  letter-spacing: 0.01em;
}
.line {
  display: block;
  overflow: hidden;
}
.line > span {
  display: inline-block;
}
.accent {
  color: var(--red-soft);
}
.lead {
  margin-top: 24px;
  max-width: 44ch;
  color: var(--muted);
  font-size: 1.1rem;
}
.actions {
  margin-top: 32px;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}
```

`src/components/home/Hero.tsx`:
```tsx
"use client";

import { useRef } from "react";
import Button from "@/components/ui/Button";
import { useHeroReveal } from "@/lib/animations";
import styles from "./Hero.module.css";

export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  useHeroReveal(ref);

  return (
    <section ref={ref} className={styles.hero} aria-labelledby="hero-title">
      <div className={styles.orb} aria-hidden="true" />
      <div className={`container ${styles.content}`}>
        <h1 id="hero-title" className={styles.title}>
          <span className={styles.line}>
            <span data-reveal>WE ARE</span>
          </span>
          <span className={styles.line}>
            <span data-reveal className={styles.accent}>
              TWINS.
            </span>
          </span>
        </h1>
        <p className={styles.lead}>
          잠실의 밤을 붉게 물들이는 LG 트윈스, 팬이 만든 비공식 팬사이트.
        </p>
        <div className={styles.actions}>
          {/* 일정/선수단 페이지가 생기면 /schedule, /players 로 교체 */}
          <Button href="#next-game">일정 보기</Button>
          <Button href="#star-players" variant="ghost">
            선수단 보기
          </Button>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: page.tsx에 임시 연결 후 dev 서버로 확인**

`src/app/page.tsx`:
```tsx
import Hero from "@/components/home/Hero";

export default function Home() {
  return <Hero />;
}
```

Run: `npm run dev` 후 http://localhost:3000 을 브라우저로 확인.
Expected: 차콜 배경, "WE ARE TWINS." 등장 애니메이션, 우하단 레드 원. 개발자 도구에서 "Emulate prefers-reduced-motion: reduce"를 켜고 새로고침하면 애니메이션 없이 바로 표시된다.

- [ ] **Step 4: 커밋**

```bash
git add -A
git commit -m "feat: add GSAP reveal hooks and hero section"
```

---

### Task 6: NextGame + Countdown

**Files:**
- Create: `src/components/home/Countdown.tsx`, `NextGame.tsx`, `NextGame.module.css`
- Test: `tests/components/Countdown.test.tsx`

- [ ] **Step 1: Countdown 실패 테스트 작성**

`tests/components/Countdown.test.tsx`:
```tsx
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import Countdown from "@/components/home/Countdown";

const STARTS_AT = "2026-09-21T09:30:00Z";

describe("Countdown", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("shows remaining time before the game", () => {
    vi.setSystemTime(new Date("2026-09-20T00:00:00Z"));
    render(<Countdown startsAt={STARTS_AT} />);
    expect(screen.getByRole("timer")).toHaveTextContent("01일09시간30분00초");
  });

  it("shows a live notice during the game", () => {
    vi.setSystemTime(new Date("2026-09-21T10:00:00Z"));
    render(<Countdown startsAt={STARTS_AT} />);
    expect(screen.getByText("경기 진행 중")).toBeInTheDocument();
  });

  it("shows an ended notice after the game", () => {
    vi.setSystemTime(new Date("2026-09-21T13:00:00Z"));
    render(<Countdown startsAt={STARTS_AT} />);
    expect(screen.getByText("경기 종료")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: 실패 확인**

Run: `npx vitest run tests/components/Countdown.test.tsx`
Expected: FAIL (모듈 없음)

- [ ] **Step 3: NextGame 스타일 (Countdown도 공유)**

`src/components/home/NextGame.module.css`:
```css
.section {
  padding: 24px 0;
}
.card {
  display: grid;
  gap: 24px;
  background: linear-gradient(135deg, var(--surface), var(--surface-2));
}
.versus {
  font-family: var(--font-display);
  font-size: clamp(2rem, 6vw, 3.5rem);
  line-height: 1.1;
}
.versus em {
  font-style: normal;
  color: var(--red-soft);
}
.meta {
  color: var(--muted);
  margin-top: 8px;
}
.timer {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}
.unit {
  min-width: 76px;
  padding: 12px 8px;
  text-align: center;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 12px;
}
.value {
  display: block;
  font-family: var(--font-display);
  font-size: 2.2rem;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}
.label {
  display: block;
  margin-top: 4px;
  color: var(--muted);
  font-size: 0.8rem;
}
.notice {
  font-family: var(--font-display);
  font-size: 2rem;
  color: var(--red-soft);
}

@media (min-width: 820px) {
  .card {
    grid-template-columns: 1fr auto;
    align-items: center;
  }
}
```

- [ ] **Step 4: Countdown 구현**

`src/components/home/Countdown.tsx`:
```tsx
"use client";

import { useEffect, useState } from "react";
import { getCountdown } from "@/lib/countdown";
import styles from "./NextGame.module.css";

const pad = (n: number) => String(n).padStart(2, "0");

export default function Countdown({ startsAt }: { startsAt: string }) {
  // 서버/클라이언트 첫 렌더를 맞추기 위해 마운트 후에 시간을 채운다.
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!now) return <div className={styles.timer} aria-hidden="true" />;

  const c = getCountdown(new Date(startsAt), now);

  if (c.status === "live") return <p className={styles.notice}>경기 진행 중</p>;
  if (c.status === "ended") return <p className={styles.notice}>경기 종료</p>;

  const units = [
    { value: pad(c.days), label: "일" },
    { value: pad(c.hours), label: "시간" },
    { value: pad(c.minutes), label: "분" },
    { value: pad(c.seconds), label: "초" },
  ];

  return (
    <div role="timer" aria-label="경기까지 남은 시간" className={styles.timer}>
      {units.map((u) => (
        <div key={u.label} className={styles.unit}>
          <span className={styles.value}>{u.value}</span>
          <span className={styles.label}>{u.label}</span>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 5: NextGame 구현**

`src/components/home/NextGame.tsx`:
```tsx
import Card from "@/components/ui/Card";
import SectionTitle from "@/components/ui/SectionTitle";
import type { Game } from "@/lib/types";
import Countdown from "./Countdown";
import styles from "./NextGame.module.css";

const formatter = new Intl.DateTimeFormat("ko-KR", {
  dateStyle: "full",
  timeStyle: "short",
  timeZone: "Asia/Seoul",
});

export default function NextGame({ game }: { game: Game }) {
  return (
    <section
      id="next-game"
      className={`container ${styles.section}`}
      aria-labelledby="next-game-title"
    >
      <SectionTitle id="next-game-title" eyebrow="Next Game" title="다음 경기" />
      <Card className={styles.card}>
        <div>
          <p className={styles.versus}>
            LG <em>vs</em> {game.opponent}
          </p>
          <p className={styles.meta}>
            {formatter.format(new Date(game.startsAt))} · {game.venue}
          </p>
        </div>
        <Countdown startsAt={game.startsAt} />
      </Card>
    </section>
  );
}
```

- [ ] **Step 6: 통과 확인 후 커밋**

Run: `npx vitest run tests/components/Countdown.test.tsx`
Expected: `3 passed`

```bash
git add -A
git commit -m "feat: add next game section with live countdown"
```

---

### Task 7: Summary, StarPlayers, HistoryPreview

**Files:**
- Create: `src/components/home/Summary.tsx`, `Summary.module.css`
- Create: `src/components/home/StarPlayers.tsx`, `StarPlayers.module.css`
- Create: `src/components/home/HistoryPreview.tsx`, `HistoryPreview.module.css`
- Test: `tests/components/Summary.test.tsx`, `StarPlayers.test.tsx`, `HistoryPreview.test.tsx`

- [ ] **Step 1: 세 컴포넌트 실패 테스트 작성**

`tests/components/Summary.test.tsx`:
```tsx
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import Summary from "@/components/home/Summary";
import type { GameResult, StandingSummary } from "@/lib/types";

const recent: GameResult[] = [
  { id: "1", opponent: "KIA", date: "2026-09-19", result: "W", score: "5:3" },
  { id: "2", opponent: "삼성", date: "2026-09-18", result: "L", score: "1:4" },
  { id: "3", opponent: "롯데", date: "2026-09-17", result: "D", score: "3:3" },
];
const standing: StandingSummary = { rank: 2, wins: 70, losses: 52, draws: 4 };

describe("Summary", () => {
  it("shows rank and record", () => {
    render(<Summary recent={recent} standing={standing} />);
    expect(screen.getByText("2위")).toBeInTheDocument();
    expect(screen.getByText("70승 52패 4무")).toBeInTheDocument();
  });

  it("labels each recent result accessibly", () => {
    render(<Summary recent={recent} standing={standing} />);
    expect(screen.getByLabelText("승, KIA 5:3")).toBeInTheDocument();
    expect(screen.getByLabelText("패, 삼성 1:4")).toBeInTheDocument();
    expect(screen.getByLabelText("무, 롯데 3:3")).toBeInTheDocument();
  });
});
```

`tests/components/StarPlayers.test.tsx`:
```tsx
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import StarPlayers from "@/components/home/StarPlayers";

describe("StarPlayers", () => {
  it("renders a card per player", () => {
    render(
      <StarPlayers
        players={[
          { id: "a", name: "선수A", position: "투수" },
          { id: "b", name: "선수B", position: "포수" },
        ]}
      />,
    );
    expect(screen.getByText("선수A")).toBeInTheDocument();
    expect(screen.getByText("포수")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });
});
```

`tests/components/HistoryPreview.test.tsx`:
```tsx
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import HistoryPreview from "@/components/home/HistoryPreview";

describe("HistoryPreview", () => {
  it("renders each championship year", () => {
    render(<HistoryPreview titles={[{ year: 1990 }, { year: 1994 }]} />);
    expect(screen.getByText("1990")).toBeInTheDocument();
    expect(screen.getByText("1994")).toBeInTheDocument();
  });

  it("shows the full-history link as coming soon", () => {
    render(<HistoryPreview titles={[{ year: 1990 }]} />);
    expect(screen.getByText(/전체 역사 보기/)).toHaveAttribute(
      "aria-disabled",
      "true",
    );
  });
});
```

- [ ] **Step 2: 실패 확인**

Run: `npx vitest run tests/components`
Expected: Summary/StarPlayers/HistoryPreview 테스트 FAIL (모듈 없음)

- [ ] **Step 3: Summary 구현**

`src/components/home/Summary.module.css`:
```css
.section {
  padding: 24px 0;
}
.grid {
  display: grid;
  gap: 16px;
}
.rank {
  font-family: var(--font-display);
  font-size: 4rem;
  line-height: 1;
  color: var(--red-soft);
}
.record {
  color: var(--muted);
  margin-top: 4px;
}
.chips {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 8px;
}
.chip {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  font-weight: 900;
  color: #fff;
}
.W {
  background: var(--red);
}
.L {
  background: var(--surface-2);
  color: var(--muted);
}
.D {
  background: transparent;
  border: 1px solid var(--border);
  color: var(--muted);
}
.caption {
  color: var(--muted);
  font-size: 0.9rem;
}

@media (min-width: 820px) {
  .grid {
    grid-template-columns: 1fr 2fr;
  }
}
```

`src/components/home/Summary.tsx`:
```tsx
import Card from "@/components/ui/Card";
import SectionTitle from "@/components/ui/SectionTitle";
import type { GameResult, StandingSummary } from "@/lib/types";
import styles from "./Summary.module.css";

const RESULT_LABEL = { W: "승", L: "패", D: "무" } as const;

type Props = { recent: GameResult[]; standing: StandingSummary };

export default function Summary({ recent, standing }: Props) {
  return (
    <section
      className={`container ${styles.section}`}
      aria-labelledby="summary-title"
    >
      <SectionTitle id="summary-title" eyebrow="Summary" title="요즘 트윈스" />
      <div className={styles.grid}>
        <Card>
          <p className={styles.caption}>현재 순위</p>
          <p className={styles.rank}>{standing.rank}위</p>
          <p className={styles.record}>
            {standing.wins}승 {standing.losses}패 {standing.draws}무
          </p>
        </Card>
        <Card>
          <p className={styles.caption}>최근 {recent.length}경기</p>
          <ul className={styles.chips}>
            {recent.map((g) => (
              <li
                key={g.id}
                className={`${styles.chip} ${styles[g.result]}`}
                aria-label={`${RESULT_LABEL[g.result]}, ${g.opponent} ${g.score}`}
              >
                <span aria-hidden="true">{RESULT_LABEL[g.result]}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: StarPlayers 구현**

`src/components/home/StarPlayers.module.css`:
```css
.section {
  padding: 24px 0;
}
.list {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
}
.card {
  display: flex;
  flex-direction: column;
  gap: 16px;
  transition: transform 0.25s, border-color 0.25s;
}
.card:hover {
  transform: translateY(-6px);
  border-color: var(--red);
}
.avatar {
  display: grid;
  place-items: center;
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: var(--red);
  font-family: var(--font-display);
  font-size: 2.2rem;
  color: #fff;
}
.name {
  font-size: 1.3rem;
  font-weight: 900;
}
.position {
  color: var(--muted);
}
```

`src/components/home/StarPlayers.tsx`:
```tsx
"use client";

import { useRef } from "react";
import Card from "@/components/ui/Card";
import SectionTitle from "@/components/ui/SectionTitle";
import { useScrollReveal } from "@/lib/animations";
import type { Player } from "@/lib/types";
import styles from "./StarPlayers.module.css";

export default function StarPlayers({ players }: { players: Player[] }) {
  const ref = useRef<HTMLElement>(null);
  useScrollReveal(ref);

  return (
    <section
      id="star-players"
      ref={ref}
      className={`container ${styles.section}`}
      aria-labelledby="players-title"
    >
      <SectionTitle id="players-title" eyebrow="Players" title="스타 플레이어" />
      <ul className={styles.list}>
        {players.map((p) => (
          <li key={p.id} data-scroll-item>
            <Card className={styles.card}>
              {/* 선수 사진은 쓰지 않는다. 이니셜 아바타로 대체 */}
              <span className={styles.avatar} aria-hidden="true">
                {p.name.charAt(0)}
              </span>
              <div>
                <p className={styles.name}>{p.name}</p>
                <p className={styles.position}>{p.position}</p>
              </div>
            </Card>
          </li>
        ))}
      </ul>
    </section>
  );
}
```

- [ ] **Step 5: HistoryPreview 구현**

`src/components/home/HistoryPreview.module.css`:
```css
.section {
  padding: 24px 0;
}
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
  background: var(--red);
}
.year {
  font-family: var(--font-display);
  font-size: 3rem;
  line-height: 1;
  color: var(--red-soft);
}
.desc {
  color: var(--muted);
}
.more {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
  color: var(--muted);
}
.more small {
  font-size: 0.7rem;
  border: 1px solid var(--border);
  border-radius: 999px;
  padding: 0 8px;
}
```

`src/components/home/HistoryPreview.tsx`:
```tsx
"use client";

import { useRef } from "react";
import SectionTitle from "@/components/ui/SectionTitle";
import { useScrollReveal } from "@/lib/animations";
import type { Championship } from "@/lib/types";
import styles from "./HistoryPreview.module.css";

export default function HistoryPreview({ titles }: { titles: Championship[] }) {
  const ref = useRef<HTMLElement>(null);
  useScrollReveal(ref);

  return (
    <section
      ref={ref}
      className={`container ${styles.section}`}
      aria-labelledby="history-title"
    >
      <SectionTitle id="history-title" eyebrow="History" title="우승의 순간들" />
      <ol className={styles.timeline}>
        {titles.map((t) => (
          <li key={t.year} className={styles.item} data-scroll-item>
            <p className={styles.year}>{t.year}</p>
            <p className={styles.desc}>한국시리즈 우승</p>
          </li>
        ))}
      </ol>
      {/* 1단계(역사 페이지)에서 /history 링크로 교체 */}
      <span aria-disabled="true" className={styles.more}>
        전체 역사 보기 <small>준비 중</small>
      </span>
    </section>
  );
}
```

- [ ] **Step 6: 통과 확인 후 커밋**

Run: `npm test`
Expected: 전체 통과

```bash
git add -A
git commit -m "feat: add summary, star players and history preview sections"
```

---

### Task 8: 메인 페이지 조립 + 메타데이터/SEO

**Files:**
- Modify: `src/app/page.tsx`
- Create: `src/app/sitemap.ts`, `src/app/robots.ts`, `src/app/opengraph-image.tsx`

- [ ] **Step 1: 메인 페이지 조립**

`src/app/page.tsx`:
```tsx
import Hero from "@/components/home/Hero";
import NextGame from "@/components/home/NextGame";
import Summary from "@/components/home/Summary";
import StarPlayers from "@/components/home/StarPlayers";
import HistoryPreview from "@/components/home/HistoryPreview";
import { getNextGame, getRecentGames } from "@/lib/games";
import { getStandingSummary } from "@/lib/standings";
import { getStarPlayers } from "@/lib/players";
import { getChampionships } from "@/lib/history";
import { safe } from "@/lib/safe";

// 더미 경기 시간이 빌드 시점에 고정되지 않도록 1분마다 재생성한다.
export const revalidate = 60;

export default async function Home() {
  const [nextGame, recent, standing, players, titles] = await Promise.all([
    safe(() => getNextGame()),
    safe(getRecentGames),
    safe(getStandingSummary),
    safe(getStarPlayers),
    safe(getChampionships),
  ]);

  return (
    <>
      <Hero />
      {nextGame && <NextGame game={nextGame} />}
      {recent && recent.length > 0 && standing && (
        <Summary recent={recent} standing={standing} />
      )}
      {players && players.length > 0 && <StarPlayers players={players} />}
      {titles && titles.length > 0 && <HistoryPreview titles={titles} />}
    </>
  );
}
```

- [ ] **Step 2: sitemap / robots**

`src/app/sitemap.ts`:
```ts
import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: SITE_URL, lastModified: new Date() }];
}
```

`src/app/robots.ts`:
```ts
import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
```

- [ ] **Step 3: OG 이미지 (영문만 사용: 기본 폰트에 한글이 없음)**

`src/app/opengraph-image.tsx`:
```tsx
import { ImageResponse } from "next/og";

export const alt = "LG TWINS Fan Site";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 80,
          background: "#16161a",
          color: "#f5f5f7",
          fontSize: 140,
          fontWeight: 900,
          lineHeight: 1,
        }}
      >
        <div>WE ARE</div>
        <div style={{ color: "#c30452" }}>TWINS.</div>
        <div style={{ fontSize: 32, marginTop: 32, color: "#a1a1aa" }}>
          Unofficial LG Twins fan site
        </div>
      </div>
    ),
    size,
  );
}
```

- [ ] **Step 4: 빌드 및 테스트 확인 후 커밋**

Run: `npm run build && npm test`
Expected: 빌드 성공(`/`는 revalidate 60), 테스트 전체 통과

```bash
git add -A
git commit -m "feat: assemble home page with isolated sections and SEO basics"
```

---

### Task 9: 최종 검증 (lint, 브라우저, 접근성/성능)

**Files:** 없음 (검증만, 문제 발견 시 해당 파일 수정)

- [ ] **Step 1: 린트/타입/테스트/빌드**

```bash
npm run lint
npx tsc --noEmit
npm test
npm run build
```
Expected: 모두 에러 없이 통과

- [ ] **Step 2: 프로덕션 서버로 브라우저 확인**

```bash
npm start
```
http://localhost:3000 에서 아래를 눈으로 확인한다.
- Hero 등장 애니메이션, 6개 섹션이 순서대로 보임 (Hero, 다음 경기, 요즘 트윈스, 스타 플레이어, 우승의 순간들, 푸터)
- 카운트다운이 1초마다 갱신됨
- 스크롤 시 스타 플레이어/타임라인이 순서대로 등장
- 모바일 폭(375px)에서 가로 스크롤이 없고, 햄버거 메뉴가 열리고 닫힘
- 메뉴 항목이 "준비 중"으로 비활성 표시됨
- 존재하지 않는 주소(`/players`)가 커스텀 404("준비 중이에요")를 보여줌
- DevTools의 prefers-reduced-motion: reduce 에뮬레이션에서 애니메이션 없이 모든 콘텐츠가 즉시 보임
- 키보드 Tab 이동 시 포커스 링이 보이고, 첫 Tab에 "본문으로 건너뛰기"가 나타남

- [ ] **Step 3: 데이터 실패 격리 확인**

임시로 `src/lib/players.ts`의 `getStarPlayers` 본문을 `throw new Error("test");`로 바꾸고 `npm run build && npm start` 후 확인한다.
Expected: 스타 플레이어 섹션만 사라지고 나머지 섹션은 정상 표시. 확인 후 원래 코드로 되돌린다 (`git diff`가 비어야 함).

- [ ] **Step 4: Lighthouse**

다른 터미널에서:
```bash
npx lighthouse http://localhost:3000 --only-categories=performance,accessibility --chrome-flags="--headless" --view
```
Expected: 성능/접근성 모두 90 이상. 미달이면 리포트의 항목을 고치고 이 단계를 반복한다. 색 대비 지적이 나오면 작은 글씨에 `--red`가 쓰인 곳을 `--red-soft`로 바꾼다.

- [ ] **Step 5: 마무리 커밋**

```bash
git status
git add -A
git commit -m "chore: verify foundation stage" --allow-empty
```
