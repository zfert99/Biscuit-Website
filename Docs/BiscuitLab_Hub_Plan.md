# Biscuit Lab Hub — Implementation Plan

`biscuitlab.net`. Companion to `Web_Presence_Plan_v2` (Parts 3 and 4) and
`zfertig_com_Rebuild_Plan`.

Sliced B0–B5 with gates. B0–B3 is the afternoon. B4–B5 can follow.

---

# PART 1 — Scope

## What it is

A small static hub that owns the apex domain, indexes the projects, and hosts the
build log. Three jobs, in priority order:

1. **Own the apex.** The hostname everything mounts under, the rpID scope, the
   sitemap index, the entity Google associates with the work.
2. **Make one project look like a practice.** A single project on a bare domain
   reads as abandoned. The same project inside a deliberate hub reads as the
   first of several.
3. **Host the build log.** Process narratives. The teaching pieces belong to
   `zfertig.com/writing` — see the routing rule in the rebuild plan.

## Non-goals

Written down because every one of these will feel tempting mid-build.

- No about page, no bio, no skills list, no contact form
- No auth, no database, no user accounts
- No CMS
- No comments
- No tags, no categories, no pagination, no archive-by-year
- No shared design-system package (see Part 5)
- No newsletter, no RSS-shaped furniture beyond the JSON feed in Part 6
- No dark mode toggle unless it falls out of the tokens for free

**The governing rule:** if a sentence explains Zack rather than a project, it
belongs on zfertig.com.

## Definition of done for the afternoon

`biscuitlab.net` resolves to a hub with one project card and a working link to
`biscuitlab.net/puzzles`, which serves Puzzle Lab. `puzzles.biscuitlab.net` 301s.
Nothing is broken and no passkey was harmed.

---

# PART 2 — Routes

```
/                    hub — positioning line, project cards, recent log
/log                 build log index
/log/[slug]          a post
/puzzles/*           rewritten to the Puzzle Lab deployment (not in this repo)
/feed.json           three most recent posts, consumed by zfertig.com
/sitemap.xml         sitemap index referencing each zone
/robots.txt
```

That is the whole site.

---

# PART 3 — File structure

```
biscuitlab-hub/
├── src/
│   ├── app/
│   │   ├── layout.tsx              root layout, fonts, header, footer
│   │   ├── page.tsx                hub
│   │   ├── globals.css             tokens + base
│   │   ├── log/
│   │   │   ├── page.tsx            index
│   │   │   └── [slug]/
│   │   │       ├── page.tsx        generateStaticParams + generateMetadata
│   │   │       └── opengraph-image.tsx
│   │   ├── feed.json/
│   │   │   └── route.ts            force-static, revalidate daily
│   │   ├── sitemap.xml/
│   │   │   └── route.ts            hand-rolled sitemap index — see Part 8
│   │   ├── opengraph-image.tsx     root OG
│   │   ├── sitemap.ts              the hub's own URLs
│   │   └── robots.ts
│   ├── components/
│   │   ├── ProjectCard.tsx
│   │   ├── StatusStamp.tsx         LIVE / IN THE LAB / SHELVED
│   │   ├── LogCard.tsx
│   │   ├── SiteHeader.tsx          wordmark + the one handwritten aside
│   │   └── SiteFooter.tsx          "built by Zack Fertig" → zfertig.com
│   ├── content/
│   │   ├── projects.ts             typed array, not MDX — see Part 4
│   │   └── log/
│   │       └── 2026-08-ksudoku-source-vs-docs.mdx
│   └── lib/
│       ├── log.ts                  read + sort posts, parse frontmatter
│       └── site.ts                 constants, canonical base, social links
├── public/
│   └── projects/                   card screenshots
├── .github/workflows/ci.yml        lint + tsc + build + a11y checks
├── next.config.mjs                 multi-zone rewrites
└── mdx-components.tsx
```

**Use `src/` from the first commit.** Moving to it later is pure churn for zero
benefit. Feature folders (`src/features/…`) would be premature fragmentation at
four routes — the architecture research warns against exactly that component
explosion — but `src/` itself costs nothing now and is where the codebase wants to
be if the hub ever absorbs a Tier-1 project as a route.

If anything does end up colocated inside a route segment, use the private-folder
convention (`_components/`, `_lib/`) rather than `pageExtensions`. That config was
built for the Pages Router and has long-standing open issues with the App Router
causing 404s, missing CSS, and broken builds.

