# Agent Rules

<!-- BEGIN:nextjs-agent-rules -->
## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:project-context -->
## Project Context

This repo is the **Biscuit Lab Hub** (`biscuitlab.net`) — a small **static** hub
that owns the apex domain, indexes projects, and hosts a build log. It is a
companion to Puzzle Lab (served under `/puzzles` via a multi-zone rewrite) and to
`zfertig.com`.

The authoritative scope is `Docs/BiscuitLab_Hub_Plan.md`. Read its Part 1
non-goals before adding anything — the following are **deliberately out of
scope**: auth, database, user accounts, CMS, comments, tags/categories, a shared
design-system package. There is no puzzle engine, no PDF generation, and no
game logic in this repo. Rules below that mention auth, sessions, or a database
apply only **if and when** such a feature is deliberately added.

The visual direction is `Docs/design/design-system.md` — the hub inherits Puzzle
Lab's foundation and refuses its "corkboard chaos" personality.
<!-- END:project-context -->

<!-- BEGIN:documentation-standards -->
## Documentation Standards

- **Naming convention:** all documentation files use `lowercase-kebab-case.md`.
- **Organization:**
  - Root `Docs/` directory: active, living documents (e.g. the hub plan, web
    presence plans).
  - `Docs/design/`: the design system and design references.
  - `Docs/research/`: standardized, deeply-researched topic documents (best
    practices, hosting, security, accessibility, performance).
  - `Docs/archive/`: historical logs, superseded plans, and phase walkthroughs.
<!-- END:documentation-standards -->

<!-- BEGIN:roadblock-research-rules -->
## Roadblock & Research Rules

When implementation diverges from the plan — a measurement contradicts an
assumption, a slice hits a roadblock, or a chosen approach turns out to be
infeasible — **stop building and write a research document** rather than
improvising a workaround or silently narrowing scope.

- Put the document in `Docs/research/` (`lowercase-kebab-case.md`). Capture: what
  we planned, what we actually measured/observed (with numbers), why it doesn't
  work, the options considered, and the **open questions** to research before
  proceeding.
- Surface it to the user with a concise summary and a recommendation. Let the
  user run research (or approve a direction) before resuming — don't answer
  plan-invalidating questions by guessing.
- When the answer comes back, **fold it into the plan/roadmap docs first**, then
  resume the build. The `Docs/research/` doc stays as the durable record of *why*
  the approach changed.
<!-- END:roadblock-research-rules -->

<!-- BEGIN:markdown-linting-rules -->
## Markdown Linting Rules

Ensure all markdown files adhere to proper linting standards and formatting
(correct list indentation, explicit code block languages, proper heading
hierarchy) to avoid markdown linting errors.
<!-- END:markdown-linting-rules -->

<!-- BEGIN:architecture-rules -->
## Architecture & Structure

- **`src/` from the first commit.** Moving to it later is pure churn. See the hub
  plan Part 3 for the intended file tree.
- **No feature folders yet (AI Pitfall).** Do NOT introduce a `src/features/`
  domain architecture. At roughly four routes that is premature fragmentation —
  the architecture research warns against exactly that component explosion. If
  something needs colocating inside a route segment later, use the private-folder
  convention (`_components/`, `_lib/`).
- **App Router purity (AI Pitfall):** `src/app/` is strictly for routing,
  layouts, and server-side entry points. `page.tsx` files act as controllers —
  delegate rendering to components and logic to `lib/`. Do not create insecure
  monolithic route files.
- **`pageExtensions` trap (AI Pitfall):** Do NOT use the `pageExtensions` config
  to force a `.page.tsx` suffix as a colocation trick. It's a Pages Router-era
  technique with long-standing, still-open App Router issues (404s, missing CSS,
  broken builds). Use private folders instead.
- **Next.js runtime declarations (AI Pitfall):** Any App Router route handler
  (`route.ts`) that relies on native Node modules (e.g. `fs`, `stream`) must
  explicitly `export const runtime = 'nodejs';` — otherwise Next.js may attempt
  Edge deployment and crash. The `feed.json`, `sitemap.xml`, and `robots`
  handlers should be `force-static` where possible (see hub plan Parts 6 and 8).
