import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPlayers } from "@/lib/players";
import { safe } from "@/lib/safe";
import styles from "./page.module.css";

type Props = { params: Promise<{ name: string }> };

/**
 * Next.js does not auto-decode dynamic route segments in this version — the
 * raw `params.name` arrives still percent-encoded (e.g. "%EA%B3%A0..."), so
 * it must be decoded before comparing against player names. A malformed
 * (non-browser) request could contain an invalid escape sequence that makes
 * decodeURIComponent throw; treat that as "no such player" rather than a 500.
 */
function decodeName(name: string): string | null {
  try {
    return decodeURIComponent(name);
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { name } = await params;
  const decodedName = decodeName(name);
  const players = decodedName ? await safe(getPlayers) : null;
  const player = players?.find((p) => p.name === decodedName);
  return { title: player ? `${decodedName} | 선수단` : "선수단" };
}

export default async function PlayerDetailPage({ params }: Props) {
  const { name } = await params;
  const decodedName = decodeName(name);
  const players = decodedName ? await safe(getPlayers) : null;
  const player = players?.find((p) => p.name === decodedName);

  if (!player) {
    notFound();
  }

  return (
    <section
      className={`container ${styles.section}`}
      aria-labelledby="player-name"
    >
      <Link href="/players" className={styles.back}>
        ← 선수단으로
      </Link>
      <p className={styles.number}>{player.number ?? "미정"}</p>
      <h1 id="player-name" className={styles.name}>
        {player.name}
      </h1>
      <p className={styles.position}>{player.position}</p>
    </section>
  );
}
