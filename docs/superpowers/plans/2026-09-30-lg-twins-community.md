# LG 트윈스 커뮤니티 페이지 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `/community` 페이지를 만들어 팬들이 공지/자유/팬창작물 게시판에서 글을 읽고 상세 내용을 볼 수 있게 한다.

**Architecture:** 클라이언트 상태로 탭/정렬/검색을 관리하고, 서버에서 더미 데이터를 로드한다. 글 상세는 동적 라우트(`[id]`)로 제공한다. `safe()`로 데이터 실패를 격리한다.

**Tech Stack:** Next.js (App Router), TypeScript, CSS Modules, Vitest + Testing Library

**Spec:** `docs/superpowers/specs/2026-09-30-lg-twins-community-design.md`

---

## File Structure

```
src/
  app/
    community/
      page.tsx                      # 글 목록
      [id]/
        page.tsx                    # 글 상세
      page.module.css
      [id]/page.module.css
  components/
    community/
      PostExplorer.tsx              # client: 탭 + 정렬 + 검색
      PostList.tsx
      PostCard.tsx
      PostContent.tsx
      community.module.css
  data/
    posts.ts                        # DUMMY_POSTS
  lib/
    posts.ts                        # getPostsByCategory, getPost, searchPosts
src/lib/types.ts                    # Post, PostListItem 추가
src/lib/nav.ts                      # community 항목 ready: true
tests/
  components/
    PostCard.test.tsx
    PostExplorer.test.tsx
  lib/
    posts.test.ts
```

책임 경계:
- `data/posts.ts`: 더미 글 데이터만. 로직 없음.
- `lib/posts.ts`: 필터/정렬/검색 로직. 컴포넌트는 이 함수만 호출.
- `components/community/PostExplorer`: 클라이언트 상태(탭/정렬/검색). 서버에서 받은 글 배열을 재정렬/검색해서 렌더링.

---

### Task 1: 타입 정의 & 더미 데이터

**Files:**
- Modify: `src/lib/types.ts`
- Create: `src/data/posts.ts`

- [ ] **Step 1: types.ts에 Post/PostListItem 타입 추가**

`src/lib/types.ts`의 끝에 추가:

```ts
export type Post = {
  id: string;
  category: "notice" | "free" | "fanart";
  title: string;
  author: string;
  date: string; // YYYY-MM-DD
  views: number;
  likes: number;
  content: string;
  excerpt: string;
};

export type PostListItem = Omit<Post, "content">;
```

- [ ] **Step 2: 더미 데이터 작성**

`src/data/posts.ts` 생성:

