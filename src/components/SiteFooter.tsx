import { site } from "@/lib/site";
import styles from "./SiteFooter.module.css";

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <p>
        built by{" "}
        <a href={site.author.url} className={styles.link}>
          {site.author.name}
        </a>
      </p>
    </footer>
  );
}
