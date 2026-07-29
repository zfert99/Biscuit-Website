# Plan Audit — Web Presence Plans vs. Research Corpus

Auditing `Web_Presence_Plan_v2`, `zfertig_com_Rebuild_Plan`, and
`BiscuitLab_Hub_Plan` against fifteen uploaded research documents.

Verdict: **AMBER.** The structural decisions hold and are independently
corroborated. Five items are wrong or under-specified and need changing before
B0. Nine are missing and should be added. Nothing requires rethinking the
architecture.

## Coverage

| Research doc | Bearing |
|---|---|
| SEO & GEO for Puzzle Lab (compass b33039b0) | **Heavy** — corrections and additions |
| portfolio-hosting | **Heavy** — one hard correction |
| git-github-best-practices-solo-multi-repo | **Moderate** — confirms polyrepo, adds missing baseline |
| accessibility-responsive-qa | **Moderate** — corrects the quality floor |
| enterprise-architecture, web-best-practices | Light — file structure calibration |
| nextjs-performance | Light for the hub, heavy for the puzzle app |
| web-security-mitigation, ai-assisted-nextjs-security | Puzzle app only — hub is static, no auth, no DB |
| responsive-design-pwa, testing-mobile-responsiveness | Puzzle app only |
| web-design-and-game-juice | Already absorbed into the design system |
| git-github-best-practices (general) | Superseded by the multi-repo version |
| Keisan compass docs (bb40e383, feb5af89) | **Not applicable** — solver engine |

---

# PART 1 — Corrections

## C1. Registrar: not Cloudflare — Porkbun or Spaceship

**Where:** `zfertig_com_Rebuild_Plan` Part 1, step 3.

I recommended "Cloudflare or Porkbun." The hosting research makes Cloudflare the
wrong choice for a Vercel-hosted site, for two compounding reasons.

**Cloudflare Registrar mandates Cloudflare nameservers** and prohibits pointing
DNS at an external provider. That forecloses the supported Vercel architecture,
which is delegating authoritative nameservers to Vercel.

**Vercel explicitly discourages any reverse proxy in front of its platform.**
Proxying through Cloudflare masks the end-user IP, degrading Vercel's bot
protection, WAF, and DDoS mitigation; rotating proxy exit IPs trigger continuous
captcha challenges for legitimate traffic; and the dual cache layer serves stale
content because Vercel's deploy-time purge cannot clear Cloudflare's cache. The
classic symptom is an `err_too_many_redirects` loop: Cloudflare's default
Flexible SSL forwards plain HTTP to Vercel, Vercel returns a 308 upgrade,
Cloudflare passes it back to the browser, repeat. Escalating to Full (Strict)
fixes the loop but not the rest.

**Revised recommendation:** Porkbun or Spaceship, then delegate nameservers to
Vercel. Five-year .com totals: Spaceship ~$49.60, Cloudflare ~$52.20, Porkbun
~$55.40. Spaceship is cheapest; Porkbun has better human support and no upsells.
The six-dollar difference is not the deciding factor — DNS freedom is.

Applies to both domains.

## C2. The responsive floor is 320px, not 360px

**Where:** `BiscuitLab_Hub_Plan` Part 5, "Quality floor."

WCAG 2.2 SC 1.4.10 Reflow requires content to be usable at **320 CSS px** (400%
zoom on a 1280px viewport) with no two-dimensional scrolling. I wrote 360px,
which is a device-population number, not the conformance threshold.

The grid exception does not help here: 1.4.10 exempts games and data tables from
reflow, which covers Puzzle Lab's boards but covers nothing on the hub. Every
hub page must reflow to a single column at 320px.

Also add to the floor, all cheap and all from the same research:

- `img, video, iframe { max-width: 100%; height: auto }`
- `overflow-wrap: break-word`
- relative font units
- no `user-scalable=no` or `maximum-scale` in the viewport meta
- `eslint-plugin-jsx-a11y` at `recommended`, as a blocking CI check
- a Playwright test asserting `documentElement.scrollWidth <= clientWidth + 1`
  across 320/375/768/1024/1440

