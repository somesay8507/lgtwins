"use client";

import { useRef } from "react";
import Card from "@/components/ui/Card";
import SectionTitle from "@/components/ui/SectionTitle";
import { useScrollReveal } from "@/lib/animations";
import type { Player } from "@/lib/types";
import styles from "./StarPlayers.module.css";

export default function StarPlayers({ players }: { players: Player[] }) {
  const ref = useRef<HTMLElement>(null);
  useScrollReveal(ref);

  return (
    <section
      id="star-players"
      ref={ref}
      className={`container ${styles.section}`}
      aria-labelledby="players-title"
    >
      <SectionTitle id="players-title" eyebrow="Players" title="스타 플레이어" />
      <ul className={styles.list}>
        {players.map((p) => (
          <li key={p.id} data-scroll-item>
            <Card className={styles.card}>
              {/* 선수 사진은 쓰지 않는다. 이니셜 아바타로 대체 */}
              <span className={styles.avatar} aria-hidden="true">
                {p.name.charAt(0)}
              </span>
              <div>
                <p className={styles.name}>{p.name}</p>
                <p className={styles.position}>{p.position}</p>
              </div>
            </Card>
          </li>
        ))}
      </ul>
    </section>
  );
}
