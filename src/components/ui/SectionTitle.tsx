import styles from "./ui.module.css";

type Props = { id: string; eyebrow: string; title: string };

export default function SectionTitle({ id, eyebrow, title }: Props) {
  return (
    <div className={styles.title}>
      <p className={styles.eyebrow}>{eyebrow}</p>
      <h2 id={id} className={styles.heading}>
        {title}
      </h2>
    </div>
  );
}
