import Link from "next/link";
import { site } from "@/lib/site";
import styles from "./SiteHeader.module.css";

/**
 * Wordmark plus the single handwritten aside — the one permitted personality
 * touch on the lab bench (hub plan Part 5 / design system §5).
 */
export function SiteHeader() {
  return (
    <header className={styles.header}>
      <Link href="/" className={styles.wordmark}>
        {site.name}
      </Link>
      <span className={styles.aside} aria-hidden="true">
        est. today, mostly stable
      </span>
    </header>
  );
}
