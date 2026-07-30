# Biscuit Lab Hub — Roadmap

The build plan for `biscuitlab.net`, sliced into phases with gates. This is the
living tracker; the authoritative scope is `Docs/BiscuitLab_Hub_Plan.md`, and the
corrections/additions folded in here come from `Docs/Plan_Audit_vs_Research.md`.

**Status legend:** ✅ Done · 🚧 In progress · 📋 Planned · ⛔ Blocked (prereq)
**Tracks:** 🏗️ Setup · 🎨 UI · 🔀 Infra · 🔎 SEO · 🔗 Integration

**Status (2026-07-30):** the **multi-zone cutover is functionally live** —
`biscuitlab.net/puzzles` serves Puzzle Lab with assets + auth intact (passkey and
Google OAuth verified in the browser), the origin is re-locked behind a dedicated
custom host, per-page canonicals ship, and the `puzzles.biscuitlab.net` 301 is
folded into the hub. The running record of that work — successes, blockers, and the
exact config — is the **new operational doc `Docs/multi-zone-cutover-log.md`**; read
it alongside the runbook. What remains is SEO/hardening polish plus two Vercel
actions (attach `puzzles.biscuitlab.net` to the hub, decommission `puzzles-redirect`)
and the 0c account setup — see **Remaining before launch**.

## At a glance

| Phase | What | Track | Status |
| :---: | --- | :---: | :---: |
| **D** | Docs & planning — hub plan, design system, research corpus, this roadmap | 🏗️ | ✅ Done |
| **0a** | Reset the arcade scaffold to the hub | 🏗️ | ✅ Done |
| **0b** | Repo baseline — CI, Dependabot, branch protection | 🏗️ | ✅ Done |
| **0c** | Cross-repo prereqs — rpID ✅, DNS/apex ✅; GSC/Bing remain | 🔀 | 🚧 In progress |
| **1** | The hub page — cards, status stamp, `Person` JSON-LD | 🎨 | ✅ Done |
| **2** | The build log — MDX pipeline, first post | 🎨 | ✅ Done |
| **3** | Multi-zone migration — cutover **live**; 2 Vercel actions remain | 🔀 | ✅ Done* |
| **4** | SEO surface — canonicals ✅; sitemap index + GSC remain | 🔎 | 🚧 In progress |
| **5** | zfertig.com integration — `feed.json` | 🔗 | ✅ Done |

> **\*Phase 3** is code-complete and serving in production; the only open items are
> two Vercel console actions (attach `puzzles.biscuitlab.net` to the hub project so
> the folded 301 fires; decommission the redundant `puzzles-redirect` project). The
> rpID prerequisite landed first, so no passkey died at cutover. Full record:
> `Docs/multi-zone-cutover-log.md`.

---

## Phase D — Docs & planning ✅

Done. The hub plan, the plan-vs-research audit, the web-presence and zfertig
rebuild plans, the scrubbed research corpus, the hub design system, and the
agent rules are all in `Docs/` and on `main`.

---

## Phase 0 — Foundations (the B0 slice)

Everything that lands before feature work. Cheap now, miserable to retrofit.

### 0a — Reset the arcade scaffold ✅

Done. The repo was the retro-arcade project; reconciled with the hub plan
(Part 3):

- Package renamed `biscuitt-arcade` → `biscuit-lab-hub`.
- Arcade components removed (`ArcadeMatrix`, `HeroPlaceholder`,
  `SidebarPlaceholder`, `FooterControls`, `TopNav`).
- `globals.css` reset to the hub token layer + accessibility floor;
  `next/font` wired for Fredoka, Manrope, Space Mono.
- `layout.tsx` / `page.tsx` reset to a styled "hello" on the real palette.
- Demo assets cleared from `public/`.
- Unused Radix deps dropped; Next bumped to `16.2.12` (patched).
- `project.md` archived to `Docs/archive/retro-arcade-blueprint.md`.
- Baseline security headers added in `next.config.ts`.

### 0b — Repo baseline 🚧

From the multi-repo research (`git-github-best-practices-solo-multi-repo.md`):