```ts
import type { Post } from "@/lib/types";

// DUMMY: 모든 글은 가상이며 실제와 무관합니다.
export const DUMMY_POSTS: Post[] = [
  // 공지사항 (10개)
  {
    id: "notice-1",
    category: "notice",
    title: "2026 시즌 팬사이트 업데이트 안내",
    author: "사이트 운영진",
    date: "2026-09-30",
    views: 1250,
    likes: 87,
    excerpt: "올해 여름 업데이트로 추가된 새 기능들을 소개합니다.",
    content:
      "올해 여름 업데이트로 추가된 새 기능들을 소개합니다. 경기 일정, 선수 정보, 팀 기록 등 더욱 풍부한 정보를 한곳에서 만날 수 있게 되었습니다. 여러분의 많은 관심 부탁드립니다.",
  },
  {
    id: "notice-2",
    category: "notice",
    title: "서버 점검 안내",
    author: "사이트 운영진",
    date: "2026-09-28",
    views: 892,
    likes: 42,
    excerpt: "금주 목요일 밤 10시~11시 서버 점검이 예정되어 있습니다.",
    content:
      "금주 목요일 밤 10시~11시 서버 점검이 예정되어 있습니다. 이 시간에는 사이트 접속이 불가능할 수 있으니 양해 부탁드립니다.",
  },
  {
    id: "notice-3",
    category: "notice",
    title: "2026 팬 투표 결과 발표",
    author: "사이트 운영진",
    date: "2026-09-25",
    views: 2103,
    likes: 156,
    excerpt: "올 시즌 최고의 선수상 투표 결과를 발표합니다.",
    content:
      "올 시즌 최고의 선수상 투표 결과를 발표합니다. 총 5,000명 이상의 팬들이 참여해주셨습니다. 감사합니다!",
  },
  {
    id: "notice-4",
    category: "notice",
    title: "응원 문화 가이드라인 업데이트",
    author: "사이트 운영진",
    date: "2026-09-20",
    views: 654,
    likes: 28,
    excerpt: "건전한 팬 문화를 위해 응원 가이드라인을 정리했습니다.",
    content:
      "건전한 팬 문화를 위해 응원 가이드라인을 정리했습니다. 모든 팬들이 즐겁게 응원할 수 있는 환경을 만들어가요.",
  },
  {
    id: "notice-5",
    category: "notice",
    title: "팬사이트 5주년 기념 이벤트 안내",
    author: "사이트 운영진",
    date: "2026-09-15",
    views: 1876,
    likes: 203,
    excerpt: "팬사이트 개설 5주년을 기념하여 특별한 이벤트를 준비했습니다.",
    content:
      "팬사이트 개설 5주년을 기념하여 특별한 이벤트를 준비했습니다. 자세한 내용은 이곳을 참고해주세요.",
  },
  {
    id: "notice-6",
    category: "notice",
    title: "모바일 앱 베타 테스트 모집",
    author: "사이트 운영진",
    date: "2026-09-10",
    views: 1045,
    likes: 89,
    excerpt: "팬사이트 모바일 앱 베타 테스터를 모집합니다.",
    content:
      "팬사이트 모바일 앱 베타 테스터를 모집합니다. 아래 신청 양식을 통해 지원해주세요.",
  },
  {
    id: "notice-7",
    category: "notice",
    title: "개인정보 처리방침 개정 안내",
    author: "사이트 운영진",
    date: "2026-09-05",
    views: 523,
    likes: 15,
    excerpt: "개인정보 보호 강화를 위해 처리방침을 개정했습니다.",
    content:
      "개인정보 보호 강화를 위해 처리방침을 개정했습니다. 자세한 내용은 페이지 하단을 참고해주세요.",
  },
  {
    id: "notice-8",
    category: "notice",
    title: "커뮤니티 운영 규칙 공지",
    author: "사이트 운영진",
    date: "2026-08-30",
    views: 789,
    likes: 34,
    excerpt: "건전한 커뮤니티 운영을 위해 운영 규칙을 정리했습니다.",
    content:
      "건전한 커뮤니티 운영을 위해 운영 규칙을 정리했습니다. 모든 사용자께서 숙지해주시기 바랍니다.",
  },
  {
    id: "notice-9",
    category: "notice",
    title: "2026 시즌 일정 공개",
    author: "사이트 운영진",
    date: "2026-08-20",
    views: 3214,
    likes: 287,
    excerpt: "2026 시즌 전체 경기 일정이 공개되었습니다.",
    content:
      "2026 시즌 전체 경기 일정이 공개되었습니다. 사이트의 일정 페이지에서 자세히 확인할 수 있습니다.",
  },
  {
    id: "notice-10",
    category: "notice",
    title: "팬사이트 개설 안내",
    author: "사이트 운영진",
    date: "2026-08-10",
    views: 4521,
    likes: 512,
    excerpt: "LG 트윈스 팬들을 위한 비공식 팬사이트가 오픈했습니다.",
    content:
      "LG 트윈스 팬들을 위한 비공식 팬사이트가 오픈했습니다. 팬들이 모여 정보를 나누고 응원할 수 있는 공간입니다.",
  },

  // 자유 게시판 (10개)
  {
    id: "free-1",
    category: "free",
    title: "어제 경기 대박이었어!",
    author: "팬1",
    date: "2026-09-29",
    views: 456,
    likes: 123,
    excerpt: "어제 경기 정말 감동적이었다. 마지막 회 역전 승리 최고다!",
    content: "어제 경기 정말 감동적이었다. 마지막 회 역전 승리 최고다! 선수들 화이팅!",
  },
  {
    id: "free-2",
    category: "free",
    title: "올 시즌 최고의 경기는?",
    author: "팬2",
    date: "2026-09-28",
    views: 234,
    likes: 67,
    excerpt: "모두가 생각하는 올 시즌 최고의 경기는 어느 경기였나요?",
    content:
      "모두가 생각하는 올 시즌 최고의 경기는 어느 경기였나요? 댓글로 공유해주세요!",
  },
  {
    id: "free-3",
    category: "free",
    title: "잠실 야구장 현장 응원 팁 공유",
    author: "팬3",
    date: "2026-09-27",
    views: 612,
    likes: 89,
    excerpt: "잠실 야구장 응원 가갈 때 알면 좋은 팁들을 공유합니다.",
    content:
      "잠실 야구장 응원 가갈 때 알면 좋은 팁들을 공유합니다. 주차, 음식, 응원 물품 등 다양한 정보를 담았습니다.",
  },
  {
    id: "free-4",
    category: "free",
    title: "다음 경기 예상 선발은?",
    author: "팬4",
    date: "2026-09-26",
    views: 178,
    likes: 45,
    excerpt: "다음 경기 감독님이 누구를 선발로 내보실 것 같나요?",
    content:
      "다음 경기 감독님이 누구를 선발로 내보실 것 같나요? 자신의 예상을 댓글로 남겨주세요!",
  },
  {
    id: "free-5",
    category: "free",
    title: "팬미팅 다녀왔어요!",
    author: "팬5",
    date: "2026-09-25",
    views: 523,
    likes: 156,
    excerpt: "어제 팬미팅 다녀왔습니다. 정말 좋은 추억이 되었어요!",
    content:
      "어제 팬미팅 다녀왔습니다. 정말 좋은 추억이 되었어요! 선수들이 직접 인사해준 것도 감동적이었습니다.",
  },
  {
    id: "free-6",
    category: "free",
    title: "2025 시즌 기대되는 포인트",
    author: "팬6",
    date: "2026-09-24",
    views: 289,
    likes: 71,
    excerpt: "다음 시즌에 어떤 선수들이 활약할지 기대됩니다!",
    content:
      "다음 시즌에 어떤 선수들이 활약할지 기대됩니다! 신입 선수들도 많고 기대가 커요.",
  },
  {
    id: "free-7",
    category: "free",
    title: "응원가 새 버전 어때요?",
    author: "팬7",
    date: "2026-09-23",
    views: 401,
    likes: 92,
    excerpt: "최근 출시된 응원가 새 버전들이 정말 좋아요!",
    content:
      "최근 출시된 응원가 새 버전들이 정말 좋아요! 모두 함께 열정적으로 부르고 있습니다.",
  },
  {
    id: "free-8",
    category: "free",
    title: "팬클럽 활동 즐거워요",
    author: "팬8",
    date: "2026-09-22",
    views: 267,
    likes: 58,
    excerpt: "저도 최근에 팬클럽에 가입했는데 정말 좋습니다!",
    content:
      "저도 최근에 팬클럽에 가입했는데 정말 좋습니다! 같은 팬들을 만나고 함께 응원하는 것이 최고예요.",
  },
  {
    id: "free-9",
    category: "free",
    title: "경기장 음식 추천",
    author: "팬9",
    date: "2026-09-21",
    views: 534,
    likes: 128,
    excerpt: "잠실 야구장에서 꼭 먹어야 할 음식들을 추천합니다!",
    content:
      "잠실 야구장에서 꼭 먹어야 할 음식들을 추천합니다! 핫도그, 소주, 맥주 등 다양한 선택지가 있어요.",
  },
  {
    id: "free-10",
    category: "free",
    title: "올 시즌 회고",
    author: "팬10",
    date: "2026-09-20",
    views: 412,
    likes: 87,
    excerpt: "올 시즌도 정말 즐거웠습니다. 모두들 고생 많으셨어요!",
    content:
      "올 시즌도 정말 즐거웠습니다. 모두들 고생 많으셨어요! 내년 시즌도 함께하겠습니다.",
  },

  // 팬 창작물 (10개)
  {
    id: "fanart-1",
    category: "fanart",
    title: "[그림] 스타 선수 초상화",
    author: "미술팬1",
    date: "2026-09-29",
    views: 892,
    likes: 287,
    excerpt: "좋아하는 선수의 초상화를 그려봤습니다!",
    content:
      "좋아하는 선수의 초상화를 그려봤습니다! 여러분의 감상평을 부탁드립니다.",
  },
  {
    id: "fanart-2",
    category: "fanart",
    title: "[에세이] 팬으로서의 10년 이야기",
    author: "에세이스트1",
    date: "2026-09-28",
    views: 567,
    likes: 156,
    excerpt: "오랫동안 팬으로 지내오면서 많은 감정을 느꼈습니다.",
    content:
      "오랫동안 팬으로 지내오면서 많은 감정을 느꼈습니다. 그 이야기를 담아봤습니다.",
  },
  {
    id: "fanart-3",
    category: "fanart",
    title: "[시] 경기장의 밤",
    author: "시인1",
    date: "2026-09-27",
    views: 312,
    likes: 94,
    excerpt: "경기장의 밤하늘과 응원의 열정을 담은 시입니다.",
    content:
      "경기장의 밤하늘과 응원의 열정을 담은 시입니다. 읽어주세요.",
  },
  {
    id: "fanart-4",
    category: "fanart",
    title: "[만화] 재미있는 팬 일상",
    author: "만화가1",
    date: "2026-09-26",
    views: 734,
    likes: 212,
    excerpt: "팬의 재미있는 일상을 만화로 표현해봤어요!",
    content:
      "팬의 재미있는 일상을 만화로 표현해봤어요! 공감하실 분들 많을 것 같아요.",
  },
  {
    id: "fanart-5",
    category: "fanart",
    title: "[음악] 팬송 새 곡 공개",
    author: "뮤지션1",
    date: "2026-09-25",
    views: 456,
    likes: 128,
    excerpt: "팬들을 위해 새로운 응원 곡을 만들어봤습니다!",
    content:
      "팬들을 위해 새로운 응원 곡을 만들어봤습니다! 모두 함께 부르고 싶네요.",
  },
  {
    id: "fanart-6",
    category: "fanart",
    title: "[사진] 경기장 풍경 모음",
    author: "사진작가1",
    date: "2026-09-24",
    views: 645,
    likes: 187,
    excerpt: "경기장의 아름다운 풍경들을 사진에 담았습니다.",
    content:
      "경기장의 아름다운 풍경들을 사진에 담았습니다. 다양한 시각에서 본 경기장의 모습이에요.",
  },
  {
    id: "fanart-7",
    category: "fanart",
    title: "[일러스트] 팀 마스콧 리디자인",
    author: "일러스트레이터1",
    date: "2026-09-23",
    views: 523,
    likes: 156,
    excerpt: "팀 마스콧을 새로운 스타일로 다시 그려봤어요!",
    content:
      "팀 마스콧을 새로운 스타일로 다시 그려봤어요! 어떻게 생각하시나요?",
  },
  {
    id: "fanart-8",
    category: "fanart",
    title: "[디자인] 응원 물품 아이디어",
    author: "디자이너1",
    date: "2026-09-22",
    views: 412,
    likes: 98,
    excerpt: "새로운 응원 물품 디자인을 제안해봅니다.",
    content:
      "새로운 응원 물품 디자인을 제안해봅니다. 의견 주시면 감사하겠습니다.",
  },
  {
    id: "fanart-9",
    category: "fanart",
    title: "[영상] 경기 하이라이트 모음",
    author: "영상작가1",
    date: "2026-09-21",
    views: 789,
    likes: 224,
    excerpt: "시즌 최고의 순간들을 모아 영상으로 만들었어요!",
    content:
      "시즌 최고의 순간들을 모아 영상으로 만들었어요! 공유해주시면 감사합니다.",
  },
  {
    id: "fanart-10",
    category: "fanart",
    title: "[소설] 팬의 이야기",
    author: "소설가1",
    date: "2026-09-20",
    views: 334,
    likes: 79,
    excerpt: "팬이 겪는 감정과 경험을 소설로 담아봤습니다.",
    content:
      "팬이 겪는 감정과 경험을 소설로 담아봤습니다. 공감해주시기 바랍니다.",
  },
];
```

