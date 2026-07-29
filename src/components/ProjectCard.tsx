import Link from "next/link";
import type { Project } from "@/content/projects";
import { StatusStamp } from "./StatusStamp";
import styles from "./ProjectCard.module.css";

/**
 * A chunky, pressable project card. The whole card is the link. The status stamp
 * sits on the corner as the single off-square element (see StatusStamp).
 */
export function ProjectCard({ project }: { project: Project }) {
  const isExternal = project.href.startsWith("http");

  const inner = (
    <>
      <div className={styles.thumb}>
        {/* Plain <img> for the on-brand placeholder SVG (a trusted local asset);
            switch to next/image when real raster screenshots land. */}
        {/* eslint-disable-next-line @next/next/no-img-element -- placeholder SVG, not a raster asset to optimize */}
        <img
          src={project.screenshot}
          alt={`${project.name} screenshot`}
          width={640}
          height={400}
          loading="lazy"
        />
        <span className={styles.stampSlot}>
          <StatusStamp status={project.status} />
        </span>
      </div>

      <div className={styles.body}>
        <h3 className={styles.title}>{project.name}</h3>
        <p className={styles.blurb}>{project.blurb}</p>
        {project.contains && project.contains.length > 0 && (
          <ul className={styles.contains} aria-label="Includes">
            {project.contains.map((item) => (
              <li key={item} className={styles.chip}>
                {item}
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );

  return isExternal ? (
    <a
      className={styles.card}
      href={project.href}
      target="_blank"
      rel="noreferrer"
    >
      {inner}
    </a>
  ) : (
    <Link className={styles.card} href={project.href}>
      {inner}
    </Link>
  );
}