- **GitHub Flow** — `main` always deployable, short-lived `feat/`/`fix/`
  branches, one PR per change. ✅ *(In use.)*
- **CI on PR + push to main:** build, `tsc --noEmit`, lint (`jsx-a11y` at
  recommended), the 320px overflow Playwright reflow test, and an
  `npm audit --omit=dev` production-dependency gate. ✅ *(`.github/workflows/ci.yml`.)*
- **Dependabot** for npm + github-actions. ✅ *(`.github/dependabot.yml`.)*
- `.env*` gitignored. ✅ *(commit `.env.example` when the first env var appears.)*
- **Branch protection with the solo-dev gotcha:** require the `verify` status
  check (strict) + linear history + a PR with **0 approvals** (GitHub blocks
  approving your own PR); `enforce_admins` off as a solo escape hatch. ✅
- **Secret scanning with push protection.** ✅ *(public repo — free.)*
- **Squash-only merge** as the only merge button, squash title = PR title,
  auto-delete branch on merge. ✅

### 0c — Cross-repo prerequisites 🚧

Mostly outside this repo. The items that gated Phase 3 (rpID, DNS/apex) are done;
only analytics + Search Console/Bing remain, and those no longer block anything:

- **Puzzle Lab WebAuthn `rpID` → `biscuitlab.net`**, with a fresh passkey
  round-trip tested. Non-negotiable, and it goes first. ✅ done.
- **Registrar/DNS:** ✅ done — `biscuitlab.net` is at Cloudflare on **grey-cloud
  (DNS-only)** records → Vercel (no reverse proxy). The audit's C1 concern was the
  Cloudflare *proxy* (orange-cloud); grey-cloud sidesteps it and is a supported
  Vercel setup. The one rule: keep every record grey-cloud, never proxied.
- **Analytics + Search Console** on Puzzle Lab as it stands: Vercel Analytics
  (Web Vitals) + Plausible/Umami (traffic), GSC + Bing verified. *(Remaining.)*

**Gate for Phase 0:** a fresh passkey registers/authenticates against the apex
rpID; the hub renders a styled "hello" at localhost on the real palette/faces;
CI passes on a throwaway PR and branch protection actually blocks a failing one.

---

## Phase 1 — The hub page (B1) ✅ 🎨

Done. Delivered:

- Root layout with `SiteHeader` (wordmark + the one handwritten aside, in
  Permanent Marker) and `SiteFooter` ("built by Zack Fertig" → zfertig.com);
  skip link for keyboard users.
- `content/projects.ts` (typed array) with the Puzzle Lab entry + `contains`
  list. (`href` is the current subdomain; becomes `/puzzles` after Phase 3.)
- `ProjectCard` + `StatusStamp` as colocated CSS-module components. The stamp is
  the single rotated element; the status **word** is load-bearing (SC 1.4.1) and
  the themed `--ink` border keeps 3:1 non-text contrast in both themes
  (SC 1.4.11) — audit C3 baked in.
- Site-wide `Person`/`Organization`/`WebSite` JSON-LD, server-rendered, with the
  reciprocal `sameAs` for the entity graph.
- On-brand placeholder thumbnail; real screenshots (via `next/image`) later.

**Gate met:** the page reads as deliberate with one card; reflow passes 320–1440.

## Phase 2 — The build log (B2) ✅ 🎨

Done. Delivered:

- MDX pipeline via `@next/mdx` + `remark-frontmatter` (string-configured for
  Turbopack); `.mdx` posts live in `src/content/log`, imported as content, not
  routed. `mdx-components.tsx` present.
- `lib/log.ts` reads + sorts posts and parses thin frontmatter (gray-matter);
  `/log` index + `/log/[slug]` post pages with `generateStaticParams`,
  `dynamicParams=false`, and `generateMetadata`.
- `LogCard` component; first real post shipped (`ksudoku-source-vs-docs`);
  recent posts surface on the hub under "From the lab".
- Reflow gate extended to `/log` and the post (15/15 across 320–1440).

Per-post `opengraph-image.tsx` intentionally deferred to Phase 4 (SEO surface).

**Gate met:** the post reads as a finished piece; recent posts surface on the hub.

## Phase 3 — Multi-zone migration (B3) ✅ 🔀

