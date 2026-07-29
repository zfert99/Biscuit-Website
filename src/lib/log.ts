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

/**
 * Normalize a frontmatter date to `yyyy-mm-dd`. YAML auto-parses an unquoted
 * `date: 2026-08-04` into a Date object, so coerce it back to a plain string —
 * otherwise it leaks as a full ISO datetime into JSON and `<time dateTime>`.
 */
function normalizeDate(value: unknown): string {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value);
}

function readFrontmatter(slug: string): LogPost | null {
  const file = path.join(LOG_DIR, `${slug}.mdx`);
  if (!fs.existsSync(file)) return null;
  const { data } = matter(fs.readFileSync(file, "utf8"));
  return {
    slug,
    title: String(data.title),
    date: normalizeDate(data.date),
    summary: String(data.summary),
    project: data.project ? String(data.project) : undefined,
  };
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
