import type { Metadata } from "next";
import { getAllPosts } from "@/lib/log";
import { LogCard } from "@/components/LogCard";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbJsonLd } from "@/lib/site";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Build log",
  description: "Process notes from the lab bench — what broke, what changed, and why.",
  alternates: { canonical: "/log" },
};

export default function LogIndexPage() {
  const posts = getAllPosts();

  return (
    <main id="main" className={styles.wrap}>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Biscuit Lab", path: "/" },
          { name: "Build log", path: "/log" },
        ])}
      />
      <header className={styles.header}>
        <h1 className={styles.title}>Build log</h1>
        <p className={styles.lede}>
          Notes from the bench — what broke, what I changed, and why.
        </p>
      </header>

      {posts.length === 0 ? (
        <p className={styles.empty}>Nothing here yet.</p>
      ) : (
        <ul className={styles.list}>
          {posts.map((post) => (
            <li key={post.slug}>
              <LogCard post={post} />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
