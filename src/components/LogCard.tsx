import Link from "next/link";
import { formatPostDate, type LogPost } from "@/lib/log";
import styles from "./LogCard.module.css";

/** A build-log entry. Lighter than a ProjectCard — the chunky shadow is
 *  reserved for the project grid, so the log reads as a calmer list. */
export function LogCard({ post }: { post: LogPost }) {
  return (
    <Link href={`/log/${post.slug}`} className={styles.card}>
      <time dateTime={post.date} className={styles.date}>
        {formatPostDate(post.date)}
      </time>
      <h3 className={styles.title}>{post.title}</h3>
      <p className={styles.summary}>{post.summary}</p>
    </Link>
  );
}
