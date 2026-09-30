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

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const post = await safe(() => getPost(id));
  if (!post) return { title: "글을 찾을 수 없습니다" };
  return { title: post.title, description: post.excerpt };
}

export default async function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await safe(() => getPost(id));
  if (!post) notFound();

  const categoryLabel = CATEGORY_LABELS[post.category as keyof typeof CATEGORY_LABELS];

  return (
    <section className={`container ${styles.section}`} aria-labelledby="post-title">
      <p className={styles.eyebrow}>게시글</p>
      <h1 id="post-title" className={styles.heading}>{post.title}</h1>
      <PostContent post={post} categoryLabel={categoryLabel} />
    </section>
  );
}