- [ ] **Step 3: nav.ts의 community 항목 활성화**

`src/lib/nav.ts`에서 community 항목 수정:

```ts
export const NAV_ITEMS: NavItem[] = [
  // ... 기존 항목들 ...
  { label: "커뮤니티", href: "/community", ready: true },
];
```

---

### Task 2: lib 함수 & 테스트

**Files:**
- Create: `src/lib/posts.ts`
- Create: `tests/lib/posts.test.ts`

- [ ] **Step 1: posts.lib 테스트 작성**

`tests/lib/posts.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import {
  getPost,
  getPostsByCategory,
  searchPosts,
} from "@/lib/posts";

describe("posts", () => {
  describe("getPostsByCategory", () => {
    it("returns posts filtered by category", async () => {
      const notice = await getPostsByCategory("notice");
      expect(notice.length).toBeGreaterThan(0);
      expect(notice.every((p) => p.category === "notice")).toBe(true);
    });

    it("sorts by latest by default", async () => {
      const posts = await getPostsByCategory("free");
      expect(posts[0].date).toBeGreaterThanOrEqual(posts[posts.length - 1].date);
    });

    it("sorts by popularity when requested", async () => {
      const posts = await getPostsByCategory("free", "popular");
      expect(posts[0].likes).toBeGreaterThanOrEqual(posts[1].likes);
    });
  });

  describe("getPost", () => {
    it("returns a single post by id", async () => {
      const post = await getPost("notice-1");
      expect(post).not.toBeNull();
      expect(post?.id).toBe("notice-1");
      expect(post?.content).toBeDefined();
    });

    it("returns null for non-existent id", async () => {
      const post = await getPost("invalid-id");
      expect(post).toBeNull();
    });
  });

  describe("searchPosts", () => {
    it("finds posts by title", async () => {
      const results = await searchPosts("시즌");
      expect(results.length).toBeGreaterThan(0);
      expect(results.every((p) => p.title.includes("시즌"))).toBe(true);
    });

    it("returns empty array for no matches", async () => {
      const results = await searchPosts("xyz_no_match");
      expect(results).toHaveLength(0);
    });

    it("is case-insensitive", async () => {
      const resultLower = await searchPosts("경기");
      const resultUpper = await searchPosts("경기");
      expect(resultLower.length).toBe(resultUpper.length);
    });
  });
});
```

