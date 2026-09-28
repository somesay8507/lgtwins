# LG 트윈스 팬사이트 — 4단계 경기 일정/결과 페이지 설계

작성일: 2026-09-29

## 1. 목표

로드맵 4단계인 **경기 일정/결과 페이지(`/schedule`)**를 만든다. 다가오는 5경기와 지난 10경기를 시간순 세로 리스트로 보여준다.

### 전체 로드맵에서의 위치

0. 기반 세팅 + 메인 페이지 (완료)
1. 역사/우승 기록 (완료)
2. 선수단 소개 (완료)
3. 응원가/응원 문화 (완료)
4. **경기 일정/결과 (이 문서)**
5. 순위/기록
6. 뉴스/게시판 커뮤니티

## 2. 확정된 결정

| 항목 | 결정 |
|------|------|
| 데이터 소스 | 실제 API 연동 없이 정적 더미 데이터로 시작(범위 밖, 나중에 검토) |
| 데이터 재사용 | 메인 페이지가 이미 쓰는 `src/data/games.ts` 더미 데이터를 확장. 완전히 새로운 데이터셋을 만들지 않는다 |
| 데이터 분량 | 다가오는 5경기 + 지난 10경기 = 총 15개 |
| 레이아웃 | 단일 세로 리스트(필터·캘린더 없음). 시간순(과거→미래) 정렬 |
| 홈페이지 영향 | `NextGame`/`Summary` 컴포넌트는 수정하지 않는다. 데이터 함수 호출부만 개수를 명시하도록 바뀐다 |

## 3. 데이터 모델

```ts
// src/lib/types.ts — 기존 Game, GameResult 타입은 그대로 두고 추가
export type ScheduleEntry =
  | { kind: "upcoming"; id: string; opponent: string; venue: string; startsAt: string }
  | { kind: "past"; id: string; opponent: string; date: string; result: "W" | "L" | "D"; score: string };
```

- `src/data/games.ts`:
  - 기존 `dummyNextGame(now)`를 `dummyUpcomingGames(now)`로 일반화한다. "오늘" 기준 상대적으로 계산된 5경기(내일부터 격일 간격 정도)를 반환해, 시간이 지나도 날짜가 어색해지지 않는다. 첫 번째 항목은 기존 `dummyNextGame`과 동일한 내용(두산 베어스, 잠실야구장, 내일 18:30)을 유지해 홈페이지 "다음 경기" 표시가 그대로 이어지게 한다.
  - 기존 `DUMMY_RECENT_GAMES`(5개)에 더 과거 날짜 5개를 추가해 10개로 늘린다.
- `src/lib/games.ts`:
  - `getUpcomingGames(now?): Promise<Game[]>` — 신규. 5경기 반환.
  - `getNextGame(now?): Promise<Game | null>` — 리팩터링. `getUpcomingGames()`의 첫 번째 항목을 반환한다(기존 시그니처·동작 동일, 호출부인 홈페이지 `page.tsx`는 수정하지 않는다).
  - `getRecentGames(limit?: number): Promise<GameResult[]>` — `limit` 매개변수 추가. 생략하면 전체(10개), 지정하면 그 개수만큼(최신순) 반환한다. 홈페이지의 호출부만 `safe(() => getRecentGames(5))`로 바뀐다(기존에 이미 `safe(() => getNextGame())`처럼 화살표 함수로 감싸 호출하는 패턴이 있어 자연스럽다).
  - `getSchedule(now?): Promise<ScheduleEntry[]>` — 신규. `getRecentGames()`(10개, 최신순)를 뒤집어 오래된 순으로 만들고, 그 뒤에 `getUpcomingGames()`(5개, 가까운 순)를 이어 붙여 시간순 15개 배열을 반환한다. `/schedule` 페이지 전용.

## 4. 페이지 구조

```
src/app/schedule/
  page.tsx / page.module.css
src/components/schedule/
  ScheduleList.tsx / .module.css   # ScheduleEntry[]를 받아 세로 리스트로 렌더링, 빈 배열 처리
  ScheduleItem.tsx / .module.css    # 항목 하나. kind에 따라 다르게 렌더링
```

- `ScheduleItem`: `kind === "upcoming"`이면 "예정" 뱃지 + 날짜/시간(Asia/Seoul 포맷) + 구장. `kind === "past"`이면 승/패/무 뱃지(메인 페이지 `Summary`와 같은 색 규칙: 승=레드, 패=회색, 무=테두리만) + 날짜 + 스코어.
- 리스트 중간에 "오늘" 구분선은 넣지 않는다(15개 정도는 구분선 없이도 충분히 읽힌다 — YAGNI).
- 메인 페이지의 `NextGame`/`Summary` 컴포넌트, `src/app/page.tsx`의 렌더링 구조는 수정하지 않는다. `page.tsx`에서 `getRecentGames` 호출부만 `safe(() => getRecentGames(5))`로 바꾼다.

## 5. 접근성, 에러 처리, 테스트

- `/schedule`은 `safe(getSchedule)`로 감싸고, 실패 시 크래시 대신 "일정 정보를 불러오지 못했어요" 안내 문구를 보여준다.
- 시맨틱: `ScheduleList`는 `<ol>`(시간순이므로 순서 있는 목록)로 렌더링한다.
- 메타데이터: title "경기 일정", description은 다가오는 경기와 최근 결과를 소개하는 한 줄.
- 테스트: `lib/games.ts`의 `getUpcomingGames`(5개, 모두 `now`보다 미래 시각인지), `getRecentGames(limit)`(인자 없을 때 10개, 인자 지정 시 그 개수만큼 최신순으로), `getSchedule`(총 15개, `kind`별 개수 5/10, 시간순 정렬 확인). 기존 `getNextGame`/`getRecentGames()` 테스트는 새 시그니처에 맞게 갱신한다. 컴포넌트 테스트: `ScheduleItem`(upcoming/past 각각 올바른 뱃지·정보 렌더링), `ScheduleList`(주어진 순서대로 렌더링, 빈 배열 시 안내 문구).

## 6. 범위 밖 (4단계에서 하지 않는 것)

- 실제 KBO 데이터 연동(공식 API/크롤링) — 5단계(순위/기록)와 함께 나중에 검토
- 캘린더 뷰, 필터 UI(전체/예정/완료 등)
- 경기 하이라이트, 문자 중계, 티켓 예매 연동
- "오늘" 구분선 등 리스트 내 시각적 구획 표시
