# 커뮤니티 인터랙티브 기능 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Supabase를 통해 게시물 작성/수정/삭제 및 댓글 기능을 추가하여 실제로 소통 가능한 커뮤니티를 만든다.

**Architecture:** 서버 액션으로 Supabase에 데이터를 저장하고, Supabase 실시간 구독으로 UI를 업데이트한다. 닉네임 기반 작성자 검증으로 간단하면서도 안전한 UX를 제공한다.

**Tech Stack:** Next.js (App Router + Server Actions), TypeScript, Supabase (@supabase/supabase-js), Vitest + Testing Library

**Spec:** `docs/superpowers/specs/2026-09-30-lg-twins-community-interactive.md`

---

## File Structure

```
src/
  app/
    actions/
      posts.ts                      # 게시물 CRUD 서버 액션
      comments.ts                   # 댓글 CRUD 서버 액션
    community/
      page.tsx (수정)               # 플로팅 "글 작성" 버튼 추가
      [id]/
        page.tsx (수정)             # 댓글 섹션 추가
  components/
    community/
      PostFormModal.tsx             # 게시물 작성 모달
      CommentList.tsx               # 댓글 목록
      CommentForm.tsx               # 댓글 입력 폼
      DeleteButton.tsx              # 안전한 삭제 버튼
  lib/
    supabase.ts (새)                # Supabase 클라이언트
    supabase-server.ts (새)         # Server Actions용 Supabase 클라이언트
src/lib/types.ts (수정)             # Comment 타입 추가
tests/
  actions/
    posts.test.ts                   # 서버 액션 테스트
    comments.test.ts
  components/
    PostFormModal.test.tsx
    CommentForm.test.tsx
```

---

### Task 1: Supabase 초기화 & 환경 설정

**Files:**
- Create: `src/lib/supabase.ts`, `src/lib/supabase-server.ts`
- Create: `.env.local` (템플릿)
- Modify: `src/lib/types.ts`

- [ ] **Step 1: Supabase 클라이언트 라이브러리 설치**

```bash
npm install @supabase/supabase-js
```

- [ ] **Step 2: 환경변수 템플릿 작성**

`.env.local.example`:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

사용자가 자신의 Supabase 프로젝트 URL/키를 입력하도록 가이드.

- [ ] **Step 3: Supabase 클라이언트 (브라우저용)**

`src/lib/supabase.ts`:
```ts
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
```

- [ ] **Step 4: Supabase 클라이언트 (Server Actions용)**

`src/lib/supabase-server.ts`:
```ts
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createServerClient_() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options as CookieOptions),
            );
          } catch {
            // Set cookies during Server Components rendering is a no-op
          }
        },
      },
    },
  );
}
```

- [ ] **Step 5: Comment 타입 추가**

`src/lib/types.ts`에 추가:
```ts
export type Comment = {
  id: string;
  post_id: string;
  author: string;
  content: string;
  created_at: string; // ISO 8601
};
```

- [ ] **Step 6: Supabase 대시보드에서 테이블 수동 생성 (또는 SQL 스크립트 제공)**

사용자가 Supabase 콘솔에서 아래 SQL을 실행하도록 안내:

```sql
-- posts 테이블
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
  updated_at TIMESTAMP DEFAULT now()
);

-- RLS
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY posts_all ON posts FOR SELECT USING (true);
CREATE POLICY posts_insert ON posts FOR INSERT WITH CHECK (true);
CREATE POLICY posts_update ON posts FOR UPDATE USING (true);
CREATE POLICY posts_delete ON posts FOR DELETE USING (true);

-- comments 테이블
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  author TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY comments_all ON comments FOR SELECT USING (true);
CREATE POLICY comments_insert ON comments FOR INSERT WITH CHECK (true);
CREATE POLICY comments_delete ON comments FOR DELETE USING (true);
```

- [ ] **Step 7: 초기 free 게시물 데이터 Supabase에 insert**