- [ ] **Step 2: 테스트 실행 확인 (실패)**

```bash
npm test -- tests/lib/posts.test.ts
```

Expected: FAIL (모듈 없음)

- [ ] **Step 3: posts.lib 구현**

`src/lib/posts.ts`:

```ts
import { DUMMY_POSTS } from "@/data/posts";
import type { Post, PostListItem } from "./types";

export async function getPostsByCategory(
  category: string,
  sortBy: "latest" | "popular" = "latest",
): Promise<PostListItem[]> {
  const filtered = DUMMY_POSTS.filter(
    (p) => p.category === (category as Post["category"]),
  );

  if (sortBy === "popular") {
    filtered.sort((a, b) => b.likes - a.likes);
  } else {
    filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  return filtered.map(({ content, ...rest }) => rest);
}

export async function getPost(id: string): Promise<Post | null> {
  return DUMMY_POSTS.find((p) => p.id === id) ?? null;
}

export async function searchPosts(query: string): Promise<PostListItem[]> {
  const normalized = query.toLowerCase();
  return DUMMY_POSTS.filter((p) =>
    p.title.toLowerCase().includes(normalized),
  ).map(({ content, ...rest }) => rest);
}
```

- [ ] **Step 4: 테스트 통과 확인**

```bash
npm test -- tests/lib/posts.test.ts
```

