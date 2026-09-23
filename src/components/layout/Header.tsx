"use client";

import Link from "next/link";
import { useState } from "react";
import { NAV_ITEMS } from "@/lib/nav";
import styles from "./Header.module.css";

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/" className={styles.logo}>
          LG TWINS
        </Link>
        <button
          type="button"
          className={styles.toggle}
          aria-expanded={open}
          aria-controls="site-nav"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "닫기" : "메뉴"}
        </button>
        <nav
          id="site-nav"
          aria-label="주 메뉴"
          className={`${styles.nav} ${open ? styles.open : ""}`}
        >
          <ul>
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                {item.ready ? (
                  <Link href={item.href} onClick={() => setOpen(false)}>
                    {item.label}
                  </Link>
                ) : (
                  <span aria-disabled="true" className={styles.soon}>
                    {item.label}
                    <small>준비 중</small>
                  </span>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
