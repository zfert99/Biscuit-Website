# Web Presence Plan v2 — zfertig.com + biscuitlab.net

Two sites, two jobs, cross-linked. Plus the discoverability work, which is
currently at zero.

**What changed in v2.** The subdomain pattern is abandoned in favour of paths on
the apex, a project-tier rule replaces "everything gets a subdomain," the
WebAuthn rpID constraint is written down as the gating item it actually is, and
the Biscuit Lab hub is specified in enough detail to build in an afternoon. The
sequence is reordered so the hostname decision happens before any SEO content
gets written.

---

## PART 1 — How the two relate

| | zfertig.com | biscuitlab.net |
|---|---|---|
| **Job** | Hiring. Who you are, what you've built, why it matters | Projects. What you make, for people who want to use it |
| **Audience** | Recruiters, hiring managers, ID reviewers | Users, other developers, curious visitors |
| **Content** | Case studies, technical writing, resume, about, contact | Project index, live products, build logs |
| **Canonical** | Yes — this is the one on your resume | No — linked from zfertig.com |

Reasoning for keeping zfertig.com canonical: "Zack Fertig" has no competition in
search, while "Biscuit Lab" collides with at least three unrelated companies. On
a resume header, your name as a domain is self-evidently yours.

**Cross-linking.** Every Biscuit Lab project gets a "built by Zack Fertig" link
back to zfertig.com in the footer. Every zfertig.com case study links out to the
live thing on Biscuit Lab. Both sides carry `Person` JSON-LD with `sameAs`
pointing at the other, so the two hostnames resolve to one entity rather than two
strangers.

**What Biscuit Lab is not.** It is not a second portfolio. No about page, no
resume, no contact form, no skills list. The moment it starts explaining Zack
rather than showing projects, it is competing with zfertig.com and losing.

---

## PART 2 — zfertig.com

Structure and full case study copy are in the earlier two documents
(`Portfolio_Plan` and `Site_Rebuild_Plan`) — that content stands. Summary of the
information architecture:

```text
/                    home — positioning + three featured case studies
/work                case study index
/work/saga           Saga Education (write this first)
/work/puzzle-lab     Puzzle Lab as learning design
/work/shout          Shout! rebuilt from archived Wix content
/work/cdt-dashboard  Center for Design Thinking (short)
/writing             technical write-ups — the evidence gap-closer
/about               background, ID + engineering, resume download
/contact             email, LinkedIn, GitHub
```

**`/writing` is not optional and not a blog.** Per the Portfolio Plan's evidence
table, "I design learning for technical audiences" is the one weak claim in the
whole positioning, and technical write-ups are what close it. See Part 4 of the
zfertig.com Rebuild Plan for the division of labour between these and Biscuit
Lab's build logs.

Build order: domain safety → placeholder → Saga case study → home → Puzzle Lab
case study → first `/writing` piece → everything else.

---

## PART 3 — The URL and hosting pattern

This section is new and supersedes the old "keep the subdomain pattern"
guidance.

## The decision

**Every Biscuit Lab project lives at a path on the apex domain.** No project
subdomains.

```text
biscuitlab.net              project index (the hub)
biscuitlab.net/puzzles      Puzzle Lab
biscuitlab.net/log          build logs
biscuitlab.net/[next]       subsequent projects
```

`puzzles.biscuitlab.net` gets a permanent 301 to `biscuitlab.net/puzzles`.

## Why not subdomains

A subdomain is the worst of the three available options because it collects
neither benefit. It does not consolidate authority the way a path does — Google
treats subdomains as substantially separate entities, so a new subdomain hanging
off an empty apex inherits nothing and starts from zero. And it does not confer
real brand independence the way a separate domain does; `puzzles.biscuitlab.net`
still reads as a sub-thing of Biscuit Lab.

The only problem subdomains actually solved here was deployment isolation, and
Next.js multi-zones solve that without touching the hostname.

## The tier rule

The size-based instinct is right; it just belongs on repos and deployments, not
on URLs.

| Tier | Lives at | Deployed as | Trigger |
|---|---|---|---|
| **Small** | `biscuitlab.net/thing` | a route inside the hub repo | a toy, a demo, one weekend |
| **Large** | `biscuitlab.net/thing` | own repo, own Vercel project, mounted via `basePath` + rewrite | own database, own auth, ongoing work |
| **Product** | `itsownname.com` | own everything; 301 from the Biscuit Lab path | a *concrete* trigger — see below |

Puzzle Lab is **Large**. It gets its own repo and deployment and lives at
`/puzzles`. If it ever earns Product tier, the answer is `puzzlelab.com` — not a
subdomain, which would be a lateral move.

