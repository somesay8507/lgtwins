"use client";

import { useEffect, useState } from "react";
import { getCountdown } from "@/lib/countdown";
import styles from "./NextGame.module.css";

const pad = (n: number) => String(n).padStart(2, "0");

export default function Countdown({ startsAt }: { startsAt: string }) {
  // 서버/클라이언트 첫 렌더를 맞추기 위해 마운트 후에 시간을 채운다.
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- 마운트 시점 시간으로 최초 1회만 동기화
    setNow(new Date());
    const id = setInterval(() => {
      const next = new Date();
      setNow(next);
      if (getCountdown(new Date(startsAt), next).status !== "upcoming") {
        clearInterval(id);
      }
    }, 1000);
    return () => clearInterval(id);
  }, [startsAt]);

  if (!now) return <div className={styles.timer} aria-hidden="true" />;

  const c = getCountdown(new Date(startsAt), now);

  if (c.status === "live") return <p className={styles.notice}>경기 진행 중</p>;
  if (c.status === "ended") return <p className={styles.notice}>경기 종료</p>;

  const units = [
    { value: pad(c.days), label: "일" },
    { value: pad(c.hours), label: "시간" },
    { value: pad(c.minutes), label: "분" },
    { value: pad(c.seconds), label: "초" },
  ];

  return (
    <div role="timer" aria-label="경기까지 남은 시간" className={styles.timer}>
      {units.map((u) => (
        <div key={u.label} className={styles.unit}>
          <span className={styles.value}>{u.value}</span>
          <span className={styles.label}>{u.label}</span>
        </div>
      ))}
    </div>
  );
}
