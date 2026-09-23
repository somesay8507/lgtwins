import styles from "./ui.module.css";

type Props = { className?: string; children: React.ReactNode };

export default function Card({ className = "", children }: Props) {
  return <div className={`${styles.card} ${className}`}>{children}</div>;
}
