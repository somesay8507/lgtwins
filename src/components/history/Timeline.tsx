"use client";

import { useRef } from "react";
import { useScrollReveal } from "@/lib/animations";
import type { HistoryEvent } from "@/lib/types";
import EventBadge from "./EventBadge";
import styles from "./Timeline.module.css";

export default function Timeline({ events }: { events: HistoryEvent[] }) {
  const ref = useRef<HTMLOListElement>(null);
  useScrollReveal(ref);

  if (events.length === 0) {
    return <p className={styles.empty}>해당 카테고리 기록이 없어요.</p>;
  }

  return (
    <ol ref={ref} className={styles.timeline}>
      {events.map((event, index) => (
        <li
          key={`${event.year}-${event.category}-${index}`}
          className={`${styles.item} ${
            event.category === "우승" ? styles.highlight : ""
          }`}
          data-scroll-item
        >
          <p className={styles.year}>{event.year}</p>
          <div className={styles.meta}>
            <EventBadge category={event.category} />
            <p className={styles.title}>{event.title}</p>
          </div>
          {event.description && <p className={styles.desc}>{event.description}</p>}
        </li>
      ))}
    </ol>
  );
}
