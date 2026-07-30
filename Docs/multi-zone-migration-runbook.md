# Multi-Zone Migration Runbook (Phase 3)

The cross-repo runbook for serving Puzzle Lab under **`biscuitlab.net/puzzles`**
instead of the `puzzles.biscuitlab.net` subdomain. This is the operational
sequence; the *rationale* is in `Docs/BiscuitLab_Hub_Plan.md` Part 7, and the
Puzzle-Generator-side code changes are in that repo's
`Docs/multi-zone-migration-plan.md`.

> **Validated & corrected** against
> `Docs/research/multi-zone-migration-validation.md` (2026-07). Three items from
> the first draft were wrong and are fixed below: the Host-based origin `noindex`
> (self-defeating — it fires on the proxied response too), the `.biscuitlab.net`
> cookie (unnecessary/risky — same apex host after cutover), and the project-card
> link (cross-zone links must be `<a>`, not `<Link>`).

Two repos are involved:

- **`Biscuit-Website`** (this hub) — adds the rewrite + the project-card link + the
  sitemap index.
- **`Puzzle-Generator`** (Puzzle Lab) — the rpID move, `basePath`, and public
  metadata.

> **Status (2026-07-29): prerequisites done, cutover pre-staged.** A (rpID move)
> ✅ and B (DNS / apex serving the hub) ✅ are complete; the dormant hub rewrite +
> cross-zone card support are merged (step 4); the PG cutover PR is drafted (step
> 5). What remains is the coordinated flip (set env vars → merge PG cutover →
> 301) plus track C (Search Console / Bing), which is independent.

---

## Architecture

```
Browser → biscuitlab.net/puzzles/*  ──rewrite──▶  <PUZZLES_ORIGIN>/puzzles/*   (Puzzle Lab)
Browser → puzzles.biscuitlab.net/*  ──301────────▶  biscuitlab.net/puzzles/*
```

Two rules that keep it from breaking:

- **The rewrite target must be a host *distinct* from `puzzles.biscuitlab.net`**
  — otherwise the 301 source and the rewrite target are the same host and you get
  an infinite redirect loop. **CORRECTED (safety review §1): use a dedicated custom
  host `origin-puzzles.biscuitlab.net` on the Puzzle Lab project, with Deployment
  Protection left ON.** The generated `*.vercel.app` alias does NOT suffice — it's
  covered by Standard Protection, so the proxy can't reach it (that's what forced
  turning protection off, which was the wrong fix). Custom production domains are
  exempt from Standard Protection, so the proxy reaches the origin host while the
  generated URL + previews stay locked. See `multi-zone-cutover-log.md` issue #3.
- **The rpID must already be `biscuitlab.net` before cutover** (see below), or
  passkeys break at the move.

## The rpID prerequisite (why this is fiddly)

Puzzle Lab derives its passkey rpID from `BETTER_AUTH_URL`, so it's
`puzzles.biscuitlab.net` today. A passkey is bound to its rpID, and WebAuthn
requires the rpID to be a suffix of the serving origin. After cutover the origin
is `biscuitlab.net`, where `puzzles.biscuitlab.net` is **not** a valid rpID — auth
would break entirely. Moving the rpID to the apex first (while still on the
subdomain, which allows it) lets re-registered passkeys survive the move.

Full explanation + the exact code diff:
`Puzzle-Generator/Docs/multi-zone-migration-plan.md` §1–2.

---

## Hub-side changes

### 1. The rewrite (`next.config.ts`)

Point `/puzzles` at the Puzzle Lab origin. Add alongside the existing
`headers()`/MDX config:

```ts
const PUZZLES_ORIGIN = process.env.PUZZLES_ORIGIN; // no trailing slash

const nextConfig: NextConfig = {
  // ...existing pageExtensions, turbopack, headers()
  async rewrites() {
    if (!PUZZLES_ORIGIN) return [];
    return [
      { source: "/puzzles", destination: `${PUZZLES_ORIGIN}/puzzles` },
      { source: "/puzzles/:path*", destination: `${PUZZLES_ORIGIN}/puzzles/:path*` },
    ];
  },
};
```

