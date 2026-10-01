# LG 트윈스 팬사이트 — 커뮤니티 인터랙티브 기능 설계

작성일: 2026-09-30

## 1. 목표

**정적 커뮤니티 페이지**에 **실제 작성/삭제 기능**을 추가한다. 사용자가 게시물을 작성하고, 댓글을 달아 소통할 수 있게 한다. Supabase + 서버 액션으로 구현.

## 2. 확정된 결정

| 항목 | 결정 |
|------|------|
| 데이터 소스 | Supabase (실시간 데이터) |
| 인증 | 익명 사용자 (필드: 닉네임, 비밀번호 X) |
| 게시물 작성 | 누구나 가능 (닉네임 + 제목 + 내용) |
| 게시물 수정 | 작성자만 (닉네임으로 인증) |
| 게시물 삭제 | 작성자만 |
| 댓글 | 모든 게시물에 가능 (닉네임 + 내용) |
| 댓글 수정 | 범위 밖 (삭제만) |
| UI | 모달(게시물 작성) + 인라인(댓글 입력) |
| 카테고리 | 기존 3개(notice/free/fanart) 유지 |
| 더미 데이터 | notice/fanart는 기존 정적 데이터 유지, free만 실제 데이터 사용 |

## 3. 데이터 모델 (Supabase)

### 테이블: `posts`

```sql
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL CHECK (category IN ('notice', 'free', 'fanart')),
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  views INT DEFAULT 0,
  likes INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  CONSTRAINT unique_title_per_category UNIQUE(category, title)
);

-- RLS: 모든 사람 읽기 가능, 작성자만 수정/삭제
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY posts_read ON posts FOR SELECT USING (true);
CREATE POLICY posts_insert ON posts FOR INSERT WITH CHECK (true);
CREATE POLICY posts_update ON posts FOR UPDATE USING (true);
CREATE POLICY posts_delete ON posts FOR DELETE USING (true);
```

### 테이블: `comments`

```sql
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  author TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT now(),
  CONSTRAINT min_length CHECK (length(content) > 0)
);

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY comments_read ON comments FOR SELECT USING (true);
CREATE POLICY comments_insert ON comments FOR INSERT WITH CHECK (true);
CREATE POLICY comments_delete ON comments FOR DELETE USING (true);
```

## 4. API 설계 (Server Actions)

### `src/app/actions/posts.ts`
- `createPost(category, title, author, content): Promise<Post>`
- `updatePost(id, title, content, author): Promise<Post | null>`
- `deletePost(id, author): Promise<boolean>` (작성자 검증)
- `incrementViews(id): Promise<void>`

### `src/app/actions/comments.ts`
- `createComment(postId, author, content): Promise<Comment>`
- `deleteComment(id, author): Promise<boolean>` (작성자 검증)

## 5. UI 컴포넌트

### 페이지
- **`/community`**: 목록 (기존) + 플로팅 "글 작성" 버튼
- **`/community/[id]`**: 상세 + 댓글 섹션

### 새로운 컴포넌트
- `PostFormModal.tsx` - 게시물 작성 폼 (모달)
- `CommentList.tsx` - 댓글 목록
- `CommentForm.tsx` - 댓글 입력 폼
- `DeleteButton.tsx` - 안전한 삭제 버튼 (확인 필요)

### 기존 수정
- `PostCard.tsx` - "조회수" 실시간 반영
- `PostContent.tsx` - 댓글 섹션 추가

## 6. 페이지 흐름

### 게시물 작성
1. 사용자 "글 작성" 버튼 클릭
2. 모달 열기 (카테고리 선택, 닉네임, 제목, 내용)
3. 서버 액션으로 insert
4. 성공 → 모달 닫고 목록 새로고침 (Supabase 실시간 구독)

### 게시물 삭제
1. 상세 페이지에서 "삭제" 버튼 클릭 (작성자만 보임)
2. 확인 얼럿
3. 서버 액션으로 delete (닉네임 검증)
4. 성공 → /community로 리다이렉트

### 댓글
1. 상세 페이지 하단 "댓글 작성" 폼
2. 서버 액션으로 insert
3. 성공 → 폼 리셋, 댓글 목록 새로고침

## 7. 기술 스택

- **ORM**: `@supabase/supabase-js` (Supabase 클라이언트)
- **상태**: 서버 액션 + Supabase 실시간 구독
- **폼**: React Hook Form (선택) 또는 기본 form
- **검증**: 클라이언트(UX) + 서버(보안)

## 8. 테스트

- 서버 액션: 올바른 input/output, 작성자 검증
- 컴포넌트: 폼 렌더링, 버튼 클릭, 에러 표시
- E2E (선택): 게시물 작성 → 댓글 달기 → 삭제 흐름

## 9. 범위 밖

- 이메일 인증
- 프로필 페이지
- 알림
- 북마크
- 투표/평점
- 마크다운 렌더링