사용자가 수동으로 몇 개 게시물을 추가하거나, 스크립트로 자동 삽입.

- [ ] **Step 8: 빌드/타입 확인**

```bash
npx tsc --noEmit
npm run build
```

Expected: 성공

- [ ] **Step 9: 커밋**

```bash
git add src/lib/supabase.ts src/lib/supabase-server.ts .env.local.example src/lib/types.ts
git commit -m "chore: initialize Supabase client and schema"
```

---

### Task 2: 게시물 CRUD 서버 액션 & 테스트

**Files:**
- Create: `src/app/actions/posts.ts`
- Create: `tests/actions/posts.test.ts`

- [ ] **Step 1: 테스트 작성**

`tests/actions/posts.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import {
  createPost,
  updatePost,
  deletePost,
  incrementViews,
} from "@/app/actions/posts";

describe("posts actions", () => {
  describe("createPost", () => {
    it("creates a post with valid input", async () => {
      const result = await createPost({
        category: "free",
        title: "테스트 글",
        author: "테스터",
        content: "테스트 내용",
      });
      expect(result).toHaveProperty("id");
      expect(result.title).toBe("테스트 글");
    });

    it("rejects empty title", async () => {
      expect(
        createPost({
          category: "free",
          title: "",
          author: "테스터",
          content: "내용",
        }),
      ).rejects.toThrow();
    });
  });

  describe("updatePost", () => {
    it("updates post if author matches", async () => {
      // Mock 또는 실제 post 필요
    });

    it("rejects if author doesn't match", async () => {
      // 작성자 검증 테스트
    });
  });

  describe("deletePost", () => {
    it("deletes post if author matches", async () => {
      // Mock 또는 실제 post 필요
    });

    it("rejects if author doesn't match", async () => {
      // 작성자 검증 테스트
    });
  });

  describe("incrementViews", () => {
    it("increments views by 1", async () => {
      // Mock 또는 실제 post 필요
    });
  });
});
```

- [ ] **Step 2: 서버 액션 구현**

`src/app/actions/posts.ts`:
```ts
"use server";

import { createServerClient_ } from "@/lib/supabase-server";
import type { Post } from "@/lib/types";

export async function createPost({
  category,
  title,
  author,
  content,
}: {
  category: "notice" | "free" | "fanart";
  title: string;
  author: string;
  content: string;
}): Promise<Post> {
  if (!title.trim()) throw new Error("제목은 필수입니다.");
  if (!author.trim()) throw new Error("닉네임은 필수입니다.");
  if (!content.trim()) throw new Error("내용은 필수입니다.");

  const excerpt = content.substring(0, 100).trim();
  const supabase = await createServerClient_();

  const { data, error } = await supabase
    .from("posts")
    .insert([{ category, title, author, content, excerpt }])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Post;
}

export async function updatePost({
  id,
  title,
  content,
  author,
}: {
  id: string;
  title: string;
  content: string;
  author: string;
}): Promise<Post | null> {
  const supabase = await createServerClient_();

  // 작성자 검증: 현재 게시물의 author와 비교
  const { data: current } = await supabase
    .from("posts")
    .select("author")
    .eq("id", id)
    .single();

  if (!current || current.author !== author) {
    throw new Error("작성자만 수정할 수 있습니다.");
  }

  const excerpt = content.substring(0, 100).trim();
  const { data, error } = await supabase
    .from("posts")
    .update({ title, content, excerpt, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Post | null;
}

export async function deletePost({
  id,
  author,
}: {
  id: string;
  author: string;
}): Promise<boolean> {
  const supabase = await createServerClient_();

  // 작성자 검증
  const { data: current } = await supabase
    .from("posts")
    .select("author")
    .eq("id", id)
    .single();

  if (!current || current.author !== author) {
    throw new Error("작성자만 삭제할 수 있습니다.");
  }

  const { error } = await supabase.from("posts").delete().eq("id", id);

  if (error) throw new Error(error.message);
  return true;
}

export async function incrementViews(id: string): Promise<void> {
  const supabase = await createServerClient_();

  await supabase.rpc("increment_views", { post_id: id });
}
```