## C3. The status stamp needs a contrast check written into its spec

**Where:** `BiscuitLab_Hub_Plan` Part 5, "The signature."

The stamp encodes project status, which puts it under SC 1.4.1 Use of Color.
It passes as designed — `LIVE` / `IN THE LAB` / `SHELVED` are text labels, not
colour alone — but that is currently an accident of the design rather than a
stated requirement, and the obvious "simplification" later is to drop the words
and keep the colours.

Make it explicit, and add SC 1.4.11: the stamp's border and fill need **3:1
non-text contrast** against the card, and the focus ring needs 3:1 against
whatever it sits on. Low-contrast text is the single most common WCAG failure on
the web — the WebAIM Million 2026 report found it on 83.9% of the top million
home pages — and a warm cream-on-butterscotch palette is exactly where it
happens.

## C4. Next.js does not generate a sitemap index for you

**Where:** `BiscuitLab_Hub_Plan` Part 8, and `Web_Presence_Plan_v2` Part 5 step 3.

Both plans say the hub's `sitemap.ts` emits a sitemap index referencing the
puzzle zone. It does not work that way. `generateSitemaps` produces
`/sitemap/0.xml`, `/sitemap/1.xml` and so on, but Next.js does not reliably
auto-generate a top-level index linking them.

**Fix:** hand-roll the index as a `route.ts` handler returning a
`<sitemapindex>` document that references the hub's own sitemap and the puzzle
zone's, or skip the index entirely and submit each sitemap separately in Search
Console. The route handler is about fifteen lines and keeps one submission.

Also: Google ignores `<priority>` and `<changefreq>`. Only `<lastmod>` matters.

## C5. The research's own code snippets carry the pre-decision hostname

**Where:** anywhere `metadataBase` gets implemented.

The SEO research was written before the subfolder decision and its examples set
`metadataBase: new URL('https://puzzles.biscuitlab.net')`. Copying those snippets
post-migration produces canonicals and OG URLs pointing at a hostname that
301s — which is a canonical-signal problem, not just cosmetic.

Post-migration the value is `https://biscuitlab.net`, and the puzzle app's
`basePath` supplies the `/puzzles` segment. This is already in the hub plan's
migration checklist; flagging it here because the research doc is the thing most
likely to be copy-pasted from.

---

# PART 2 — Additions

## A1. The repo baseline is missing from B0 entirely

The hub plan scaffolds a repo and says nothing about how it is run. From the
multi-repo research, adopt across both repos:

- **GitHub Flow** — `main` always deployable, short-lived `feat/` and `fix/`
  branches, one PR per change
- **Branch protection with a specific gotcha:** require *status checks* and
  linear history, and leave "require approvals" **off**. GitHub blocks approving
  your own PR, so requiring approvals locks a solo dev out of their own main.
- **Conventional Commits + squash-merge**, squash set as the only merge button
- **CI on PR and push to main:** lint, `tsc --noEmit` (after `next typegen`),
  test, build
- **Dependabot alerts and security updates; secret scanning with push
  protection**
- `.env*` gitignored, `.env.example` committed

This is a B0 item. Retrofitting branch protection onto a repo with fifty commits
of unstructured history is worse than starting with it.

## A2. Replace "extract at project three" with a behavioural trigger

**Where:** `BiscuitLab_Hub_Plan` Part 5.

My "revisit at project three" was arbitrary. The research gives a better rule:
extract shared code only when you find yourself **making the same change across
two or more repos in lockstep, repeatedly**. Below that, duplication is cheaper
than coordination.

And when the trigger fires, **publish a private npm package** rather than using
git submodules or subtrees. Same rule governs the monorepo question: Turborepo
only if lockstep editing becomes the norm.

The conclusion is unchanged — don't extract now — but the trigger is now
observable rather than a guess.

