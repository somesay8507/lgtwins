# LG 트윈스 팬사이트 — 6단계 커뮤니티 페이지 설계

작성일: 2026-09-30

## 1. 목표

로드맵 6단계인 **커뮤니티 페이지(`/community`)**를 만든다. 팬들이 소통하는 게시판으로, 공지/자유/팬창작물 3개 카테고리를 탭으로 전환하며 봐야 한다. 글 목록과 글 상세 페이지를 제공한다.

### 전체 로드맵에서의 위치

0~5. 기반 세팅, 응원, 역사, 선수단, 일정, 순위/기록 (완료)
**6. 커뮤니티 (이 문서)**

## 2. 확정된 결정

| 항목 | 결정 |
|------|------|
| 데이터 소스 | 정적 더미 데이터. 실제 API 없음 |
| 게시판 | 공지사항(notice) / 자유 게시판(free) / 팬 창작물(fanart) |
| 글 수 | 각 카테고리 20~30개의 더미 글 |
| 정렬 | 최신순(latest) / 인기순(popular) - 클라이언트 상태로 관리 |
| 검색 | 제목 기반 간단한 클라이언트 검색 |
| 글 상세 | `/community/[id]` 동적 라우트. 댓글은 범위 밖 |
| 고지 | 페이지에 "더미 데이터" 안내 표시 |
| 홈페이지 | 영향 없음 |

## 3. 데이터 모델

```ts
// src/lib/types.ts — 추가
export type Post = {
  id: string;
  category: "notice" | "free" | "fanart";
  title: string;
  author: string;
  date: string; // YYYY-MM-DD
  views: number;
  likes: number;
  content: string; // 글 상세 페이지용
  /** 글 목록에 표시할 미리보기 (200자) */
  excerpt: string;
};

export type PostListItem = Omit<Post, "content">;
```

데이터:
- `src/data/posts.ts`: `DUMMY_POSTS: Post[]` (60~90개, 카테고리별 균등 분배)
- `src/lib/posts.ts`:
  - `getPostsByCategory(category: string, sortBy?: "latest" | "popular"): Promise<PostListItem[]>`
  - `getPost(id: string): Promise<Post | null>`
  - `searchPosts(query: string): Promise<PostListItem[]>`

## 4. 페이지 구조

```
src/app/community/
  page.tsx / page.module.css        # 글 목록
  [id]/
    page.tsx / page.module.css      # 글 상세
src/components/community/
  PostExplorer.tsx / .module.css    # 탭 + 정렬 + 검색 UI (client)
  PostList.tsx / .module.css        # 글 목록
  PostCard.tsx / .module.css        # 글 카드 (한 줄)
  PostContent.tsx / .module.css     # 글 상세 내용
```

## 5. UI 명세

### PostExplorer (클라이언트 컴포넌트)
- 탭 3개: 공지 / 자유 / 팬창작물 (aria-pressed)
- 정렬 토글: 최신순 / 인기순 (클라이언트 정렬)
- 검색 입력 (onChange 후 본문에서 필터링)
- 탭/정렬 변경 시 URL 쿼리 동기화 (선택사항 - 간단하면 상태만)
- PostList 전달: `(items: PostListItem[])`

### PostCard
- 제목 (link to `/community/[id]`)
- 작성자 · 날짜 · 조회수 · 좋아요수
- 카테고리 배지 (색상 구분)
- 호버 상태 (underline, color change)

### PostContent
- 제목 · 작성자 · 날짜 · 조회수
- 글 본문 (마크다운 미지원, 평문만)
- "목록으로" 버튼 (back to `/community`)

## 6. 에러 처리, 접근성, 테스트

- 페이지는 `safe()`로 데이터 로드 감싸기. 실패 시 "게시글을 불러오지 못했어요."
- 메타데이터: title "커뮤니티", description은 팬들의 소통 공간 소개.
- 테스트: 
  - lib: 카테고리별 필터, 정렬 (최신순/인기순), 검색, 상세 조회
  - 컴포넌트: 탭 전환, 정렬 토글, 검색 입력, PostCard 렌더링

## 7. 범위 밖

- 실제 글 작성/삭제
- 사용자 댓글/반응
- 마크다운 렌더링
- 이미지 업로드
- 회원제, 권한 관리
