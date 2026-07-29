import { ProjectCard } from "@/components/ProjectCard";
import { projects } from "@/content/projects";
import styles from "./page.module.css";

export default function HomePage() {
  return (
    <main id="main" className={styles.hub}>
      <section className={styles.intro}>
        <h1 className={styles.title}>A lab for small, finished things.</h1>
        <p className={styles.lede}>
          Each project gets built, shipped, and written up. Here&rsquo;s
          what&rsquo;s on the bench — and, soon, the log of how it got made.
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
    </main>
  );
}
