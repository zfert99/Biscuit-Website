/**
 * The project index. A typed array, not MDX — projects are a handful of fields
 * and there are one or two of them. See Docs/BiscuitLab_Hub_Plan.md Part 4.
 */
export type ProjectStatus = "live" | "in-the-lab" | "shelved";

export type Project = {
  slug: string;
  name: string;
  /** One sentence, no marketing voice. */
  blurb: string;
  /** Sub-things worth naming on the card — what makes one card carry weight. */
  contains?: string[];
  /** Internal path, or an external URL for off-hub projects. */
  href: string;
  /**
   * Set when `href` targets a different Next zone (e.g. the `/puzzles` multi-zone
   * rewrite). Cross-zone links must be a hard-nav `<a>`, not `next/link` — soft
   * navigation/prefetch breaks across zones (validation doc §2c).
   */
  crossZone?: boolean;
  status: ProjectStatus;
  /** Path under /public. */
  screenshot: string;
};

export const projects: Project[] = [
  {
    slug: "puzzles",
    name: "Puzzle Lab",
    blurb:
      "A logic-puzzle workshop built on a from-scratch solver that reasons the way a person does — so every generated puzzle is solvable without guessing.",
    contains: ["Sudoku", "Killer", "Calc"],
    // Served under the hub via the multi-zone rewrite (hub plan Part 7 / roadmap
    // Phase 3). crossZone → hard-nav <a>, same tab: it's a different Next zone but
    // still our site. The old puzzles.biscuitlab.net subdomain 301s here.
    href: "/puzzles",
    crossZone: true,
    status: "live",
    screenshot: "/projects/puzzle-lab.svg",
  },
];
