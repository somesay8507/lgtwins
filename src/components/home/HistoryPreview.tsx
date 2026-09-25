"use client";

import Link from "next/link";
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
      <Link href="/history" className={styles.more}>
        전체 역사 보기
      </Link>
    </section>
  );
}