## A3. IndexNow is missing from B4

Near-instant discovery on Bing, Yandex, Seznam, and Naver: host a `{key}.txt` at
the domain root, POST changed URLs to `api.indexnow.org`. Google does not consume
it, but **Bing powers ChatGPT Search**, so this is the cheapest AI-visibility
lever available. Submit only genuinely new indexable URLs, never generated puzzle
instances.

## A4. `robots.ts` needs an explicit AI-crawler decision

Neither plan says anything about AI crawlers, which means the default is
whatever `robots.ts` happens to emit. The distinction that matters:

- **Citation / live-fetch bots** — `PerplexityBot`, `ChatGPT-User`,
  `Claude-User`. Blocking these removes you from AI answers entirely. For a site
  trying to build visibility, allow them.
- **Training crawlers** — `GPTBot`, `CCBot`, `Google-Extended`. Blocking these is
  a values choice with minimal SEO cost. `Google-Extended` controls Gemini and
  Vertex training only; it does not affect AI Overviews or normal Search.

Make it a decision, not a default. Also disallow `/api/`, account routes, and
play-state URLs on the puzzle app.

## A5. Schema types are under-specified

Both plans mention `Person` JSON-LD and stop. From the research, the full set:

| Where | Schema |
|---|---|
| Hub root | `Organization`, `WebSite` + `SearchAction`, `Person` with `sameAs` |
| zfertig.com home | `Person` with `sameAs` (mirror) |
| Puzzle mode pages | `VideoGame` **co-typed** with `WebApplication` — Google shows no rich result for `VideoGame` alone |
| All pages | `BreadcrumbList` — still produces rich results |
| Strategy guides | `Article` with a real, verifiable author entity |
| Learning course | `Course` / `LearningResource` |

**Do not add FAQ or HowTo markup for SERP real estate.** HowTo rich results were
removed in September 2023; FAQ rich results stopped appearing 7 May 2026, with
Search Console support removed that June. Keep the markup only if it has parsing
value for AI extraction; expect nothing visible.

## A6. Analytics: run two, not one

The plans say "Plausible, Umami, or Vercel" as if picking one. They do different
jobs:

- **Vercel Analytics** — zero-config, cookie-free, no consent banner, Web Vitals
  broken down by route. This is your field-data source for Core Web Vitals.
- **Plausible or Umami** — product and traffic analytics. Umami self-hosts free
  on the Neon Postgres you already run.

Skip GA4 unless ad-network integration is ever needed. Also worth watching:
referrer traffic from `chatgpt.com`, `perplexity.ai`, `gemini.google.com`,
`copilot.microsoft.com`. AI Overview clicks are invisible — they arrive as normal
Google organic.

## A7. Publish indexable pages gradually

Documented programmatic-SEO case data shows bulk-publishing 100+ pages at once
tanks indexing rates, with thin pages stalling in "Crawled — currently not
indexed." Relevant when the puzzle variant and difficulty landing pages ship: put
them out in batches, not all at once. Mildly relevant to the log.

## A8. `llms.txt` — decided against, on purpose

Recording the decision so it doesn't get re-litigated. Roughly an hour of work,
no major AI company consumes it in production, Google's May 2026 AI Optimization
Guide explicitly dismisses it, and one 90-day server-log study found 84 of 62,100
AI-bot visits touched `/llms.txt` — worse than an average content page. Its real
current value is routing for AI coding agents. Skip for now; revisit in 6–12
months.

## A9. Hub file structure: use `src/`, keep it flat otherwise

The architecture research recommends `src/` with feature folders and private
`_components/` directories, route files kept to routing and metadata only.

For a four-route static hub, feature folders would be premature fragmentation —
which the same research warns against by name. But **adopt `src/` from the
start**, since moving to it later is pure churn, and use the `_components/`
private-folder convention if anything ends up colocated in a route segment.
Otherwise the flat tree in the hub plan stands.

