import type { ProjectStatus } from "@/content/projects";
import styles from "./StatusStamp.module.css";

/**
 * The hub signature: a chunky label-maker tag on a project card, and the single
 * element on the page allowed to sit off-square.
 *
 * Accessibility is load-bearing (audit C3 / hub plan Part 5): the WORD carries
 * the status (SC 1.4.1 Use of Color), colour only reinforces it — never drop the
 * text and keep the colour. Border/fill hold 3:1 non-text contrast against the
 * card in both themes (SC 1.4.11) via the themed --ink border.
 */
const LABELS: Record<ProjectStatus, string> = {
  live: "LIVE",
  "in-the-lab": "IN THE LAB",
  shelved: "SHELVED",
};

const VARIANTS: Record<ProjectStatus, string> = {
  live: styles.live,
  "in-the-lab": styles.inTheLab,
  shelved: styles.shelved,
};

export function StatusStamp({ status }: { status: ProjectStatus }) {
  return (
    <span className={`${styles.stamp} ${VARIANTS[status]}`}>
      {LABELS[status]}
    </span>
  );
}