Expected: 모든 테스트 통과

- [ ] **Step 5: 커밋**

```bash
git add src/lib/posts.ts src/data/posts.ts tests/lib/posts.test.ts src/lib/types.ts src/lib/nav.ts
git commit -m "feat: add posts data layer and lib functions"
```

---

### Task 3: PostCard & PostList 컴포넌트

**Files:**
- Create: `src/components/community/PostCard.tsx`
- Create: `src/components/community/PostList.tsx`
- Create: `src/components/community/community.module.css`
- Create: `tests/components/PostCard.test.tsx`

- [ ] **Step 1: community.module.css 작성**

`src/components/community/community.module.css`:

```css
.cardContainer {
  border-bottom: 1px solid var(--border);
  padding: 16px 0;
}
.cardContainer:last-child {
  border-bottom: none;
}
.cardLink {
  display: flex;
  flex-direction: column;
  gap: 8px;
  text-decoration: none;
  color: inherit;
  transition: color 0.2s;
}
.cardLink:hover .title {
  color: var(--red-soft);
}
.title {
  font-size: 1.1rem;
  font-weight: 600;
  word-break: break-word;
  line-height: 1.4;
}
.meta {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  font-size: 0.9rem;
  color: var(--muted);
}
.metaItem {
  display: flex;
  gap: 4px;
  align-items: center;
}
.badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}
.notice {
  background: rgba(255, 77, 141, 0.1);
  color: var(--red-soft);
}
.free {
  background: rgba(99, 102, 241, 0.1);
  color: #6366f1;
}
.fanart {
  background: rgba(168, 85, 247, 0.1);
  color: #a855f7;
}

.list {
  display: flex;
  flex-direction: column;
  gap: 0;
}
```

- [ ] **Step 2: PostCard 테스트 작성**

`tests/components/PostCard.test.tsx`:

```tsx
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import PostCard from "@/components/community/PostCard";
import type { PostListItem } from "@/lib/types";

const mockPost: PostListItem = {
  id: "test-1",
  category: "free",
  title: "테스트 글",
  author: "테스트러",
  date: "2026-09-30",
  views: 100,
  likes: 25,
  excerpt: "테스트 글입니다.",
};

describe("PostCard", () => {
  it("renders title as link to post detail", () => {
    render(<PostCard post={mockPost} />);
    const link = screen.getByRole("link", { name: "테스트 글" });
    expect(link).toHaveAttribute("href", "/community/test-1");
  });

  it("displays author, date, views, likes", () => {
    render(<PostCard post={mockPost} />);
    expect(screen.getByText("테스트러")).toBeInTheDocument();
    expect(screen.getByText("2026-09-30")).toBeInTheDocument();
    expect(screen.getByText("조회 100")).toBeInTheDocument();
    expect(screen.getByText("좋아요 25")).toBeInTheDocument();
  });

  it("shows category badge", () => {
    render(<PostCard post={mockPost} />);
    expect(screen.getByText("free")).toBeInTheDocument();
  });
});
```

- [ ] **Step 3: 테스트 실행 (실패)**

```bash
npm test -- tests/components/PostCard.test.tsx
```

Expected: FAIL

- [ ] **Step 4: PostCard 구현**

`src/components/community/PostCard.tsx`:

```tsx
import Link from "next/link";
import type { PostListItem } from "@/lib/types";
import styles from "./community.module.css";

export default function PostCard({ post }: { post: PostListItem }) {
  return (
    <article className={styles.cardContainer}>
      <Link href={`/community/${post.id}`} className={styles.cardLink}>
        <h3 className={styles.title}>{post.title}</h3>
      </Link>
      <div className={styles.meta}>
        <span className={styles.badge + " " + styles[post.category]}>
          {post.category}
        </span>
        <span className={styles.metaItem}>{post.author}</span>
        <span className={styles.metaItem}>{post.date}</span>
        <span className={styles.metaItem}>조회 {post.views}</span>
        <span className={styles.metaItem}>좋아요 {post.likes}</span>
      </div>
    </article>
  );
}
```

- [ ] **Step 5: PostList 구현**

`src/components/community/PostList.tsx`:

```tsx
import PostCard from "./PostCard";
import type { PostListItem } from "@/lib/types";
import styles from "./community.module.css";

export default function PostList({ items }: { items: PostListItem[] }) {
  if (items.length === 0) {
    return <p style={{ color: "var(--muted)", textAlign: "center" }}>글이 없어요.</p>;
  }
  return (
    <ol className={styles.list}>
      {items.map((item) => (
        <li key={item.id}>
          <PostCard post={item} />
        </li>
      ))}
    </ol>
  );
}
```