**Why `projects.ts` and not MDX.** Projects are five fields and there are one or
two of them. A typed array gives autocomplete, compile-time errors on a missing
field, and zero content pipeline. Revisit if a project needs prose long enough
to want MDX, not on a count.

---

# PART 4 — Content model

```ts
// content/projects.ts
export type ProjectStatus = 'live' | 'in-the-lab' | 'shelved'

export type Project = {
  slug: string
  name: string
  blurb: string          // one sentence, no marketing voice
  contains?: string[]    // sub-things worth naming on the card
  href: string           // internal path, or external for tier-3 projects
  status: ProjectStatus
  screenshot: string
}
```

The `contains` field is what makes a one-project grid carry weight — the Puzzle
Lab card can name Sudoku, Killer, and Calc without pretending they are separate
projects.

Log frontmatter, deliberately thin:

```yaml
---
title: The docs were wrong about KSudoku's difficulty parameters
date: 2026-08-04
summary: One sentence. Used on the index, in feed.json, and as the meta description.
project: puzzles          # optional, for cross-linking
---
```

No `tags`, no `author`, no `draft` — delete the file if it isn't ready.

---

# PART 5 — Design direction

The brief is already set by the Puzzle Lab design system doc. This section is
about **what the hub inherits and what it refuses**, not a new direction.

## Inherit

Palette (cream, butterscotch, chocolate, deep grape lab accent), the chunky
pressable card and button treatment, thick offset shadows, the display and body
faces, the voice.

## Refuse

The corkboard chaos layer in full: scattered polaroids, SVG wobble filters,
coffee-stain doodles, parody banner ads, rotation on everything. That is Puzzle
Lab's personality and it stays behind the `/puzzles` door.

The hub is the **lab bench**: same materials, everything squared up. An ordered
grid of chunky cards, generous space, one handwritten aside under the wordmark,
nothing else scattered.

## The signature

**The status stamp.** `LIVE` / `IN THE LAB` / `SHELVED` rendered as a chunky
label-maker tag on the corner of each project card — and the single element on
the page permitted to sit off-square, at a couple of degrees.

It earns the boldness three ways: it encodes something true rather than
decorating, it is the honest answer to the one-project problem, and it is the
element that keeps working as the grid fills up. Everything else stays
disciplined so this is the thing the page is remembered by.

Restraint check: exactly one rotated element, exactly one handwritten line, one
accent colour doing the emphasis. If a second thing starts asking to be rotated,
the answer is no.

**Accessibility is part of the spec, not a later pass.** Because the stamp encodes
status, it falls under SC 1.4.1 Use of Color. It passes as designed — the words
`LIVE` / `IN THE LAB` / `SHELVED` carry the meaning and the colour only reinforces
it — but that is currently an accident of the design, and the obvious
"simplification" later is to drop the words and keep the colours. Don't. The text
label is load-bearing.

Also SC 1.4.11: the stamp's border and fill need **3:1 non-text contrast** against
the card, and the focus ring needs 3:1 against whatever sits behind it. A warm
cream-on-butterscotch palette is exactly where this fails quietly — low-contrast
text is the most common WCAG failure on the web, found on 83.9% of the top million
home pages in WebAIM's 2026 survey. Check the pairs with a contrast tool before
committing the tokens, not after.

## Do not extract a design-system package

Two consumers does not justify the coordination cost of a shared package —
versioning, a build step, and a release whenever a token changes. Copy the tokens
into `globals.css` and let the two sites drift.

**The trigger to extract is behavioural, not a project count.** Extract when you
find yourself making the same change across two or more repos in lockstep,
repeatedly. Below that, duplication is cheaper than coordination. And when it
fires, publish a **private npm package** — not git submodules or subtrees, which
solve the sharing problem by creating a worse one. The same threshold governs the
monorepo question: Turborepo only if lockstep editing becomes the norm.

## Quality floor, unannounced

**320 CSS px, not 360.** WCAG 2.2 SC 1.4.10 Reflow requires content usable at
320px (equivalently 400% zoom on a 1280px viewport) with no two-dimensional
scrolling. The reflow exception for games and data grids covers Puzzle Lab's
boards and covers nothing here — every hub page reflows to a single column.

Global CSS, all cheap:

```css
img, video, iframe { max-width: 100%; height: auto }
```

plus `overflow-wrap: break-word`, relative font units, and a strong
`:focus-visible` ring. No `user-scalable=no` or `maximum-scale` in the viewport
meta, ever.

