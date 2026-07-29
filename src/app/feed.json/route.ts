import { getAllPosts } from "@/lib/log";
import { site } from "@/lib/site";

/**
 * The three most recent posts as JSON, consumed by zfertig.com's "From the lab"
 * strip (hub plan Part 6). Static + daily revalidate — zfertig.com should fetch
 * this at build time, so a failed fetch there just hides the strip.
 */
export const dynamic = "force-static";
export const revalidate = 86400;
// getAllPosts reads the filesystem, so this handler needs the Node runtime.
export const runtime = "nodejs";

export function GET() {
  const posts = getAllPosts()
    .slice(0, 3)
    .map((post) => ({
      title: post.title,
      summary: post.summary,
      date: post.date,
      url: `${site.url}/log/${post.slug}`,
    }));

  // Permissive CORS in case zfertig.com ever fetches client-side. It shouldn't
  // — build-time fetch is better — but the header costs nothing.
  return Response.json(
    { posts },
    { headers: { "Access-Control-Allow-Origin": "*" } },
  );
}