- [ ] **Step 6: 테스트 통과 확인**

```bash
npm test -- tests/components/PostCard.test.tsx
```

Expected: 통과

- [ ] **Step 7: 커밋**

```bash
git add src/components/community tests/components/PostCard.test.tsx
git commit -m "feat: add PostCard and PostList components"
```

---

### Task 4: PostExplorer 클라이언트 컴포넌트

**Files:**
- Create: `src/components/community/PostExplorer.tsx`
- Create: `tests/components/PostExplorer.test.tsx`

- [ ] **Step 1: PostExplorer 테스트 작성**

`tests/components/PostExplorer.test.tsx`:

```tsx
import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PostExplorer from "@/components/community/PostExplorer";
import type { PostListItem } from "@/lib/types";

const mockPosts: PostListItem[] = [
  {
    id: "1",
    category: "notice",
    title: "공지사항 1",
    author: "작가",
    date: "2026-09-30",
    views: 100,
    likes: 10,
    excerpt: "공지",
  },
  {
    id: "2",
    category: "free",
    title: "자유 글",
    author: "작가",
    date: "2026-09-29",
    views: 50,
    likes: 5,
    excerpt: "자유",
  },
  {
    id: "3",
    category: "fanart",
    title: "팬 창작물",
    author: "작가",
    date: "2026-09-28",
    views: 200,
    likes: 50,
    excerpt: "팬아트",
  },
];

describe("PostExplorer", () => {
  it("renders all posts initially", () => {
    render(<PostExplorer posts={mockPosts} />);
    expect(screen.getByText("공지사항 1")).toBeInTheDocument();
    expect(screen.getByText("자유 글")).toBeInTheDocument();
    expect(screen.getByText("팬 창작물")).toBeInTheDocument();
  });

  it("filters posts by tab", async () => {
    const user = userEvent.setup();
    render(<PostExplorer posts={mockPosts} />);
    const freeTab = screen.getByRole("button", { name: "자유" });
    await user.click(freeTab);
    expect(screen.getByText("자유 글")).toBeInTheDocument();
    expect(screen.queryByText("공지사항 1")).not.toBeInTheDocument();
  });

  it("sorts by popularity when toggled", async () => {
    const user = userEvent.setup();
    render(<PostExplorer posts={mockPosts} />);
    const sortButton = screen.getByRole("button", { name: /인기순/ });
    await user.click(sortButton);
    const items = screen.getAllByRole("heading", { level: 3 });
    expect(items[0]).toHaveTextContent("팬 창작물");
  });

  it("filters by search query", async () => {
    const user = userEvent.setup();
    render(<PostExplorer posts={mockPosts} />);
    const input = screen.getByPlaceholderText("제목으로 검색");
    await user.type(input, "팬");
    expect(screen.getByText("팬 창작물")).toBeInTheDocument();
    expect(screen.queryByText("공지사항 1")).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: 테스트 실행 (실패)**

```bash
npm test -- tests/components/PostExplorer.test.tsx
```

Expected: FAIL

- [ ] **Step 3: PostExplorer 구현**

`src/components/community/PostExplorer.tsx`에 추가:

```tsx
"use client";

import { useState, useMemo } from "react";
import PostList from "./PostList";
import type { PostListItem } from "@/lib/types";
import styles from "./community.module.css";

const CATEGORIES = [
  { value: "all", label: "전체" },
  { value: "notice", label: "공지" },
  { value: "free", label: "자유" },
  { value: "fanart", label: "팬창작물" },
] as const;

