import type { Metadata } from "next";
import PostExplorer from "@/components/community/PostExplorer";
import { getPostsByCategory } from "@/lib/posts";
import { safe } from "@/lib/safe";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "커뮤니티",
  description: "LG 트윈스 팬들이 모여 경험을 나누는 커뮤니티. 공지사항, 자유 토론, 팬 창작물을 한곳에서 만나보세요.",
};

export default async function CommunityPage() {
  const notice = await safe(() => getPostsByCategory("notice"));
  const free = await safe(() => getPostsByCategory("free"));
  const fanart = await safe(() => getPostsByCategory("fanart"));

  const allPosts = notice && free && fanart ? [...notice, ...free, ...fanart] : null;

  return (
    <section className={`container ${styles.section}`} aria-labelledby="community-title">
      <p className={styles.eyebrow}>Community</p>
      <h1 id="community-title" className={styles.heading}>커뮤니티</h1>
      <div className={styles.notice}>
        이 페이지의 모든 글과 작성자 정보는 화면 구성을 위한 가상의 샘플 데이터예요.
      </div>
      {allPosts ? (
        <PostExplorer posts={allPosts} />
      ) : (
        <p className={styles.error}>게시글을 불러오지 못했어요.</p>
      )}
    </section>
  );
}
