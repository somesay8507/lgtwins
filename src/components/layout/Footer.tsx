import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className="container">
        <p className={styles.brand}>LG TWINS FAN</p>
        <p className={styles.notice}>
          이 사이트는 팬이 만든 비공식 팬사이트이며 LG 트윈스 및 KBO와 관련이
          없습니다. 구단 공식 로고와 선수 사진은 사용하지 않습니다.
        </p>
      </div>
    </footer>
  );
}