export default function PostExplorer({ posts }: { posts: PostListItem[] }) {
  const [activeTab, setActiveTab] = useState<"all" | "notice" | "free" | "fanart">("all");
  const [sortBy, setSortBy] = useState<"latest" | "popular">("latest");
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = useMemo(() => {
    let result = posts;

    if (activeTab !== "all") {
      result = result.filter((p) => p.category === activeTab);
    }

    if (searchQuery.trim()) {
      result = result.filter((p) =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    if (sortBy === "popular") {
      result.sort((a, b) => b.likes - a.likes);
    } else {
      result.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      );
    }

    return result;
  }, [posts, activeTab, sortBy, searchQuery]);

  return (
    <div>
      <div style={{ marginBottom: "32px" }}>
        <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setActiveTab(cat.value)}
              aria-pressed={activeTab === cat.value}
              style={{
                padding: "8px 16px",
                borderRadius: "999px",
                border: activeTab === cat.value ? "2px solid var(--red-soft)" : "1px solid var(--border)",
                background: activeTab === cat.value ? "var(--surface-2)" : "transparent",
                color: activeTab === cat.value ? "var(--red-soft)" : "var(--text)",
                cursor: "pointer",
                fontWeight: activeTab === cat.value ? "600" : "400",
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap" }}>
          <button
            onClick={() => setSortBy("latest")}
            aria-pressed={sortBy === "latest"}
            style={{
              padding: "8px 16px",
              borderRadius: "999px",
              border: sortBy === "latest" ? "2px solid var(--red-soft)" : "1px solid var(--border)",
              background: sortBy === "latest" ? "var(--surface-2)" : "transparent",
              color: sortBy === "latest" ? "var(--red-soft)" : "var(--text)",
              cursor: "pointer",
              fontWeight: sortBy === "latest" ? "600" : "400",
            }}
          >
            최신순
          </button>
          <button
            onClick={() => setSortBy("popular")}
            aria-pressed={sortBy === "popular"}
            style={{
              padding: "8px 16px",
              borderRadius: "999px",
              border: sortBy === "popular" ? "2px solid var(--red-soft)" : "1px solid var(--border)",
              background: sortBy === "popular" ? "var(--surface-2)" : "transparent",
              color: sortBy === "popular" ? "var(--red-soft)" : "var(--text)",
              cursor: "pointer",
              fontWeight: sortBy === "popular" ? "600" : "400",
            }}
          >
            인기순
          </button>
        </div>

        <input
          type="text"
          placeholder="제목으로 검색"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "8px",
            border: "1px solid var(--border)",
            background: "var(--surface)",
            color: "var(--text)",
            fontSize: "1rem",
          }}
        />
      </div>

      <PostList items={filtered} />
    </div>
  );
}
```

- [ ] **Step 4: 테스트 통과 확인**

```bash
npm test -- tests/components/PostExplorer.test.tsx
```

Expected: 통과

- [ ] **Step 5: 커밋**

```bash
git add src/components/community/PostExplorer.tsx tests/components/PostExplorer.test.tsx
git commit -m "feat: add PostExplorer with tabs, sorting, and search"
```

---

### Task 5: /community 페이지 (글 목록)

**Files:**
- Create: `src/app/community/page.tsx`
- Create: `src/app/community/page.module.css`

- [ ] **Step 1: page.module.css 작성**

`src/app/community/page.module.css`:

```css
.section {
  padding: 24px 0;
}
.eyebrow {
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--red-soft);
  margin-bottom: 12px;
}
.heading {
  font-family: var(--font-display);
  font-size: clamp(2rem, 5vw, 3.2rem);
  font-weight: 400;
  letter-spacing: 0.02em;
  line-height: 1.1;
  margin-bottom: 32px;
}
.notice {
  background: rgba(255, 77, 141, 0.05);
  border: 1px solid rgba(255, 77, 141, 0.2);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 32px;
  font-size: 0.9rem;
  color: var(--muted);
}
.error {
  text-align: center;
  padding: 48px 0;
  color: var(--muted);
}
```

- [ ] **Step 2: page.tsx 작성**

`src/app/community/page.tsx`:

```tsx
import type { Metadata } from "next";
import PostExplorer from "@/components/community/PostExplorer";
import { getPostsByCategory } from "@/lib/posts";
import { safe } from "@/lib/safe";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "커뮤니티",
  description:
    "LG 트윈스 팬들이 모여 경험을 나누는 커뮤니티. 공지사항, 자유 토론, 팬 창작물을 한곳에서 만나보세요.",
};

export default async function CommunityPage() {
  const notice = await safe(() => getPostsByCategory("notice"));
  const free = await safe(() => getPostsByCategory("free"));
  const fanart = await safe(() => getPostsByCategory("fanart"));

  const allPosts =
    notice && free && fanart ? [...notice, ...free, ...fanart] : null;

  return (
    <section
      className={`container ${styles.section}`}
      aria-labelledby="community-title"
    >
      <p className={styles.eyebrow}>Community</p>
      <h1 id="community-title" className={styles.heading}>
        커뮤니티
      </h1>
      <div className={styles.notice}>
        이 페이지의 모든 글과 작성자 정보는 화면 구성을 위한 가상의 샘플
        데이터예요.
      </div>
      {allPosts ? (
        <PostExplorer posts={allPosts} />
      ) : (
        <p className={styles.error}>게시글을 불러오지 못했어요.</p>
      )}
    </section>
  );
}
```

- [ ] **Step 3: 빌드 확인**

```bash
npm run build
```

Expected: 성공

- [ ] **Step 4: 커밋**

```bash
git add src/app/community tests/components/PostExplorer.test.tsx
git commit -m "feat: add /community page with post explorer"
```

---

### Task 6: /community/[id] 페이지 (글 상세)

**Files:**
- Create: `src/components/community/PostContent.tsx`
- Create: `src/app/community/[id]/page.tsx`
- Create: `src/app/community/[id]/page.module.css`

- [ ] **Step 1: PostContent 컴포넌트**

`src/components/community/PostContent.tsx`:

```tsx
import Link from "next/link";
import type { Post } from "@/lib/types";
import styles from "./community.module.css";