Both entries are needed — the bare `/puzzles` path doesn't always match
`:path*`. Set `PUZZLES_ORIGIN` in the hub's Vercel env to the distinct origin
hostname. Verify `/puzzles/_next/*` assets resolve.

### 2. Point the project-card link at `/puzzles` — as a cross-zone `<a>`

The Puzzle Lab entry's `href` becomes `/puzzles`, but **it must render as a plain
`<a>`, not `next/link`**: `/puzzles` lives in a different zone, and Next's soft
navigation / prefetch breaks across zone boundaries (validation doc §2c). Today
`ProjectCard` picks `<a>` only for `http(s)` hrefs, so it would wrongly use
`<Link>` for `/puzzles`. Fix it with an explicit cross-zone flag rather than a
URL-shape heuristic:

```diff
 // src/content/projects.ts
-    href: "https://puzzles.biscuitlab.net",
+    href: "/puzzles",
+    crossZone: true,   // rendered as <a> (hard nav) — different Next zone
```

```diff
 // src/components/ProjectCard.tsx
-  const isExternal = project.href.startsWith("http");
+  const isExternal = project.href.startsWith("http") || project.crossZone;
```

(Same applies to any hub↔puzzles links added later, e.g. in `SiteHeader`.)

### 3. Hand-rolled sitemap index (`app/sitemap.xml/route.ts`)

Deferred from Phase 4 to here because it references the puzzle zone. Next.js
won't generate a top-level index for you (audit C4). Once `/puzzles/sitemap.xml`
exists (Puzzle Lab ships one), replace the hub's auto `sitemap.ts` with a
`route.ts` that returns a `<sitemapindex>` listing the hub's own sitemap and
`https://biscuitlab.net/puzzles/sitemap.xml`. Only `<lastmod>` carries weight.

---

## Master sequence (both repos, in order)

Prereq: **merge Puzzle Lab PR #25** — ✅ done (scopes `trustedOrigins`).

