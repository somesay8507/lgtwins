# LG 트윈스 팬사이트 — 5단계 순위/기록 페이지 설계

작성일: 2026-09-29

## 1. 목표

로드맵 5단계인 **순위/기록 페이지(`/standings`)**를 만든다. 팀 순위표, LG 팀 기록, 선수 기록 순위(리더보드)를 탭 3개로 보여준다.

### 전체 로드맵에서의 위치

0~4. 기반 세팅, 역사, 선수단, 응원, 경기 일정 (완료)
5. **순위/기록 (이 문서)**
6. 뉴스/게시판 커뮤니티

## 2. 확정된 결정

| 항목 | 결정 |
|------|------|
| 데이터 소스 | 실제 API 없이 정적 더미 데이터. 모든 수치는 가상값이고 `DUMMY` 주석을 붙인다 |
| 페이지 범위 | 팀 순위표 + LG 팀 기록 + 선수 기록 순위 |
| 선수 기록 | 이름·수치 모두 가상. "선수 A" 같은 명백한 가상 이름만 쓰고 실제 선수명은 쓰지 않는다 |
| 구단명 | 공개 사실이라 KBO 10개 구단 실제 이름 사용. 승패는 가상값 |
| 일관성 | LG 행은 기존 `DUMMY_STANDING`(2위, 70승 52패 4무)과 정확히 일치시킨다 |
| 레이아웃 | 탭 3개 [팀 순위 / 팀 기록 / 선수 기록], 클라이언트 상태 탭(역사 페이지 `HistoryExplorer` 패턴) |
| 홈페이지 영향 | `Summary`, `getStandingSummary()`는 수정하지 않는다 |
| 고지 | 페이지에 "샘플 데이터" 고지를 표시한다 |

## 3. 데이터 모델

```ts
// src/lib/types.ts — 추가
export type StandingRow = { team: string; wins: number; losses: number; draws: number };
export type StandingEntry = StandingRow & {
  rank: number;
  winPct: number;   // 승 / (승+패), 무승부 제외
  gamesBehind: number; // 1위 기준 게임차
  isLg: boolean;
};
export type TeamStat = { label: string; value: string };
export type LeaderCategory = { title: string; leaders: { name: string; value: string }[] };
```

- `src/data/standings.ts`: `DUMMY_STANDING`은 그대로 두고 `DUMMY_STANDING_ROWS`(10개 구단)를 추가한다. LG 행은 70-52-4.
- `src/data/teamStats.ts`: `DUMMY_TEAM_STATS: TeamStat[]` (팀 타율, 평균자책점, 홈런, 도루 등 6개 안팎).
- `src/data/playerLeaders.ts`: `DUMMY_LEADERS: LeaderCategory[]` (타율·홈런·타점·승리·세이브 등 부문별 상위 5명).
- `src/lib/standings.ts`:
  - `getStandings(): Promise<StandingEntry[]>` — 승률 내림차순 정렬 후 rank·winPct·gamesBehind 계산. 게임차 = ((1위 승 − 승) + (패 − 1위 패)) / 2.
  - `getTeamStats()`, `getPlayerLeaders()` — 더미 반환.
  - `getStandingSummary()` 기존 유지.
- 더미 승패는 위 정렬 결과에서 LG가 2위가 되도록 잡는다.

## 4. 페이지 구조

```
src/app/standings/page.tsx / page.module.css
src/components/standings/
  StandingsExplorer.tsx / .module.css  # client, 탭 3개
  StandingsTable.tsx / .module.css
  TeamStatsGrid.tsx / .module.css
  LeaderBoards.tsx / .module.css
```

- 컴포넌트는 `src/data`를 직접 import하지 않고 lib 함수 결과만 props로 받는다.
- `StandingsTable`: `<table>` + `<caption>`, 헤더 `scope="col"`. LG 행은 강조(레드 포인트 + 텍스트 표기 "LG" 구분, 색에만 의존하지 않는다).
- `TeamStatsGrid`: 지표 카드 그리드(`<dl>`).
- `LeaderBoards`: 부문별 `<section>` + `<ol>`.
- `StandingsExplorer`: `aria-pressed` 버튼 그룹, 탭 전환 시 해당 패널만 렌더링.
- `nav.ts`의 순위 항목 `ready: true`.

## 5. 에러 처리, 접근성, 테스트

- 페이지는 3개 데이터를 `safe()`로 각각 감싸고, 하나라도 null이면 "순위 정보를 불러오지 못했어요." 문구를 보여준다.
- 메타데이터: title "순위/기록", description은 팀 순위·팀 기록·선수 기록 소개 한 줄.
- 테스트: lib(정렬, 승률·게임차 계산, LG 행이 `getStandingSummary()`와 일치, 리더보드 부문별 5명), 컴포넌트(`StandingsTable` LG 강조·행 수, `LeaderBoards` 렌더링, `StandingsExplorer` 탭 전환).

## 6. 범위 밖

- 실제 KBO 데이터 연동
- 정렬/필터 UI, 상대전적·월별 기록, 선수 개인 상세 기록
- sitemap 정리