(Unrelated but worth knowing: do not use `pageExtensions` with the App Router.
It was built for the Pages Router and there are long-standing open issues causing
404s, missing CSS, and broken builds.)

---

# PART 3 — Confirmations

**The subfolder decision.** Reached independently: subdomains are treated as
somewhat separate entities and must build authority independently; a subfolder on
the apex consolidates faster. Critically, the research adds *"don't migrate URL
structure later — that resets the clock,"* which is the same
move-now-or-never conclusion arrived at from the rpID angle.

**One honest caveat, though.** The research qualifies the benefit: moving to a
subfolder helps most "if `biscuitlab.net` is an established brand with
authority." It isn't — it's an empty apex. So the immediate gain is smaller than
the compounding argument suggests. The move is still right, because it is
cheapest now and the compounding is real over four projects, but do not expect a
ranking bump from the migration itself.

**The index / noindex policy.** The hub-and-spoke curated-indexing pattern in
`Web_Presence_Plan_v2` Part 5 matches the documented playbook for puzzle sites
almost exactly. Additions: canonicalize near-duplicate variants rather than only
noindexing them; clean slugs (`/killer-sudoku/expert`) never `?id=` parameters;
user and leaderboard pages noindex by default for privacy as well as quality.

**Server-rendered prose on landing pages.** Confirmed and strengthened: AI
crawlers render JavaScript far less reliably than Googlebot, so client-rendered
content is invisible to them even where Google eventually catches up.

**Polyrepo.** Confirmed as a legitimate default for a solo developer with
independent deploy cadences.

**The learning course as the flagship SEO asset.** The research calls technique
lesson pages the strongest E-E-A-T and GEO play available — highly citable in AI
answers, targeting exactly the long-tail informational queries a zero-authority
domain can win. Which is the same material the Portfolio Plan identifies as the
gap-closer for `/writing`. The two-genre split holds: the lesson pages are
product surface on Biscuit Lab, the essays about designing them are portfolio
artifacts on zfertig.com.

---

# PART 4 — One thing that changes the job-hunt sequencing

The Portfolio Plan leans on real usage numbers: *"Two thousand monthly users is
concrete in a way personal project never is."* The SEO research prices that
honestly.

A new domain with no inherited authority should expect indexing within days to
weeks, first movement on low-competition long-tail terms around months 3–6,
meaningful traffic months 6–12, competitive terms 9–12+. Google's own guidance is
four months to a year. A subdomain — or a freshly migrated apex — sits at the
longer end. Layered on top: roughly 58–68% of Google searches now end without a
click, and AI Overviews cut position-one CTR by around 58% on affected queries.
"How to solve X" content is precisely the exposed category.

**Consequence:** do not sequence the job hunt behind traffic. If the migration
lands in August 2026, meaningful organic traffic is a spring 2027 artifact. The
Puzzle Lab case study has to stand on the engineering and the learning-design
argument — the solver, the taxonomy, the difficulty-as-curriculum thesis — with
usage numbers as a bonus if they arrive in time.

This does not change the SEO work, which is cheap and compounds. It changes what
the portfolio is allowed to promise.

---

# PART 5 — Revised B0

Consolidating everything above that lands before any code:

1. Puzzle Lab WebAuthn `rpID` → `biscuitlab.net`, fresh passkey round-trip tested
2. Registrar check on zfertig.com; transfer to **Porkbun or Spaceship** if it
   sits at Wix (60-day ICANN lock risk)
3. Nameservers delegated to Vercel — no Cloudflare proxy in front
4. Repo baseline on both repos: GitHub Flow, branch protection on status checks
   with approvals **off**, Conventional Commits, squash-only merge, CI workflow,
   Dependabot, secret scanning, `.env*` ignored
5. Vercel Analytics + Plausible or Umami on Puzzle Lab
6. Search Console + Bing on `puzzles.biscuitlab.net` as it stands
7. Hub scaffolded with `src/`, tokens copied, 320px reflow and `jsx-a11y` wired
   into CI from the first commit
