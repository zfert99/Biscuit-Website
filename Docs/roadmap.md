# Biscuit Lab Hub — Roadmap

The build plan for `biscuitlab.net`, sliced into phases with gates. This is the
living tracker; the authoritative scope is `Docs/BiscuitLab_Hub_Plan.md`, and the
corrections/additions folded in here come from `Docs/Plan_Audit_vs_Research.md`.

**Status legend:** ✅ Done · 🚧 In progress · 📋 Planned · ⛔ Blocked (prereq)
**Tracks:** 🏗️ Setup · 🎨 UI · 🔀 Infra · 🔎 SEO · 🔗 Integration

## At a glance

| Phase | What | Track | Status |
| :---: | --- | :---: | :---: |
| **D** | Docs & planning — hub plan, design system, research corpus, this roadmap | 🏗️ | ✅ Done |
| **0a** | Reset the arcade scaffold to the hub | 🏗️ | ✅ Done |
| **0b** | Repo baseline — CI, Dependabot, branch protection | 🏗️ | ✅ Done |
| **0c** | Cross-repo prerequisites (Puzzle Lab rpID, domains, DNS) | 🔀 | ⛔ Blocked |
| **1** | The hub page — cards, status stamp, `Person` JSON-LD | 🎨 | ✅ Done |
| **2** | The build log — MDX pipeline, first post | 🎨 | 📋 Planned |
| **3** | Multi-zone migration — `/puzzles` rewrite + 301 | 🔀 | ⛔ Blocked |
| **4** | SEO surface — sitemap index, robots, schema, IndexNow | 🔎 | 📋 Planned |
| **5** | zfertig.com integration — `feed.json` | 🔗 | 📋 Planned |

> Phase 3 is blocked on 0c (the WebAuthn rpID move must land first, or every
> registered passkey dies at cutover). Phase 0c items live mostly in *other*
> repos / accounts, not this one.

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

### 0c — Cross-repo prerequisites ⛔

Mostly outside this repo, but they gate Phase 3:

- **Puzzle Lab WebAuthn `rpID` → `biscuitlab.net`**, with a fresh passkey
  round-trip tested. Non-negotiable, and it goes first.
- **Registrar/DNS:** keep domains at Porkbun or Spaceship (not Cloudflare —
  audit C1), nameservers delegated to Vercel, **no reverse proxy** in front.
- **Analytics + Search Console** on Puzzle Lab as it stands: Vercel Analytics
  (Web Vitals) + Plausible/Umami (traffic), GSC + Bing verified.

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

## Phase 2 — The build log (B2) 📋 🎨

- MDX pipeline, `lib/log.ts` (read + sort, parse thin frontmatter), index + post
  pages, `generateStaticParams` + `generateMetadata`, per-post
  `opengraph-image.tsx`.
- One real post shipped: the KSudoku source-vs-docs discovery.

**Gate:** the post reads as something a developer would finish; recent posts
surface on the hub.

## Phase 3 — Multi-zone migration (B3) ⛔ 🔀

The genuinely fiddly part — read hub plan Part 7 in full first. Blocked on 0c.

- `basePath: '/puzzles'` on Puzzle Lab; rewrite target is a **distinct origin
  hostname** (not `puzzles.biscuitlab.net`, or you get a redirect loop).
- Both rewrite entries (`/puzzles` and `/puzzles/:path*`); `puzzles.biscuitlab.net`
  301s to `biscuitlab.net/puzzles/*`.
- Session cookie domain, `metadataBase = https://biscuitlab.net`,
  `X-Robots-Tag: noindex` on the origin host, absolute-URL audit, cron paths,
  auth callback URLs.

**Gate (the one that matters):** `biscuitlab.net/puzzles` serves the app with
assets + auth intact, `puzzles.biscuitlab.net` 301s without looping, and a
passkey registered before the move still works.

## Phase 4 — SEO surface (B4) 📋 🔎

- **Hand-rolled sitemap index** as a `route.ts` handler (audit C4 — Next.js
  won't generate the index for you); only `<lastmod>` matters.
- `robots.ts` with an **explicit AI-crawler decision** (audit A4): allow
  citation bots (`PerplexityBot`, `ChatGPT-User`, `Claude-User`); training
  crawlers are a values choice.
- Full JSON-LD set (audit A5): `Organization`/`WebSite`+`SearchAction`/`Person`
  on root, `BreadcrumbList` everywhere, `Article` on posts. No FAQ/HowTo for SERP.
- OG images; **IndexNow** (audit A3); publish indexable pages gradually (A7).
- Search Console + Bing on the apex; `metadataBase` points at `biscuitlab.net`,
  not the pre-decision hostname (audit C5).
- `llms.txt`: **decided against** for now (audit A8) — revisit in 6–12 months.

**Gate:** sitemap index validates, both properties verified, origin host returns
`noindex`, JSON-LD passes the Rich Results Test.

## Phase 5 — zfertig.com integration (B5) 📋 🔗

- `app/feed.json/route.ts` (`force-static`, daily revalidate) returns the three
  most recent posts; zfertig.com consumes it for the "From the lab" strip.

**Gate:** zfertig.com builds against the live feed and degrades gracefully — a
failed fetch hides the strip, it does not fail the build.

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