In CI from the first commit:

- `eslint-plugin-jsx-a11y` at `recommended`, as a blocking check
- a Playwright test asserting `documentElement.scrollWidth <= clientWidth + 1` at
  320 / 375 / 768 / 1024 / 1440. Any overflow failure blocks merge.

Plus `prefers-reduced-motion` respected and real alt text on every screenshot.

---

# PART 6 — The zfertig.com feed

`app/feed.json/route.ts` returns the three most recent posts as JSON. zfertig.com
fetches it at build time for the "From the lab" strip.

```ts
export const dynamic = 'force-static'
export const revalidate = 86400

export async function GET() {
  const posts = getAllPosts().slice(0, 3).map(p => ({
    title: p.title,
    summary: p.summary,
    date: p.date,
    url: `https://biscuitlab.net/log/${p.slug}`,
  }))
  return Response.json({ posts })
}
```

Set permissive CORS if zfertig.com ever fetches it client-side. It shouldn't —
build-time fetch is better — but the header costs nothing.

---

# PART 7 — The multi-zone migration

The genuinely fiddly part. Read the whole section before starting.

## Prerequisite, non-negotiable

**Puzzle Lab's WebAuthn rpID must already be `biscuitlab.net`.** If it is still
`puzzles.biscuitlab.net`, every registered passkey dies at cutover. Do this
first, on its own, and confirm a fresh passkey registers and authenticates.

## The loop trap

`puzzles.biscuitlab.net` cannot be both the 301 source and the rewrite target.
Point the rewrite at a **different origin hostname**:

- the Vercel-assigned production URL, or
- a dedicated `origin-puzzles.biscuitlab.net`

Then `puzzles.biscuitlab.net` is free to 301 to `biscuitlab.net/puzzles/*`
without recursion. Getting this backwards produces an infinite redirect that
looks like a caching problem for about an hour.

## Config

Puzzle Lab:

```js
// next.config.mjs
export default {
  basePath: '/puzzles',
  // basePath already scopes /_next assets; only set assetPrefix if serving
  // static assets from a separate origin. Verify against current Next docs.
}
```

Hub:

```js
const ORIGIN = process.env.PUZZLES_ORIGIN // no trailing slash

export default {
  async rewrites() {
    return [
      { source: '/puzzles', destination: `${ORIGIN}/puzzles` },
      { source: '/puzzles/:path*', destination: `${ORIGIN}/puzzles/:path*` },
    ]
  },
}
```

Both entries are needed — the bare path does not always match `:path*`.

## Checklist

- [ ] rpID confirmed on the apex, fresh passkey round-trip tested
- [ ] `basePath: '/puzzles'` set; app boots locally at `/puzzles`
- [ ] Origin hostname distinct from `puzzles.biscuitlab.net`
- [ ] Rewrites live; `/puzzles/_next/*` assets resolve
- [ ] Session cookie domain set to `.biscuitlab.net`, or accept one forced
      re-login (passkeys unaffected either way)
- [ ] `metadataBase` on the puzzle app set to `https://biscuitlab.net` so
      canonicals and OG URLs point at the public hostname, not the origin
- [ ] `X-Robots-Tag: noindex` on the origin hostname via middleware checking the
      `Host` header, so the origin never gets indexed alongside the real URLs
- [ ] `puzzles.biscuitlab.net/*` → `biscuitlab.net/puzzles/*`, 301, permanent
- [ ] Absolute URLs audited: OG images, canonicals, transactional email, any
      hardcoded links in the app
- [ ] Vercel Cron paths still correct under `basePath`
- [ ] Auth callback and redirect URLs updated in better-auth config

## Rollback

Remove the rewrites and the 301, revert `basePath`. Under ten minutes, provided
rpID was moved first — which is the entire reason it goes first.

---

# PART 8 — SEO surface

## The sitemap index has to be hand-rolled

**Next.js will not generate it for you.** `generateSitemaps` produces
`/sitemap/0.xml`, `/sitemap/1.xml` and so on, but there is no reliable
auto-generated top-level index linking them. Two options:

1. `src/app/sitemap.xml/route.ts` returning a `<sitemapindex>` document that
   references the hub's own `sitemap.ts` output and the puzzle zone's sitemap.
   About fifteen lines, and it keeps everything under one submission.
2. Skip the index and submit each sitemap separately in Search Console.

Option 1 is in the file tree. Either is fine; assuming Next does it for you is
not.

Also: Google ignores `<priority>` and `<changefreq>` entirely. `<lastmod>` is the
only field that carries weight.

## robots.ts, including an explicit AI-crawler decision

Allow the indexable surface, point at the sitemap index. The index/noindex policy
for puzzle pages lives in `Web_Presence_Plan_v2` Part 5 and is enforced inside the
puzzle app, not here.

Make the AI-crawler stance a decision rather than whatever the default emits:

| Bots | Recommendation |
|---|---|
| `PerplexityBot`, `ChatGPT-User`, `Claude-User` — citation / live fetch | **Allow.** Blocking these removes you from AI answers entirely. |
| `GPTBot`, `CCBot`, `Google-Extended` — training | A values choice with minimal SEO cost. `Google-Extended` governs Gemini and Vertex training only; it does not affect AI Overviews or normal Search. |

## IndexNow

Host a `{key}.txt` at the domain root and POST changed URLs to
`api.indexnow.org`. Near-instant discovery on Bing, Yandex, Seznam and Naver.
Google does not consume it — but **Bing powers ChatGPT Search**, which makes this
the cheapest AI-visibility lever available. Submit only genuinely new or changed
indexable URLs, never generated puzzle instances.

## Structured data

| Where | Schema |
|---|---|
| Hub root | `Organization`, `WebSite` + `SearchAction`, `Person` with `sameAs` → zfertig.com, LinkedIn, GitHub |
| Every page | `BreadcrumbList` — still produces rich results |
| Log posts | `Article`, with a real verifiable author entity |

zfertig.com carries the mirror `Person`. That reciprocal `sameAs` pair is what
connects the two hostnames into one entity rather than two strangers.

**Do not add FAQ or HowTo markup for SERP real estate.** HowTo rich results were
removed in September 2023; FAQ rich results stopped appearing 7 May 2026, with
Search Console support removed that June. Keep either only if it earns its place
for AI extraction, and expect nothing visible.

Render all JSON-LD server-side from a reusable server component so it lands in the
first HTML response. Validate in the Rich Results Test.

## Rest of the surface

OG image on the root and per log post via `opengraph-image.tsx`.

After cutover: new Search Console property on `biscuitlab.net`, keep the
`puzzles.biscuitlab.net` property to watch the 301s resolve, submit the index,
verify in Bing.

## llms.txt — decided against, on purpose

Recorded so it doesn't get re-litigated. Roughly an hour of work; no major AI
company consumes it in production; Google's May 2026 AI Optimization Guide
explicitly dismisses it; one 90-day server-log study found 84 of 62,100+ AI-bot
visits touched `/llms.txt`, worse than an average content page. Its real current
value is routing for AI coding agents. Revisit in 6–12 months.

---

# PART 9 — Slices and gates

## B0 — Prerequisites

rpID moved to `biscuitlab.net` and verified. Repo scaffolded with `src/`. Tokens
copied from the Puzzle Lab design system into `globals.css`. Fonts loading.

**Plus the repo baseline, on both repos** — this is cheap now and miserable to
retrofit onto fifty commits of unstructured history:

- **GitHub Flow** — `main` always deployable, short-lived `feat/` and `fix/`
  branches, one PR per change
- **Branch protection with the solo-dev gotcha handled:** require *status checks*
  and linear history, and leave "require approvals" **off**. GitHub blocks
  approving your own PR, so requiring approvals locks you out of your own `main`.
- **Conventional Commits + squash-merge**, with squash set as the only merge
  button and the squash message defaulting to the PR title
- **CI on PR and push to main:** lint, `tsc --noEmit` (after `next typegen`),
  test, build, plus the `jsx-a11y` and overflow checks from Part 5
- **Dependabot alerts and security updates; secret scanning with push
  protection**
- `.env*` gitignored, `.env.example` committed

**Gate:** a fresh passkey registers and authenticates against the apex rpID. The
hub renders a styled "hello" at localhost using the real palette and faces. CI
passes on a throwaway PR, and branch protection actually blocks a failing one.

## B1 — The hub page

Layout, header with wordmark and the one handwritten aside, footer with the
zfertig.com link. `projects.ts` with the Puzzle Lab entry. `ProjectCard` and
`StatusStamp`. Metadata and `Person` JSON-LD.

**Gate:** the page looks deliberate with exactly one card on it. If it looks
empty, the card treatment is wrong — fix it here, not by adding fake projects.

## B2 — The log

MDX pipeline, `lib/log.ts`, index and post pages, `generateStaticParams`, one
real post written and shipped: the KSudoku source discovery.

**Gate:** the post reads as something a developer would finish. Recent posts
surface on the hub.

## B3 — Migration

All of Part 7.

**Gate:** `biscuitlab.net/puzzles` serves the app with assets and auth intact.
`puzzles.biscuitlab.net` 301s without looping. A passkey registered before the
move still works. This is the gate that matters.

## B4 — SEO surface

All of Part 8: hand-rolled sitemap index, `robots.ts` with the AI-crawler
decision made, JSON-LD, OG images, IndexNow, Search Console and Bing on the apex.

**Gate:** the sitemap index validates, both properties verified, the origin
hostname returns `noindex`, JSON-LD passes the Rich Results Test.

## B5 — zfertig.com integration

`feed.json` shipped and consumed by the "From the lab" strip.

**Gate:** zfertig.com builds against the live feed and degrades gracefully — a
failed fetch hides the strip, it does not fail the build.

---

# PART 10 — Sequencing against everything else

B0 tonight, independent of the rest.

B1–B3 is the afternoon, and it should land **before** the Puzzle Lab case study
is written on zfertig.com, so that case study links to permanent URLs rather than
ones you edit later.

B4–B5 can trail. Neither blocks a return to Keisan.

The Keisan pause is well placed: the K0–K5 plan is reviewed but unstarted, so
the interruption costs re-reading a document rather than reloading a
half-finished slice. Keep it bounded — if the hub is taking more than the
afternoon plus B4–B5, the cause is scope, and Part 1's non-goals list is the
remedy.

---

# PART 11 — Build decisions (as implemented)

Recorded during the build so the plan matches the code. Live progress is in
`Docs/roadmap.md`; this captures where implementation firmed up or diverged from
the assumptions above. As of 2026-07-29: B0/B1/B2/B5 done, B4 done in-repo
(deploy/account items deferred), B3 + prerequisites outstanding.

- **Styling.** Colocated **CSS Modules** per component over the `globals.css`
  token layer — not the Tailwind theme mapping the design doc sketched. The
  a11y floor (reflow, `:focus-visible`, reduced-motion, media `max-width`) and a
  skip link live in `globals.css`.
- **Dark mode** ships via `prefers-color-scheme` only — no toggle, no
  `data-theme` layer (matches the Part 1 non-goal; it was free from the tokens).
- **Status stamp.** Themed `--ink` border (flips per theme, so 3:1 vs the card
  holds in both); `live`/`in-the-lab` use coloured fills with fixed-dark text;
  `shelved` is outline-only. The one handwritten header aside is **not** rotated
  — the stamp stays the single off-square element.
- **Log posts.** Clean slugs (`ksudoku-source-vs-docs.mdx`), not the
  date-prefixed filename sketched in Part 3 — the date lives only in
  frontmatter. `lib/log.ts` normalizes frontmatter dates to `yyyy-mm-dd` (YAML
  auto-parses an unquoted `date:` into a `Date`, which otherwise leaks into JSON
  and `<time>`).
- **MDX.** `@next/mdx` + `remark-frontmatter`, plugins in **string** form
  (required by Turbopack). `mdx` is in `pageExtensions` to enable the loader, but
  posts live in `src/content/log` and are imported as content — this is the
  sanctioned `@next/mdx` setup, **not** the `pageExtensions` colocation
  anti-pattern the agent rules warn against.
- **SEO (Part 8) status.** Shipped: `sitemap.ts`, `robots.ts` (citation AI bots
  allowed; training crawlers allowed with a documented one-line flip), JSON-LD
  (`Organization`/`WebSite`/`Person` + `BreadcrumbList` + `Article`), and OG
  images. Deferred until the domain is live / migration lands: the hand-rolled
  sitemap **index** (needs `/puzzles`), IndexNow, and Search Console/Bing
  verification.
- **Project card `href`** points at `puzzles.biscuitlab.net` today; it switches
  to `/puzzles` at migration (Part 7).
- **Toolchain.** Next pinned at `16.2.12`; `overrides` for Next's nested
  `postcss`/`sharp`; CI audits production deps only. ESLint 10 / TypeScript 7 /
  `@types/node` 26 are deferred — see
  `Docs/research/eslint10-ts7-upgrade-blockers.md`.
- **Repo governance.** Branch protection requires the `verify` check + linear
  history + a PR with 0 approvals (`enforce_admins` off as a solo escape hatch);
  squash-only merge with the PR title as the message.
