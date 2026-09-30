import type { LeaderCategory } from "@/lib/types";
import styles from "./LeaderBoards.module.css";

export default function LeaderBoards({ categories }: { categories: LeaderCategory[] }) {
  return (
    <div>
      <p className={styles.notice}>
        선수 이름과 기록은 모두 가상의 샘플 데이터이며 실제 선수와 무관해요.
      </p>
      <div className={styles.grid}>
        {categories.map((category) => (
          <section key={category.title} className={styles.card}>
            <h3 className={styles.title}>{category.title}</h3>
            <ol className={styles.list}>
              {category.leaders.map((leader) => (
                <li key={leader.name} className={styles.row}>
                  <span>{leader.name}</span>
                  <span className={styles.value}>{leader.value}</span>
                </li>
              ))}
            </ol>
          </section>
        ))}
      </div>
    </div>
  );
}
