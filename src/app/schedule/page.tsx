import type { Metadata } from "next";
import ScheduleList from "@/components/schedule/ScheduleList";
import { getSchedule } from "@/lib/games";
import { safe } from "@/lib/safe";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "경기 일정",
  description: "LG 트윈스의 다가오는 경기와 최근 결과를 한눈에 확인하세요.",
};

// 더미 경기 일정은 날짜 단위로만 바뀌므로(다가오는 경기는 offsetDays 기준,
// 지난 경기는 고정 날짜), 1시간마다 재생성하는 것으로 충분하다.
export const revalidate = 3600;

export default async function SchedulePage() {
  const entries = await safe(getSchedule);

  return (
    <section
      className={`container ${styles.section}`}
      aria-labelledby="schedule-page-title"
    >
      <p className={styles.eyebrow}>Schedule</p>
      <h1 id="schedule-page-title" className={styles.heading}>
        경기 일정
      </h1>
      {entries ? (
        <ScheduleList entries={entries} />
      ) : (
        <p className={styles.error}>일정 정보를 불러오지 못했어요.</p>
      )}
    </section>
  );
}