export default function PostContent({
  post,
  categoryLabel,
}: {
  post: Post;
  categoryLabel: string;
}) {
  return (
    <article>
      <div
        style={{
          marginBottom: "24px",
          paddingBottom: "24px",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div style={{ marginBottom: "16px" }}>
          <span className={styles.badge + " " + styles[post.category]}>
            {categoryLabel}
          </span>
        </div>
        <h1 style={{ fontSize: "2rem", fontWeight: "600", marginBottom: "16px" }}>
          {post.title}
        </h1>
        <div className={styles.meta}>
          <span className={styles.metaItem}>{post.author}</span>
          <span className={styles.metaItem}>{post.date}</span>
          <span className={styles.metaItem}>조회 {post.views}</span>
          <span className={styles.metaItem}>좋아요 {post.likes}</span>
        </div>
      </div>

      <div
        style={{
          lineHeight: "1.8",
          marginBottom: "32px",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}
      >
        {post.content}
      </div>

      <div style={{ textAlign: "center", marginTop: "48px" }}>
        <Link
          href="/community"
          style={{
            display: "inline-block",
            padding: "12px 24px",
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "999px",
            color: "var(--text)",
            textDecoration: "none",
            fontWeight: "500",
            transition: "color 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--red-soft)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text)")}
        >
          목록으로
        </Link>
      </div>
    </article>
  );
}
```

- [ ] **Step 2: [id]/page.module.css**

`src/app/community/[id]/page.module.css`:

```css
.section {
  padding: 24px 0;
}
.eyebrow {
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--red-soft);
  margin-bottom: 12px;
}
.heading {
  font-family: var(--font-display);
  font-size: 1.2rem;
  font-weight: 400;
  margin-bottom: 32px;
}
.error {
  text-align: center;
  padding: 48px 0;
  color: var(--muted);
}
```

- [ ] **Step 3: [id]/page.tsx**

`src/app/community/[id]/page.tsx`:

```tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PostContent from "@/components/community/PostContent";
import { getPost } from "@/lib/posts";
import { safe } from "@/lib/safe";
import styles from "./page.module.css";

const CATEGORY_LABELS = {
  notice: "공지사항",
  free: "자유 게시판",
  fanart: "팬 창작물",
} as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const post = await safe(() => getPost(id));

  if (!post) {
    return { title: "글을 찾을 수 없습니다" };
  }

  return {
    title: post.title,
    description: post.excerpt,
  };
}

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await safe(() => getPost(id));

  if (!post) {
    notFound();
  }

  const categoryLabel =
    CATEGORY_LABELS[post.category as keyof typeof CATEGORY_LABELS];

  return (
    <section
      className={`container ${styles.section}`}
      aria-labelledby="post-title"
    >
      <p className={styles.eyebrow}>게시글</p>
      <h1 id="post-title" className={styles.heading}>
        {post.title}
      </h1>
      <PostContent post={post} categoryLabel={categoryLabel} />
    </section>
  );
}
```

- [ ] **Step 4: 빌드 확인**

```bash
npm run build
```

Expected: 성공

- [ ] **Step 5: 커밋**

```bash
git add src/components/community/PostContent.tsx src/app/community/[id]
git commit -m "feat: add community post detail page"
```

---

### Task 7: 전체 검증 및 브라우저 테스트

**Files:** 없음 (검증만)

- [ ] **Step 1: 전체 테스트 실행**

```bash
npm test
```

Expected: 모든 테스트 통과

- [ ] **Step 2: 린트/타입/빌드**

```bash
npm run lint
npx tsc --noEmit
npm run build
```

Expected: 모두 통과

- [ ] **Step 3: dev 서버 시작**

```bash
npm run dev
```

예상되는 동작 (http://localhost:3000 접속):
- 모든 내비게이션 항목이 활성화 (6개 모두)
- `/community` 접속 시 글 목록 표시
- 탭 전환 (공지/자유/팬창작물)
- 정렬 토글 (최신순/인기순)
- 제목 검색 입력 및 즉시 필터링
- 글 클릭 시 `/community/[id]`로 상세 페이지 이동
- 상세 페이지 "목록으로" 버튼으로 돌아가기

- [ ] **Step 4: Lighthouse 검증**

다른 터미널에서:

```bash
npx lighthouse http://localhost:3000/community --only-categories=performance,accessibility --chrome-flags="--headless" --view
```

Expected: 성능/접근성 모두 90 이상

- [ ] **Step 5: 최종 커밋**

```bash
git status
git add -A
git commit -m "chore: verify community stage" --allow-empty
```

---

## 완료 체크리스트

- [ ] 모든 테스트 통과 (라이브러리 + 컴포넌트)
- [ ] 빌드 성공
- [ ] 린트 통과
- [ ] 타입 에러 없음
- [ ] 브라우저에서 모든 기능 동작 확인
- [ ] Lighthouse 성능/접근성 90 이상
- [ ] 모든 커밋 완료