1. **[PG code]** Decouple rpID/origin via `PASSKEY_RP_ID`. ✅ done (#27).
2. **[you · Vercel]** `PASSKEY_RP_ID=biscuitlab.net` on Puzzle Lab prod; verify a
   fresh passkey round-trips. ✅ done. *(Registering one needed the new `/account`
   page, #28 — the app previously had no passkey-registration UI at all.)*
3. **[you · DNS]** `biscuitlab.net` serving the hub. ✅ done — the domain is at
   Cloudflare with **grey-cloud (DNS-only)** records → Vercel, the apex is the
   hub's primary domain, and `www` → apex. No registrar transfer needed (see §B).
4. **[hub code]** Dormant `/puzzles` rewrite behind `PUZZLES_ORIGIN` + cross-zone
   card support. ✅ pre-staged — a no-op until the env var is set.
5. **[PG code]** Cutover PR: `basePath`, `metadataBase=…/puzzles`,
   `serverActions.allowedOrigins`, cron path, `BETTER_AUTH_URL` + client
   `baseURL`, host-only cookies. 🚧 drafted, **not merged**.
6. **[you · Vercel/console]** The flip (CORRECTED — safety review): attach
   `origin-puzzles.biscuitlab.net` to Puzzle Lab (protection ON) → set
   `PUZZLES_ORIGIN=https://origin-puzzles.biscuitlab.net` on the hub +
   `BETTER_AUTH_URL=https://biscuitlab.net` (**origin only** — see the auth fix in
   `multi-zone-cutover-log.md`) on Puzzle Lab; update Google OAuth redirect URI +
   JS origins.
7. **[flip]** Merge the PG cutover PR (deploys `basePath`) → redeploy the hub →
   `biscuitlab.net/puzzles` serves Puzzle Lab.
8. **[you · DNS]** `puzzles.biscuitlab.net/*` → `biscuitlab.net/puzzles/*`, 301
   permanent. CORRECTED (safety review §4): **fold the redirect into the hub
   project** — attach `puzzles.biscuitlab.net` to the hub and add a host-conditional
   `redirects()` rule (`basePath: false`). A separate `puzzles-redirect` project is
   unnecessary. Vercel issues 308 (SEO-equivalent to 301).
9. **[hub code]** Flip the project card `href` → `/puzzles` + `crossZone: true`;
   add the sitemap index (§3).
10. **[you · SEO]** Search Console + Bing on the apex; IndexNow; validate JSON-LD
    + rendered canonicals (this is track C).

**Gate (the one that matters):** `biscuitlab.net/puzzles` serves the app with
assets + auth intact, `puzzles.biscuitlab.net` 301s without looping, a passkey
registered at step 2 still works, and every Puzzle Lab page's canonical points at
`biscuitlab.net/puzzles/*`.

**Rollback:** remove the hub rewrite + the 301, revert `basePath`,
`BETTER_AUTH_URL`, `metadataBase`, and the cron path. `basePath` is build-time
inlined, so this needs a redeploy, not just a flag. Under ~ten minutes, because
the rpID moved first. Keep `PASSKEY_RP_ID=biscuitlab.net` (valid on the subdomain
too).

---

## Blocker steps you need to do (0c + migration)

These need account access / a live domain, so they're yours. Detailed
step-by-step is in this repo's chat handoff and summarized here.

### A. Puzzle Lab rpID move (do first) — ✅ done

1. Merge PG PR #25, then the `PASSKEY_RP_ID` PR (#27). ✅
2. Vercel → Puzzle Lab → Environment Variables → `PASSKEY_RP_ID = biscuitlab.net`
   (Production); redeploy. ✅
3. Register a passkey via the new `/account` page (#28), sign out, sign back in
   with it. Round-trips → the move is done. ✅

### B. Registrar + DNS — ✅ done (and the audit's "not Cloudflare" was too strong)

**Actual state:** `biscuitlab.net` is registered at **Cloudflare**, on Cloudflare
nameservers, with **grey-cloud (DNS-only)** records that resolve to Vercel's real
IPs — so Cloudflare is *not* proxying. The apex serves the hub (primary domain on
the hub's Vercel project) and `www` → apex. This is a supported Vercel setup and
it's live.

- The audit's C1 concern was the Cloudflare **reverse proxy** (orange-cloud): the
  redirect loop, masked IPs, double-cache. Grey-cloud avoids all of it. The one
  hard rule: **keep every `biscuitlab.net` record grey-cloud (DNS-only), never
  orange (proxied).**
- No registrar transfer is needed. (It's also impossible right now — the domain
  was created 2026-06-24, so the 60-day ICANN lock blocks any transfer until
  ~Aug 23, 2026.) Moving to Porkbun/Spaceship after the lock is optional, not
  required.
- Nameserver delegation to Vercel is *not* used (Cloudflare Registrar keeps its
  own NS) and isn't needed — grey-cloud A/CNAME records → Vercel is the supported
  alternative.

### C. Search Console, Bing, analytics (can run in parallel)

1. Google Search Console → add a **Domain property** for `biscuitlab.net`
   (verify via the DNS TXT record Vercel/your registrar lets you add). Keep the
   existing `puzzles.biscuitlab.net` property to watch the 301s resolve.
2. Bing Webmaster Tools → add `biscuitlab.net` (you can import from GSC).
3. Analytics: enable **Vercel Analytics** on the hub project (Web Vitals) and add
   **Plausible or Umami** for traffic (audit A6).

### D. After cutover

1. Submit the sitemap index in GSC + Bing; set up **IndexNow** (host the
   `{key}.txt`, POST changed URLs).
2. Run the **Rich Results Test** on the hub + a log post to confirm the JSON-LD.
3. Confirm every Puzzle Lab page's rendered `<link rel="canonical">` points at
   `biscuitlab.net/puzzles/*` (canonical-first — there is no Host-based origin
   `noindex`) and that the 301s are resolving in GSC. Do **not** use the
   Change-of-Address tool — it's domain-level only, not path-level (validation
   doc §7).