**Graduation is gated on a concrete trigger, not ambition** (validated:
`Docs/research/solo-dev-brand-architecture.md`). The old "it has outgrown being
one of Zack's projects" is too vague to act on. Graduate a project to its own
domain only when it: **ships to an app store**, **gets its own paid
marketing/audience**, **needs a separable auth or legal/company entity**, or **is
being spun out**. Absent one of those, keep it on the path even when it's large —
a domain move reliably costs link equity and adds redirect/renewal/monitoring
overhead (the WooCommerce → Woo.com rebrand lost roughly three-quarters of daily
traffic and was reverted within months).

**Two guardrails from the same research:**

- The top failure mode for a solo dev's second site is that it goes stale and
  reads as abandonment. Keep Biscuit Lab deliberately minimal and never host
  hiring-critical content here — that belongs on zfertig.com. (This is already
  the hub plan's Part 1 stance; the research confirms it.)
- If running both `/writing` and `/log` makes either go 3+ months stale, collapse
  the log into a tagged section of the single zfertig.com blog and cross-link.
  Keep one subscription endpoint, on zfertig.com.
- Make the parent/child relationship explicit in copy ("Puzzle Lab, a project
  from Biscuit Lab") rather than trusting the shared "Lab" naming to convey it.

## The gating constraint: WebAuthn rpID

Passkey credentials are bound to the `rpID` they were registered under. Puzzle
Lab's is currently `puzzles.biscuitlab.net`, which means every registered passkey
dies the moment the hostname changes.

**Fix this first, independently of everything else in this document.** Set
`rpID` to `biscuitlab.net`. WebAuthn permits any registrable domain suffix of the
origin, so apex-scoped credentials remain valid on the apex and on every
subdomain. This makes the hostname move a non-event and leaves room for a future
account system shared across Biscuit Lab projects.

Changing `rpID` invalidates existing credentials — everyone re-registers. That is
trivial today with a handful of test accounts and effectively impossible once
there are real users. There is no version of this that gets cheaper by waiting.

*Caveat:* apex-scoped rpID means any subdomain of biscuitlab.net can use those
credentials. Fine while every subdomain is yours. Never point a Biscuit Lab
subdomain at something you don't control.

## Migration checklist

Assuming rpID is already fixed:

- [ ] `basePath: '/puzzles'` in the puzzle app's `next.config`
- [ ] No `assetPrefix` needed — `basePath` auto-scopes `/_next/*` in Next 15+
      (corrected; see `Docs/research/multi-zone-migration-validation.md` §2a)
- [ ] Rewrite from the hub app to the puzzle deployment (multi-zone pattern)
- [ ] Cookies stay host-only — same apex host after cutover, so no re-scoping and
      no `.biscuitlab.net` domain (validation doc §3); passkeys unaffected
- [ ] 301 `puzzles.biscuitlab.net/*` → `biscuitlab.net/puzzles/*`, kept forever
- [ ] Audit absolute URLs: `metadataBase`, canonicals, OG image URLs, any links
      in transactional email
- [ ] New Search Console property on the apex; resubmit sitemap

Combined with the hub build, this is an afternoon. In three months with content
indexed and users registered, it is a weekend plus a support problem.

## Honest sizing of the SEO gain

Modest on its own. Google handles subdomains fine and consolidation is not magic.
If Puzzle Lab were the only project ever, staying put would be defensible.

The argument is compounding. Four projects on one hostname accumulate every
backlink, every build-log internal link, and report through one Search Console
property. Four subdomains hanging off an empty apex are orphans pointing outward
with nothing flowing back.

**Independently corroborated, with one deflation.** The SEO research reaches the
same verdict from a different direction — subdomains are treated as somewhat
separate entities and must build authority independently, a subfolder on the apex
consolidates faster, and critically: *don't migrate URL structure later, it resets
the clock.* That is the same move-now-or-never conclusion arrived at from the rpID
angle, which is reassuring.

But the research also qualifies the benefit: moving to a subfolder helps most *if
the apex is already an established brand with authority.* `biscuitlab.net` isn't —
it's an empty domain. So the immediate gain is smaller than the compounding
argument implies. **Expect no ranking bump from the migration itself.** It is
right because it is cheapest now and because the compounding is real across four
projects, not because it will move anything next month.

---

## PART 4 — biscuitlab.net, the hub

## What it's for

Three jobs, in priority order:

1. **Own the apex.** It's the hostname everything else mounts under, the rpID
   scope, the sitemap index, and the entity Google associates with the projects.
2. **Make one project look like a practice.** A single project on a bare domain
   reads as abandoned. The same project inside a small, deliberate hub reads as
   the first of several.
3. **Host the build logs.** The most SEO-viable writing available, because the
   work is already done.

## Structure

```text
/                    hub — one line of positioning, project cards, log teasers
/log                 build log index
/log/[slug]          individual posts
```

That's the whole site. No about, no contact, no blog categories, no tags.

## The empty-room problem

With one live project, a card grid looks unfinished. Three ways to fill it
honestly, all of which are true right now:

- **Status on every card.** `LIVE` / `IN THE LAB` / `SHELVED`. Keisan is
  genuinely in the lab; saying so is accurate and shows momentum rather than
  hiding it.
- **Treat Puzzle Lab's variants as visible surface.** The hub card links to
  `/puzzles`, but the card can name what's inside — Sudoku, Killer, Keisan — so
  one card carries real weight.
- **Log posts as content.** Two or three posts and the page has something living
  on it. Pick *process narratives*, not teaching pieces — the teaching pieces are
  spoken for by `zfertig.com/writing` and should not be spent here. The obvious
  first log post is what reading the KSudoku source revealed about its dead
  difficulty parameters: a story about being wrong and finding out, which is a log
  post's natural shape and a poor fit for a portfolio artifact.

Do not pad with fake placeholder projects or "coming soon" cards for things that
don't exist.

## Design direction

The Puzzle Lab aesthetic — warm baked palette, chunky pressable Flash-portal UI,
thick offset shadows — is the **family identity**, not Puzzle Lab's alone. The
names rhyme on purpose. The hub should be unmistakably the same lab.

What the hub inherits: palette, chunky button and card treatment, offset
shadows, the typographic voice.

What the hub does not inherit: the corkboard chaos layer. Scattered polaroids,
wobble filters, coffee stains, parody banner ads — that is Puzzle Lab's
personality, and it should stay there. The hub is the lab bench: same materials,
calmer arrangement. An ordered grid of chunky cards, one handwritten aside under
the logo, nothing scattered.

Practical consequence: **do not build a shared design system package yet.** Two
consumers is not enough to justify the coordination cost. Copy the tokens into
the hub, let them drift, extract a package at project three if the drift is
actually annoying.

## Technical scope

- Next.js in a `src/` directory, static, no database, no auth
- Owns the multi-zone rewrites to project deployments
- Owns `robots.ts`, and a **hand-rolled** sitemap index (`route.ts`) referencing
  each zone's sitemap — Next.js does not generate the index for you
- Carries `Organization`, `WebSite` + `SearchAction`, and `Person` JSON-LD with
  `sameAs` → zfertig.com, LinkedIn, GitHub
- OG image for the root and per log post
- Reflows to a single column at 320 CSS px; `eslint-plugin-jsx-a11y` blocking in
  CI from the first commit

An afternoon if it stays this small. The failure mode is scope creep into a
second portfolio — see Part 1.

---

## PART 5 — SEO and discoverability

## Set expectations first

For job hunting, SEO is low-leverage. Recruiters source on LinkedIn; almost
nobody finds a candidate through organic search. But they *do* google you after
reading your resume — so the goal is narrow:

**zfertig.com should be the #1 result for "Zack Fertig."** That's the whole
objective. Don't chase anything else.

Puzzle Lab is different — it has real organic potential, and that's worth
pursuing on its own merits.

## Getting indexed

1. **Google Search Console** — verify zfertig.com and biscuitlab.net, submit
   sitemaps. Highest-value single step; without it Google may take months.
   Note: verify `puzzles.biscuitlab.net` as its own property in the interim, since
   a subdomain is a separate property, and keep it after the move to watch the
   301s resolve.
2. **Bing Webmaster Tools** — also verify. Bing feeds DuckDuckGo and several AI
   search products, and almost nobody bothers, so it's cheap coverage.
3. **`app/sitemap.ts`** — Next.js generates individual sitemaps natively, but it
   does **not** reliably auto-generate a top-level index linking them.
   `generateSitemaps` produces `/sitemap/0.xml`, `/sitemap/1.xml` and so on; the
   index has to be hand-rolled as a `route.ts` handler returning a
   `<sitemapindex>` (about fifteen lines), or skipped in favour of submitting each
   sitemap separately in Search Console. Google ignores `<priority>` and
   `<changefreq>` — only `<lastmod>` matters.
4. **`app/robots.ts`** — allow the indexable surface, point at the index,
   disallow `/api/`, account routes, and play-state URLs. Make the AI-crawler
   policy an explicit decision rather than a default: **allow** the citation and
   live-fetch bots (`PerplexityBot`, `ChatGPT-User`, `Claude-User`) since blocking
   them removes you from AI answers entirely; blocking the training crawlers
   (`GPTBot`, `CCBot`, `Google-Extended`) is a values choice with minimal SEO
   cost. `Google-Extended` governs Gemini and Vertex training only — it does not
   affect AI Overviews or normal Search.
5. **IndexNow** — host a `{key}.txt` at the domain root and POST changed URLs to
   `api.indexnow.org`. Near-instant discovery on Bing, Yandex, Seznam, and Naver.
   Google does not consume it, but **Bing powers ChatGPT Search**, which makes this
   the cheapest AI-visibility lever available. Submit only genuinely new indexable
   URLs — never generated puzzle instances.
6. **Backlinks are how Google discovers you.** Add zfertig.com to: your GitHub
   profile README and bio, LinkedIn contact info and Featured section, the Puzzle
   Lab repo's About field and README, and itch.io or wherever Shout! lives.
   LinkedIn's links are nofollow, but GitHub's are indexable and Google crawls
   GitHub constantly.

## On-page basics for zfertig.com

- Next.js `metadata` exports. Homepage title: `Zack Fertig — Learning Experience
  Designer & Software Engineer`. Name first, in the title, on every page.
- One `<h1>` per page containing your name on the homepage.
- `Person` JSON-LD on the homepage — name, job title, URL, `sameAs` to LinkedIn,
  GitHub, and biscuitlab.net.
- Real alt text on case study images.
- OG images for every page. These matter more than ranking does — they're what
  renders when you paste a link into LinkedIn or a recruiter email, and a blank
  preview looks careless.

## Structured data across both sites

| Where | Schema |
|---|---|
| biscuitlab.net root | `Organization`, `WebSite` + `SearchAction`, `Person` with `sameAs` |
| zfertig.com home | `Person` with `sameAs` — the mirror image |
| Puzzle mode pages | `VideoGame` **co-typed** with `WebApplication`; Google shows no rich result for `VideoGame` alone |
| All pages, both sites | `BreadcrumbList` — still produces rich results |
| Strategy guides and `/writing` | `Article` with a real, verifiable author entity |
| Learning course | `Course` / `LearningResource` |

**Do not add FAQ or HowTo markup for SERP real estate.** HowTo rich results were
removed in September 2023; FAQ rich results stopped appearing 7 May 2026, with
Search Console support withdrawn that June. Keep either only where it has genuine
parsing value for AI extraction, and expect nothing visible in results.

## Puzzle Lab: index policy

This site will accumulate thousands of near-identical procedurally generated
URLs — three puzzle types × five difficulties × daily instances, forever. That is
precisely the shape Google's scaled-content-abuse policy targets, so the
index/noindex split has to be deliberate from the start rather than retrofitted.

| | Pages |
|---|---|
| **Index** | Variant landing pages, per-difficulty landing pages, archive index pages, strategy/technique pages |
| **Noindex, follow** | Individual puzzle instances; dated daily permalinks other than the current one |
| **Noindex** | Leaderboards, profiles, anything user-generated — quality *and* privacy |
| **Canonical** | Near-duplicate variants → the canonical experience, rather than only noindexing them |

Clean slugs throughout — `/killer-sudoku/expert`, never `?id=123`.

Landing pages need real server-rendered prose on first load — rules, technique
explanation, what makes this difficulty different. A client-rendered app shell is
invisible to the crawler and thin to a reader; AI crawlers render JavaScript far
less reliably than Googlebot does, so CSR content stays invisible to them even
after Google catches up. That prose is the difference between a legitimate
programmatic page and a spam signal.

**Publish the indexable pages in batches, not all at once.** Documented
programmatic-SEO case data shows bulk-publishing 100+ pages at a time tanks
indexing rates, with the thin ones stalling in "Crawled — currently not indexed."

## Puzzle Lab: keyword reality

People genuinely search for what this does — printable sudoku PDFs, killer sudoku
generators, puzzles with strategy hints. Long-tail and winnable, unlike anything
on a portfolio site.

**The Keisan naming problem.** Nobody searches "Keisan." The pages have to brand
as Keisan while targeting the terms people actually type. Lean on **Calcudoku**
and **Mathdoku** rather than KenKen — they carry real search volume, they're
generic, and they avoid putting a trademarked term in a title tag as an implied
claim. Something like `Keisan — Free Calcudoku & Mathdoku Puzzles`.

**Strategy content is the real asset.** "How to solve Sudoku with X-Wing" is a
query people type, and the solver already contains the explanation. When the
learning mode ships, a page per technique is the highest-value SEO work
available — and it must live on the same hostname as the app, which is the whole
argument in Part 3 restated.

## What traffic will realistically do, and by when

The Portfolio Plan leans on usage numbers as a resume line. Priced honestly:

A domain with no inherited authority — and a freshly migrated apex counts — should
expect indexing within days to weeks, first movement on low-competition long-tail
terms around months 3–6, meaningful traffic months 6–12, and competitive terms
9–12+. Google's own guidance is four months to a year. Layered on top: roughly
58–68% of Google searches now end without a click, and AI Overviews cut
position-one CTR by around 58% on affected queries. "How to solve X" content is
exactly the exposed category.

**Consequence: do not sequence the job hunt behind traffic.** If the migration
lands in August 2026, meaningful organic traffic is a spring 2027 artifact. The
Puzzle Lab case study has to stand on the engineering and the learning-design
argument — the solver, the taxonomy, the difficulty-as-curriculum thesis — with
usage numbers as a bonus if they arrive in time.

This changes nothing about the SEO work, which is cheap and compounds. It changes
what the portfolio is allowed to promise.

## Analytics: two tools, not one

They do different jobs and neither substitutes for the other.

- **Vercel Analytics** — zero-config, cookie-free, no consent banner, Web Vitals
  broken down by route. This is the field-data source for Core Web Vitals, which
  are measured at the 75th percentile of real users and cannot be inferred from
  Lighthouse.
- **Plausible or Umami** — product and traffic analytics. Umami self-hosts free on
  the Neon Postgres already running.

Skip GA4 unless ad-network integration is ever needed. Watch referrers from
`chatgpt.com`, `perplexity.ai`, `gemini.google.com`, and `copilot.microsoft.com`;
AI Overview clicks are invisible and arrive as ordinary Google organic.

Start counting before the content ships, not after — a usage number without a
start date isn't a number.

## llms.txt — decided against, on purpose

Recorded so it doesn't get re-litigated. Roughly an hour of work, no major AI
company consumes it in production, Google's May 2026 AI Optimization Guide
explicitly dismisses it, and one 90-day server-log study found 84 of 62,100
AI-bot visits touched `/llms.txt` — worse than an average content page. Its real
current value is as a routing layer for AI coding agents. Skip; revisit in 6–12
months.

---

## PART 6 — Sequence

## Now — one evening, do not defer

1. **Set Puzzle Lab's WebAuthn rpID to `biscuitlab.net`.** Only genuinely
   time-sensitive item in this document. Verify with a fresh passkey round-trip.
2. **Registrar check on zfertig.com.** If it sits at Wix, start the transfer to
   **Porkbun or Spaceship** — not Cloudflare, which mandates its own nameservers
   and cannot be proxied in front of Vercel without breaking things. 60-day ICANN
   lock risk means this can silently eat two months.
3. **Repo baseline on both repos** — GitHub Flow, branch protection on *status
   checks* with approvals **off** (GitHub blocks self-approval), Conventional
   Commits, squash-only merge, CI running lint / `tsc --noEmit` / test / build,
   Dependabot, secret scanning with push protection, `.env*` ignored with a
   committed `.env.example`.
4. **Analytics on Puzzle Lab** — Vercel Analytics *and* Plausible or Umami. Two
   tools, different jobs.
5. **Search Console + Bing** on `puzzles.biscuitlab.net` as it stands. Cheap, and
   the before/after is useful when the 301s land.

## Next — one afternoon, one sitting

6. Build the biscuitlab.net hub (Part 4)
7. Move Puzzle Lab to `/puzzles` in the same session — basePath, rewrites, 301s
8. New Search Console property on the apex; resubmit sitemaps
9. Nameservers delegated to Vercel; placeholder deploy on zfertig.com
10. Backlinks from GitHub, LinkedIn, the Puzzle Lab repo

## Then — unblocked, any order

11. Hand-rolled sitemap index, `robots.ts` with the AI-crawler policy, IndexNow
12. Structured data per the table in Part 5
13. Puzzle Lab variant landing pages with real server-rendered prose, in batches
14. zfertig.com: Saga case study, then home, then Puzzle Lab, then `/writing`
15. Build logs at `biscuitlab.net/log`
16. Strategy pages when the learning mode ships — the strongest asset on either
    site, and the flagship for AI citation as well as search

## Explicitly not yet

Anything that writes content at a URL that is about to change: landing page copy,
canonical tags, per-difficulty prose, OG images for puzzle pages. Writing those
before step 6 means writing them twice.