(또는 간단하게 SQL UPDATE로 직접 처리)

- [ ] **Step 3: 테스트 실행**

```bash
npm test -- tests/actions/posts.test.ts
```

Expected: 통과 (또는 Supabase 미연결로 skip)

- [ ] **Step 4: 빌드 확인**

```bash
npm run build
```

Expected: 성공

- [ ] **Step 5: 커밋**

```bash
git add src/app/actions/posts.ts tests/actions/posts.test.ts
git commit -m "feat: add posts CRUD server actions"
```

---

### Task 3: 댓글 CRUD 서버 액션 & 테스트

**Files:**
- Create: `src/app/actions/comments.ts`
- Create: `tests/actions/comments.test.ts`

- [ ] **Step 1-5: posts와 동일 패턴**

`src/app/actions/comments.ts`:
```ts
"use server";

import { createServerClient_ } from "@/lib/supabase-server";
import type { Comment } from "@/lib/types";

export async function createComment({
  post_id,
  author,
  content,
}: {
  post_id: string;
  author: string;
  content: string;
}): Promise<Comment> {
  if (!author.trim()) throw new Error("닉네임은 필수입니다.");
  if (!content.trim()) throw new Error("댓글은 필수입니다.");

  const supabase = await createServerClient_();

  const { data, error } = await supabase
    .from("comments")
    .insert([{ post_id, author, content }])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Comment;
}

export async function deleteComment({
  id,
  author,
}: {
  id: string;
  author: string;
}): Promise<boolean> {
  const supabase = await createServerClient_();

  const { data: current } = await supabase
    .from("comments")
    .select("author")
    .eq("id", id)
    .single();

  if (!current || current.author !== author) {
    throw new Error("작성자만 삭제할 수 있습니다.");
  }

  const { error } = await supabase.from("comments").delete().eq("id", id);

  if (error) throw new Error(error.message);
  return true;
}
```

- [ ] **Step 2: 테스트 작성 및 실행**

- [ ] **Step 3: 커밋**

```bash
git add src/app/actions/comments.ts tests/actions/comments.test.ts
git commit -m "feat: add comments CRUD server actions"
```

---

### Task 4: 클라이언트 컴포넌트 (PostFormModal, CommentForm, DeleteButton)

**Files:**
- Create: `src/components/community/PostFormModal.tsx`
- Create: `src/components/community/CommentForm.tsx`
- Create: `src/components/community/DeleteButton.tsx`
- Create: `src/components/community/CommentList.tsx`
- Create: `tests/components/PostFormModal.test.tsx`, `CommentForm.test.tsx`

- [ ] **Step 1: PostFormModal 테스트**

폼이 열리고, 입력받고, 제출되는지 확인.

- [ ] **Step 2: PostFormModal 구현**

```tsx
"use client";

import { useState } from "react";
import { createPost } from "@/app/actions/posts";

export default function PostFormModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [category, setCategory] = useState("free");
  const [author, setAuthor] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await createPost({ category: category as any, title, author, content });
      onClose();
      // 페이지 새로고침 또는 Supabase 구독 업데이트
      window.location.reload();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "var(--surface)", padding: "32px", borderRadius: "16px", width: "90%", maxWidth: "500px" }}>
        <h2>글 작성</h2>
        {error && <p style={{ color: "var(--red)" }}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="free">자유 게시판</option>
            <option value="notice">공지사항</option>
            <option value="fanart">팬 창작물</option>
          </select>
          <input
            type="text"
            placeholder="닉네임"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="제목"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <textarea
            placeholder="내용"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={8}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? "작성 중..." : "작성"}
          </button>
          <button type="button" onClick={onClose} disabled={loading}>
            취소
          </button>
        </form>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: CommentForm 구현**

```tsx
"use client";

