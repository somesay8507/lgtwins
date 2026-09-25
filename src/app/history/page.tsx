import type { Metadata } from "next";
import HistoryExplorer from "@/components/history/HistoryExplorer";
import { getHistoryEvents } from "@/lib/history";
import { safe } from "@/lib/safe";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "역사",
  description: "LG 트윈스의 창단부터 지금까지, 주요 순간들을 한눈에.",
};

export default async function HistoryPage() {
  const events = await safe(getHistoryEvents);

  return (
    <section
      className={`container ${styles.section}`}
      aria-labelledby="history-page-title"
    >
      <p className={styles.eyebrow}>History</p>
      <h1 id="history-page-title" className={styles.heading}>
        LG 트윈스의 역사
      </h1>
      {events && events.length > 0 ? (
        <HistoryExplorer events={events} />
      ) : (
        <p className={styles.error}>기록을 불러오지 못했어요.</p>
      )}
    </section>
  );
}