**Live in production.** The genuinely fiddly part is done — the full running record
(what worked, what broke, exact config) is `Docs/multi-zone-cutover-log.md`; the
plan is hub plan Part 7 + `Docs/multi-zone-migration-runbook.md`, and the
Puzzle-Generator side is that repo's `Docs/multi-zone-migration-plan.md`. All were
audited against `Docs/research/multi-zone-migration-validation.md` and corrected by
`Docs/research/multi-zone-migration-safety-review.md`.

What shipped:

- `basePath: '/puzzles'` on Puzzle Lab; the hub rewrites `/puzzles/*` to a
  **dedicated custom origin host `origin-puzzles.biscuitlab.net`** (Deployment
  Protection ON — custom domains are exempt, so the proxy reaches it while the
  generated `*.vercel.app` alias stays locked). This **corrects** the earlier plan's
  "rewrite to the `*.vercel.app`, no dedicated host needed" — Standard Protection
  never covers custom production domains, so the generated alias was the wrong target
  (safety review §1).
- **Auth under `basePath`** (the real blocker, now cleared): the strip test proved
  Next strips `/puzzles` before the handler, so better-auth mounts at the default
  `/api/auth` via an **origin-only `baseURL`** (PG #32); the Google OAuth
  `redirectURI` and the client's social `callbackURL` are pinned to the public
  `/puzzles/...` path (PG #32/#33). Passkey + Google verified in the browser.
- **Per-page canonicals** via root-layout `alternates: { canonical: './' }` (PG #34);
  `metadataBase = …/puzzles`; **not** a Host-based origin `noindex` (self-defeating).
- **Host-only cookies** (no `.biscuitlab.net`); `serverActions.allowedOrigins`;
  cron path.
- The `puzzles.biscuitlab.net` **301 is folded into the hub** as a host-scoped
  `redirects()` rule (hub #27), not a separate project (safety review §4).
- Hub project card `href → /puzzles` with `crossZone: true` (hub #26).

**Gate met:** `biscuitlab.net/puzzles` serves the app with assets + auth intact,
per-page canonicals resolve to `biscuitlab.net/puzzles/*`, and a passkey registered
before the move still works. **Open (Vercel console, not code):** attach
`puzzles.biscuitlab.net` to the hub project so the 301 fires; decommission
`puzzles-redirect`.

## Phase 4 — SEO surface (B4) 🚧 🔎

**Done in-repo:**

- `app/sitemap.ts` — hub URLs with `<lastmod>` only (Google ignores
  priority/changefreq).
- `app/robots.ts` — **explicit AI-crawler decision** (audit A4): citation bots
  (`PerplexityBot`, `ChatGPT-User`, `Claude-User`) allowed; training crawlers
  left allowed with a one-line flip documented.
- JSON-LD (audit A5): `Organization`/`WebSite`/`Person` site graph (from Phase 1),
  plus `BreadcrumbList` on `/log` and posts and `Article` on posts. No FAQ/HowTo.
- OG images: root `opengraph-image.tsx` + prerendered per-post
  `log/[slug]/opengraph-image.tsx`.
- `metadataBase` = `biscuitlab.net` (audit C5, set in Phase 1).
- `llms.txt`: **decided against** (audit A8) — revisit in 6–12 months.

**Done alongside Phase 3:**

- **Per-page canonicals** on Puzzle Lab (root-layout `alternates: { canonical:
  './' }`, PG #34) — the origin-indexing defense is **canonical-first**, not a
  Host-based origin `noindex` (which would fire on the proxied public response too).
- **Cross-zone sitemaps + noindex hygiene** — the puzzle zone ships its own
  `app/sitemap.ts` (`/puzzles/sitemap.xml`, PG #37) and the hub's `robots.txt` lists
  **both** sitemaps. This **supersedes audit C4's hand-rolled index**: a new research
  brief (`Docs/research/sitemap-architecture-multi-zone.md`) found that at <100 URLs an
  index adds a drift-prone file for zero crawl benefit and collides with Next's
  `sitemap.ts` special file — so **Option B** (two sitemaps in robots.txt) is the call.
  Auth pages (`/signin`, `/account`) carry `noindex` and are excluded (PG #37).

**Deferred (need a live domain / migration / account access):**

- **IndexNow** (audit A3) — ✅ wired: key hosted at `public/<key>.txt` + an
  `npm run indexnow` helper that submits both sitemaps' URLs (Bing/Yandex). Run it
  after publishing/changing content, once the key file is deployed.
- **Search Console + Bing verification** on the apex — account actions (part of 0c);
  submit both sitemaps there.

**Gate (partial):** JSON-LD is emitted server-side and ready for the Rich Results
Test, and per-page canonicals resolve to `biscuitlab.net/puzzles/*`; the full gate
(both properties verified, index validates) completes with the sitemap index and the
0c account setup.

## Phase 5 — zfertig.com integration (B5) ✅ 🔗

Done (hub side). Delivered:

- `app/feed.json/route.ts` — `force-static`, daily `revalidate`, `nodejs`
  runtime, permissive CORS. Returns the three most recent posts
  (`title`/`summary`/`date`/absolute `url`).
- Fixed a latent bug it surfaced: YAML auto-parses an unquoted `date:` into a
  Date, so `lib/log.ts` now normalizes dates to `yyyy-mm-dd` — keeping
  `feed.json` and every `<time dateTime>` clean.

**Gate (hub side met):** the feed is live and static. The graceful-degradation
half lives in the zfertig.com repo (consume at build time; a failed fetch hides
the strip, it doesn't fail the build).

---

## Sequencing (hub plan Part 10)

- **Phase 0 first**, independent of everything else.
- **Phases 1–3** are the core build, and should land **before** the Puzzle Lab
  case study is written on zfertig.com, so that case study links to permanent
  URLs.
- **Phases 4–5 can trail.** Neither blocks a return to other work.
- **Do not sequence anything time-sensitive behind organic traffic** (audit
  Part 4): a freshly migrated apex is a spring-2027 traffic story at the earliest.
  The SEO work is cheap and compounds; it just can't be a near-term dependency.

---

## Remaining before launch

Everything below needs cross-repo work, a live domain, or account access — none
of it is buildable from this repo alone.

1. **0c — prerequisites:**
   - rpID → `biscuitlab.net`: ✅ done (verified via the new `/account` page).
   - DNS / apex: ✅ done — Cloudflare **grey-cloud (DNS-only)** → Vercel, apex
     serves the hub. No transfer needed (and locked until ~Aug 2026 anyway); the
     one rule is to keep records grey-cloud, never proxied.
   - **Remaining:** Search Console + Bing on the apex, and analytics.
2. **3 — multi-zone migration** (hub plan Part 7): ✅ **live** — cutover done, auth
   verified, canonicals + 301 shipped, card `href` flipped. **Only Vercel console
   actions remain:** attach `puzzles.biscuitlab.net` to the hub project (so the
   folded 301 fires), and decommission the redundant `puzzles-redirect` project.
   Full record: `Docs/multi-zone-cutover-log.md`.
3. **4 — SEO tail:**
   - ✅ Cross-zone sitemaps (Option B): hub `robots.txt` lists both; puzzle zone
     ships `/puzzles/sitemap.xml` (PG #37). Research:
     `Docs/research/sitemap-architecture-multi-zone.md`.
   - ✅ IndexNow wired (key file + `npm run indexnow` helper); run after content
     changes to ping Bing/Yandex.
   - Verify both GSC properties; submit both sitemaps; run the Rich Results Test.
     *(Per-page canonicals to `biscuitlab.net/puzzles/*` — ✅ done, PG #34.)*
   - ✅ **Hardening confirmed** (cutover log): `CRON_SECRET` → 401;
     `serverActions.allowedOrigins` set (PG defines no server actions, so nothing to
     exercise); `next/image` unused in PG, so `remotePatterns`/`qualities` are N/A.
4. **zfertig.com side of Phase 5**: consume `feed.json` at build time for the
   "From the lab" strip, degrading gracefully on fetch failure.

Deferred toolchain upgrades (not launch-blocking) are tracked in
`Docs/research/eslint10-ts7-upgrade-blockers.md`.
