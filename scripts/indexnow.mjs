#!/usr/bin/env node
/**
 * IndexNow submitter for biscuitlab.net.
 *
 * Notifies IndexNow-participating engines (Bing, Yandex, and others that share the
 * protocol) that URLs have changed, so they recrawl sooner than a sitemap poll would
 * trigger. Ownership is proven by the key hosted at `/<key>.txt` (in `public/`), which
 * covers the whole host — so both the hub and the `/puzzles` zone can be submitted.
 *
 * Run after publishing or changing content (the key file must already be deployed):
 *   npm run indexnow                 # submit every URL in both sitemaps
 *   npm run indexnow -- <url> <url>  # submit only the URLs you name
 *
 * Docs: https://www.indexnow.org/documentation
 */

const KEY = "89ee603587624af89d27786fb22053ca";
const HOST = "biscuitlab.net";
const ORIGIN = `https://${HOST}`;
const KEY_LOCATION = `${ORIGIN}/${KEY}.txt`;
// Both zones live on this host, so one key covers both sitemaps.
const SITEMAPS = [`${ORIGIN}/sitemap.xml`, `${ORIGIN}/puzzles/sitemap.xml`];

async function urlsFromSitemap(sitemapUrl) {
  const res = await fetch(sitemapUrl);
  if (!res.ok) throw new Error(`sitemap ${sitemapUrl} -> HTTP ${res.status}`);
  const xml = await res.text();
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
}

async function main() {
  const args = process.argv.slice(2);
  const urlList = args.length
    ? args
    : [...new Set((await Promise.all(SITEMAPS.map(urlsFromSitemap))).flat())];

  if (urlList.length === 0) {
    console.error("No URLs to submit.");
    process.exit(1);
  }

  console.log(`Submitting ${urlList.length} URL(s) to IndexNow:`);
  urlList.forEach((u) => console.log(`  ${u}`));

  const res = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({ host: HOST, key: KEY, keyLocation: KEY_LOCATION, urlList }),
  });

  // 200/202 = accepted. 403 = key not found/invalid at keyLocation (is it deployed?).
  // 422 = a URL doesn't belong to this host, or key/host mismatch.
  console.log(`IndexNow responded: ${res.status} ${res.statusText}`);
  if (res.status !== 200 && res.status !== 202) {
    const body = await res.text().catch(() => "");
    if (body) console.error(body.slice(0, 400));
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
