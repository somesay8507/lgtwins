import styles from "./CheerManners.module.css";

const MANNERS = [
  "우리 팀 공격 이닝에 크게 응원하고, 수비 이닝에는 목소리를 낮춰요.",
  "파울볼이 날아올 땐 주변을 살피고 다치지 않게 조심해요.",
  "상대팀을 응원하는 팬도 같은 관중석의 손님이에요. 배려하는 말과 행동을 해요.",
  "통로나 계단에서는 이동하는 다른 관람객을 위해 길을 비켜줘요.",
];

export default function CheerManners() {
  return (
    <ol className={styles.list}>
      {MANNERS.map((manner) => (
        <li key={manner} className={styles.item}>
          {manner}
        </li>
      ))}
    </ol>
  );
}
