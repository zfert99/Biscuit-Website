import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

/**
 * Build-log data access. Posts are `.mdx` files in `src/content/log`; frontmatter
 * is read with gray-matter for indexes and metadata, while the post body is
 * rendered by dynamically importing the compiled MDX in the route. See
 * Docs/BiscuitLab_Hub_Plan.md Part 4.
 */
const LOG_DIR = path.join(process.cwd(), "src", "content", "log");

/** Deliberately thin — no tags, no author, no draft (delete the file instead). */
export type LogFrontmatter = {
  title: string;
  /** ISO date, `yyyy-mm-dd`. */
  date: string;
  /** One sentence — used on the index, in feed.json, and as the meta description. */
  summary: string;
  /** Optional project slug, for cross-linking. */
  project?: string;
};

export type LogPost = LogFrontmatter & { slug: string };

function slugsFromDisk(): string[] {
  if (!fs.existsSync(LOG_DIR)) return [];
  return fs
    .readdirSync(LOG_DIR)
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => file.replace(/\.mdx$/, ""));
}

function readFrontmatter(slug: string): LogPost | null {
  const file = path.join(LOG_DIR, `${slug}.mdx`);
  if (!fs.existsSync(file)) return null;
  const { data } = matter(fs.readFileSync(file, "utf8"));
  return { slug, ...(data as LogFrontmatter) };
}

/** Newest first. */
export function getAllPosts(): LogPost[] {
  return slugsFromDisk()
    .map(readFrontmatter)
    .filter((post): post is LogPost => post !== null)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPost(slug: string): LogPost | null {
  return readFrontmatter(slug);
}

/** Stable, locale-fixed date formatting (UTC) so server output is deterministic. */
export function formatPostDate(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(iso));
}
