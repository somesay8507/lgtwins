"use client";

import { useRef } from "react";
import Button from "@/components/ui/Button";
import { useHeroReveal } from "@/lib/animations";
import styles from "./Hero.module.css";

export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  useHeroReveal(ref);

  return (
    <section ref={ref} className={styles.hero} aria-labelledby="hero-title">
      <div className={styles.orb} aria-hidden="true" />
      <div className={`container ${styles.content}`}>
        <h1 id="hero-title" className={styles.title}>
          <span className={styles.line}>
            <span data-reveal>WE ARE</span>
          </span>
          <span className={styles.line}>
            <span data-reveal className={styles.accent}>
              TWINS.
            </span>
          </span>
        </h1>
        <p className={styles.lead}>
          잠실의 밤을 붉게 물들이는 LG 트윈스, 팬이 만든 비공식 팬사이트.
        </p>
        <div className={styles.actions}>
          {/* 일정/선수단 페이지가 생기면 /schedule, /players 로 교체 */}
          <Button href="#next-game">일정 보기</Button>
          <Button href="#star-players" variant="ghost">
            선수단 보기
          </Button>
        </div>
      </div>
    </section>
  );
}
