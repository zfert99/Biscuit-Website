import Link from "next/link";
import { ProjectCard } from "@/components/ProjectCard";
import { LogCard } from "@/components/LogCard";
import { projects } from "@/content/projects";
import { getAllPosts } from "@/lib/log";
import styles from "./page.module.css";

export default function HomePage() {
  const recentPosts = getAllPosts().slice(0, 3);

  return (
    <main id="main" className={styles.hub}>
      <section className={styles.intro}>
        <h1 className={styles.title}>A lab for small, finished things.</h1>
        <p className={styles.lede}>
          Each project gets built, shipped, and written up. Here&rsquo;s
          what&rsquo;s on the bench — and the log of how it got made.
        </p>
      </section>

      <section aria-label="Projects">
        <ul className={styles.grid}>
          {projects.map((project) => (
            <li key={project.slug}>
              <ProjectCard project={project} />
            </li>
          ))}
        </ul>
      </section>

      {recentPosts.length > 0 && (
        <section aria-labelledby="from-the-lab" className={styles.log}>
          <div className={styles.logHead}>
            <h2 id="from-the-lab" className={styles.sectionTitle}>
              From the lab
            </h2>
            <Link href="/log" className={styles.more}>
              Read the build log →
            </Link>
          </div>
          <ul className={styles.logList}>
            {recentPosts.map((post) => (
              <li key={post.slug}>
                <LogCard post={post} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