import { createComment } from "@/app/actions/comments";
import { useState } from "react";

export default function CommentForm({ postId }: { postId: string }) {
  const [author, setAuthor] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await createComment({ post_id: postId, author, content });
      setAuthor("");
      setContent("");
      // 댓글 목록 새로고침
      window.location.reload();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h3>댓글 작성</h3>
      {error && <p style={{ color: "var(--red)" }}>{error}</p>}
      <input
        type="text"
        placeholder="닉네임"
        value={author}
        onChange={(e) => setAuthor(e.target.value)}
        required
      />
      <textarea
        placeholder="댓글을 남겨주세요"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={3}
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? "등록 중..." : "댓글 등록"}
      </button>
    </form>
  );
}
```

- [ ] **Step 4: DeleteButton & CommentList 구현**

- [ ] **Step 5: 테스트 실행**

```bash
npm test
```

- [ ] **Step 6: 커밋**

```bash
git add src/components/community/{PostFormModal,CommentForm,DeleteButton,CommentList}.tsx tests/components
git commit -m "feat: add form components for posts and comments"
```

---

### Task 5: 페이지 수정 (글 목록 & 상세)

**Files:**
- Modify: `src/app/community/page.tsx`
- Modify: `src/app/community/[id]/page.tsx`

- [ ] **Step 1: /community 페이지 수정**

플로팅 "글 작성" 버튼 추가, PostFormModal 연결.

- [ ] **Step 2: /community/[id] 페이지 수정**

댓글 섹션 추가 (CommentList + CommentForm).

- [ ] **Step 3: Supabase 데이터 로드**

`getPostsByCategory` 등에서 Supabase 데이터를 먼저 가져오도록 수정.

- [ ] **Step 4: 실시간 구독 (선택)**

Supabase 실시간 구독으로 새 댓글/게시물 즉시 반영 (클라이언트 사이드).

- [ ] **Step 5: 빌드 확인**

```bash
npm run build
```

- [ ] **Step 6: 커밋**

```bash
git add src/app/community
git commit -m "feat: integrate posts and comments into community pages"
```

---

### Task 6: 최종 테스트 & 브라우저 검증

**Files:** 없음 (검증만)

- [ ] **Step 1: 전체 테스트**

```bash
npm test
```

Expected: 모든 테스트 통과

- [ ] **Step 2: 빌드 & 타입**

```bash
npm run build
npx tsc --noEmit
```

Expected: 성공

- [ ] **Step 3: dev 서버로 실제 동작 확인**

```bash
npm run dev
```

**예상되는 동작:**
- /community에 "글 작성" 버튼 → 모달 열림
- 모달에서 제목, 닉네임, 내용 입력 후 제출
- Supabase에 저장되고 목록에 즉시 반영
- 글 클릭 → 상세 페이지
- 상세 페이지에서 댓글 입력 → 댓글 저장 & 목록 새로고침
- 내 글/댓글 삭제 → 작성자 닉네임 확인 후 삭제

- [ ] **Step 4: 모바일 반응형 확인**

375px 폭에서도 폼이 제대로 보이는지 확인.

- [ ] **Step 5: Lighthouse (선택)**

```bash
npx lighthouse http://localhost:3000/community --only-categories=performance,accessibility
```

Expected: 90 이상

- [ ] **Step 6: 최종 커밋**

```bash
git status
git add -A
git commit -m "chore: verify community interactive features" --allow-empty
```

---

## 완료 체크리스트

- [ ] Supabase 초기화 & 스키마 생성
- [ ] 게시물/댓글 CRUD 서버 액션
- [ ] 클라이언트 폼 컴포넌트
- [ ] 페이지 통합
- [ ] 모든 테스트 통과
- [ ] 빌드 성공
- [ ] 브라우저 실제 동작 확인
- [ ] 최종 커밋 완료
