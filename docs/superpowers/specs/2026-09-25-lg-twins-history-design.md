# LG 트윈스 팬사이트 — 1단계 역사/우승 기록 페이지 설계

작성일: 2026-09-25

## 1. 목표

0단계(기반 세팅 + 메인 페이지)가 완료된 상태에서, 로드맵의 1단계인 **역사/우승 기록 페이지(`/history`)**를 만든다. 창단부터 현재까지의 주요 연혁을 하나의 타임라인으로 보여주고, 우승 기록을 하이라이트로 강조한다.

### 전체 로드맵에서의 위치

0. 기반 세팅 + 메인 페이지 (완료)
1. **역사/우승 기록 (이 문서)**
2. 선수단 소개
3. 응원가/응원 문화
4. 경기 일정/결과
5. 순위/기록
6. 뉴스/게시판 커뮤니티

## 2. 확정된 결정

| 항목 | 결정 |
|------|------|
| 콘텐츠 범위 | 우승/준우승 + 창단·개명, 감독 교체, 구단/구장 변화, 주요 기록까지 전부 포함 |
| 우승 항목 상세도 | 연도 + 짧은 제목만 (상대팀/시리즈 전적 등 상세 정보는 넣지 않음) |
| 레이아웃 | 단일 세로 타임라인 (메인 페이지 미리보기와 동일한 시각 언어 확장) |
| 카테고리 표시 | 뱃지 표시 + 상단 필터(전체/우승/준우승/창단/감독/기록) |
| 사실 정보 확보 방식 | 내가 초안(연도, 사건)을 작성하고, 사용자가 하나하나 검수·확정 (검증 전까지는 실제 데이터를 커밋하지 않음) |
| 데이터 구조 | 기존 `Championship` 타입을 `HistoryEvent`로 확장 통합. 메인 페이지 `getChampionships()`는 `getHistoryEvents()`를 재사용하도록 리팩터링 |

## 3. 데이터 모델

```ts
// src/lib/types.ts
export type HistoryCategory = "우승" | "준우승" | "창단" | "감독" | "기록";

export type HistoryEvent = {
  year: number;
  category: HistoryCategory;
  title: string;        // "한국시리즈 우승" 등 짧은 제목
  description?: string; // 선택. 창단/감독/기록 항목은 한 줄 부연 설명
};
```

- `src/data/history.ts`의 `HISTORY_EVENTS: HistoryEvent[]`에 연도순으로 저장한다.
- `src/lib/history.ts`는 `getHistoryEvents(): Promise<HistoryEvent[]>` 하나만 두고, 기존 `getChampionships(): Promise<Championship[]>`는 그 내부에서 `category === "우승"`만 필터링해 재사용하도록 리팩터링한다. 메인 페이지의 `HistoryPreview` 컴포넌트는 수정하지 않는다(같은 인터페이스 유지).
- **콘텐츠 확보 절차**: 구현 단계에서 담당자(구현 에이전트 또는 나)가 창단, 개명, 우승 연도, 역대 감독 등 초안 목록을 작성해 사용자에게 제시한다. 사용자가 각 항목을 확인·수정·삭제한 후에야 `HISTORY_EVENTS`에 커밋한다. 검증되지 않은 항목은 데이터에 포함하지 않는다 (프로젝트 규칙: 불확실한 사실 정보는 넣지 않는다).

## 4. 페이지 구조 & UI

```
src/app/history/
  page.tsx            # /history 라우트, 메타데이터 포함
src/components/history/
  Timeline.tsx         # 세로 타임라인 (클라이언트, useScrollReveal 재사용)
  Timeline.module.css
  CategoryFilter.tsx   # 상단 필터 버튼 (전체/우승/준우승/창단/감독/기록)
  CategoryFilter.module.css
  EventBadge.tsx       # 카테고리 뱃지
```

- **레이아웃**: 단일 세로 타임라인. 우승 항목은 빨간 강조 색 + 큰 연도(display 폰트), 나머지는 회색 톤 + 작은 연도. 메인 페이지 `HistoryPreview`와 동일한 시각 언어를 확장한다.
- **필터**: `CategoryFilter`는 클라이언트 컴포넌트 상태(`useState`)로 선택된 카테고리를 관리하고, `Timeline`에는 필터링된 배열만 전달한다. 기본 선택은 "전체".
- **뱃지**: 타임라인 항목마다 `EventBadge`로 카테고리 텍스트를 표시한다. 우승 뱃지만 레드 배경으로 강조하고, 나머지는 회색 테두리 pill로 통일한다.
- **애니메이션**: 기존 `src/lib/animations.ts`의 `useScrollReveal` 훅을 그대로 재사용한다(`[data-scroll-item]`). GSAP 관련 코드는 새로 추가하지 않는다.
- **네비게이션 연결**: `src/lib/nav.ts`에서 "역사" 항목의 `ready`를 `true`로, `href`를 `/history`로 연결한다. 메인 페이지 `HistoryPreview`의 "전체 역사 보기" 링크도 실제 `href="/history"`로 바꾸고 `aria-disabled`와 "준비 중" 표시를 제거한다.

## 5. 접근성, 메타데이터, 에러 처리

- **필터 접근성**: `CategoryFilter`는 버튼 그룹으로 구현하고, 선택된 버튼에 `aria-pressed="true"`를 붙인다. 키보드 Tab + Enter/Space로 조작 가능해야 한다.
- **필터 전환 애니메이션**: `prefers-reduced-motion`이면 애니메이션 없이 즉시 전환한다(기존 훅이 이미 처리).
- **빈 상태**: 카테고리가 고정 목록이라 실제로 0개가 되는 경우는 드물지만, 방어적으로 "해당 카테고리 기록이 없어요" 문구를 준비한다.
- **메타데이터**: `src/app/history/page.tsx`에서 `export const metadata`로 title "역사 | LG TWINS FAN"과 description을 지정한다(루트 레이아웃의 template 활용).
- **데이터 실패 격리**: 메인 페이지와 동일한 패턴으로 `getHistoryEvents()` 실패 시 `/history` 페이지는 크래시 대신 "기록을 불러오지 못했어요" 안내 문구를 보여준다(`safe()` 재사용).
- **저작권**: 사건 설명에 실제 선수·감독 이름은 텍스트로만 쓰고, 사진·로고는 사용하지 않는다(기존 규칙 유지).

## 6. 테스트

- **단위(Vitest)**: `lib/history.ts`의 `getHistoryEvents()`와 `getChampionships()`(우승만 정확히 필터링되는지), 필터링 로직.
- **컴포넌트**: `Timeline`이 카테고리별로 올바르게 렌더링되는지, `CategoryFilter` 클릭 시 목록이 바뀌는지, 우승 항목에만 강조 스타일이 적용되는지, `EventBadge`가 카테고리에 맞는 텍스트/색을 보여주는지.
- **시각 확인**: 구현 후 실제 서버를 띄워 브라우저(또는 헤드리스 스크린샷)로 직접 확인한다.

## 7. 범위 밖 (1단계에서 하지 않는 것)

- 감독·선수 상세 프로필 페이지 (2단계 선수단 소개에서 다룬다)
- 연도별 시즌 성적표 (5단계 순위/기록에서 다룬다)
- 댓글/사용자 참여 기능 (6단계 커뮤니티에서 다룬다)
- 우승 항목의 상대팀/시리즈 전적 등 상세 정보 (연도+제목만 다룬다)