- **Server vs. Client Components:** Components are Server Components by default.
  Reserve `"use client"` for leaf components that genuinely need interactivity.
  The hub is almost entirely static chrome — do not reflexively add `"use
  client"` to a whole route because one child needs it.
- **Separation of concerns:** Keep UI components decoupled from data logic.
  Extract data-fetching and complex state into `lib/` or custom hooks. Avoid
  premature "component file explosion" — a sub-component used by one parent
  belongs in the same file or a colocated private folder, not a global directory.
- **Colocation & import aliases:** Files that change together are stored
  together. Use module path aliases (e.g. `@/`) instead of deep, fragile
  relative imports (`../../../`).
- **File naming:** Ban the `Avatar/index.ts` pattern for components (use
  `Avatar/Avatar.tsx`) so files stay IDE-searchable. Keep barrel files shallow if
  used at all — deep barrels defeat tree-shaking and slow cold builds.
- **UI composition:** Use the `children` prop and named slots for complex
  layouts; avoid deep component inheritance.
<!-- END:architecture-rules -->

<!-- BEGIN:code-comments -->
## Code Comments

- **Ban syntax-restating comments** (e.g. `// set count to 0`). Code should be
  self-documenting through expressive naming.
- **Explain the "why"** — document external constraints, workarounds (e.g.
  browser bugs), and architectural trade-offs, not the mechanics of a `for` loop.
- Add JSDoc (`/** */`) to the top of major exports for IDE tooltip hints.
<!-- END:code-comments -->

<!-- BEGIN:testing-rules -->
## Testing & Linting

- **Vitest, not Jest** for unit/integration tests **if and when they are
  added** — Next.js ships an official Vitest setup guide, it starts faster (no
  Babel/`ts-jest` transform), and has native ESM support. This repo currently
  ships **no unit tests** (only the Playwright reflow/a11y gate below); a static
  hub of a few routes rarely needs them. Don't scaffold Vitest until there is
  real logic to cover — when you do, add `vitest` + config and an
  `npm test` script, then wire it into CI.
- **Vitest hybrid environments (AI Pitfall):** Use the `// @vitest-environment
  jsdom` pragma at the top of React UI test files (or `environmentMatchGlobs`).
  Keep the global Vitest environment `node` to prevent `Request` polyfill
  collisions in route-handler tests.
- **Playwright, not Cypress** for E2E — real WebKit/Safari coverage and free
  parallelization. E2E suites live in a top-level directory, exempt from
  colocation.
- **Colocation:** unit/integration test files reside immediately adjacent to the
  source they validate (e.g. `ProjectCard.test.tsx` next to `ProjectCard.tsx`).
- **Behavioral UI testing:** follow Arrange-Act-Assert; use accessibility-first
  queries (`getByRole`, `getByLabelText`) to test behavior, not implementation.
- **Mock only at boundaries** (network, external APIs), never internal modules.
- **Snapshots:** use sparingly — large snapshots get rubber-stamp-approved on
  `--update`. Prefer explicit assertions for anything a human must verify.
- **Run before concluding:** `npm run lint`, `npm run typecheck`, and
  `npx markdownlint-cli "**/*.md"` — plus `npx vitest run` once unit tests
  exist. All must pass.
- **The reflow/a11y gate is a blocking check** (see below), not optional polish.
<!-- END:testing-rules -->

<!-- BEGIN:accessibility-rules -->
## Accessibility & Performance Floor

- **Reflow (WCAG 2.2 SC 1.4.10):** every hub page must reflow to a single column
  and stay usable at **320 CSS px** (= 400% zoom on 1280px) with no
  two-dimensional scrolling. Never ship `user-scalable=no` or `maximum-scale` in
  the viewport meta.
