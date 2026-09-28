import styles from "./CheerTools.module.css";

const TOOLS = [
  {
    name: "막대풍선",
    description: "두 손에 하나씩 들고 부딪치며 소리를 내는 대표적인 응원 도구예요.",
  },
  {
    name: "대형 응원 카드",
    description: "관중석 전체가 함께 들어 올려 그림이나 문구를 만드는 카드 응원이에요.",
  },
  {
    name: "유니폼",
    description: "선수 이름과 번호가 새겨진 유니폼을 입고 응원하는 팬들을 쉽게 볼 수 있어요.",
  },
  {
    name: "응원봉",
    description: "LED 응원봉을 흔들며 응원가에 맞춰 리듬을 타는 팬들도 많아요.",
  },
];

export default function CheerTools() {
  return (
    <ul className={styles.grid}>
      {TOOLS.map((tool) => (
        <li key={tool.name} className={styles.card}>
          <p className={styles.name}>{tool.name}</p>
          <p className={styles.desc}>{tool.description}</p>
        </li>
      ))}
    </ul>
  );
}