- **CI from the first commit:** `eslint-plugin-jsx-a11y` at `recommended` as a
  blocking check, and a Playwright test asserting `documentElement.scrollWidth <=
  clientWidth + 1` at 320 / 375 / 768 / 1024 / 1440. Any overflow blocks merge.
- Respect `prefers-reduced-motion`; real alt text on every image; a strong
  `:focus-visible` ring; `img, video, iframe { max-width: 100%; height: auto }`
  and `overflow-wrap: break-word` globally.
- Use `next/image` and `next/font` (self-hosted fonts) to avoid layout shift and
  external requests. Keep pages static; there is no reason to server-render a
  dynamic instance of anything here.
- Full accessibility spec lives in `Docs/design/design-system.md` §7 and the hub
  plan Part 5.
<!-- END:accessibility-rules -->

<!-- BEGIN:security-rules -->
## Security & Infrastructure

Most auth/database attack surface does not exist on a static hub. Keep it that
way; the cheap baseline below still applies, and the gated rules apply only if a
server-side/auth/database feature is later added.

- **Security headers (baseline, not optional):** ship `X-Content-Type-Options`,
  `X-Frame-Options`/`frame-ancestors`, `Referrer-Policy`, and `Permissions-Policy`
  via `next.config.ts` `headers()` for every route. A nonce-based CSP is a
  deliberate follow-up, not a blocker for shipping the cheaper headers now.
- **Middleware is not an auth boundary (AI Pitfall):** CVE-2025-29927 let
  attackers bypass Next.js middleware-based auth via a spoofed
  `x-middleware-subrequest` header. This repo ships no `middleware.ts`, which
  sidesteps the bug — keep it that way unless a genuine need arises, and if it
  does, put real authorization in Route Handlers / a Data Access Layer, failing
  closed.
- **CI security scanning:** wire up free-tier tooling — GitHub CodeQL (SAST),
  Dependabot (SCA), and `npm audit` — before launch. **Gotcha:** a top-level
  version bump doesn't always reach a natively-compiled sub-dependency a
  framework bundles internally (e.g. Next.js pins its own nested `sharp`). After
  patching a CVE, confirm with `npm ls <pkg>` and add a `package.json`
  `overrides` entry if a vulnerable nested copy remains.
- **AI-generated code is unaudited by default:** passing tests or compiling is
  not evidence of security. Run a dedicated, separately-prompted security
  self-review pass on any server-side/data-access change before calling it done.
  Before adding a newly-suggested package, confirm it actually exists and is
  maintained — LLMs hallucinate plausible package names ("slopsquatting") and
  attackers register them.
- **WebAuthn / multi-zone prerequisite:** the migration in hub plan Part 7 is the
  fiddly part. Puzzle Lab's WebAuthn rpID must already be `biscuitlab.net` before
  cutover, or every registered passkey dies. Read Part 7 in full before touching
  the rewrites.
- *(Gated — only if auth/DB is added):* passkeys-first sign-in; never store
  session tokens in `localStorage`/`sessionStorage` (HttpOnly/Secure/SameSite
  cookies only); verify resource **ownership**, not just authentication
  (OWASP Broken Access Control); parameterized queries via a type-safe ORM only;
  explicit `trustedOrigins` (including Vercel previews); shared-store rate
  limiting (in-memory does not share state across serverless instances).
<!-- END:security-rules -->

<!-- BEGIN:git-rules -->
## Git Rules

- **GitHub Flow:** `main` always deployable; short-lived `feat/` and `fix/`
  branches; one PR per change; squash-merge with the PR title as the squash
  message. See `Docs/research/git-github-best-practices-solo-multi-repo.md` for
  the solo-dev branch-protection gotcha (require status checks + linear history;
  leave "require approvals" **off**, since GitHub blocks approving your own PR).
- **Committing and pushing:** ONLY run `git commit` or `git push` when the user
  explicitly requests it (e.g. "commit", "push", "commit push"). Do NOT commit
  code automatically or unprompted.
- `.env*` gitignored; `.env.example` committed.
<!-- END:git-rules -->
