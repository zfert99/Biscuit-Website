# Mistakes and lessons

The long version of what went wrong building BellTab and moving it onto the
hub, and what each wrong turn taught. The condensed telling is the log post
[What broke building a bell clock](../src/content/log/what-broke-building-a-bell-clock.mdx);
this document is the reference behind it.

Sources: the **Bugs found** section of BellTab's `Docs/build-log.md` (forty-odd
entries, 2026-08-26 to 2026-09-04), its **Deviations** table, and this repo's
[multi-zone cutover log](multi-zone-cutover-log.md). Every bug named below has
a dated entry in one of those, with the diff and the numbers. This document
keeps the pattern, not the diff.

A note on what "mistake" means here. Almost nothing below was a typo. The
mistakes were beliefs: that a comment was true, that a stub stood in for a
browser, that a passing test meant what its name said, that a plan document
still described the code. The lessons are mostly about where beliefs come from
and how cheaply they can be checked.

## 1. A gate finds what reading never will

BellTab has had two blocking checks since its first commit: `eslint-plugin-
jsx-a11y`, and a Playwright test that asserts
`documentElement.scrollWidth <= clientWidth + 1` at five viewport widths. The
second one earned its keep more than any other line in the repo.

**What it caught.**

- A period name of sixty unbroken characters propagated its min-content width
  up through a `1fr` grid column, through `<main>`, and into the body track,
  which sized itself to 811px inside a 768px viewport. Read the CSS all you
  like; `overflow-wrap: break-word` was there, on `<body>`, and it looked
  right (see §4 for why it wasn't).
- The schedule's own name, a flex item in the header, pushed the wall clock
  off the right edge. The gap predicting this had been open in the build log
  for a day. The gap was correct; nobody had pointed the gate at the header.
- Deleting a stylesheet section while retiring the Day view took two live
  rules with it, because the section's heading said "Day view" and two of the
  rules inside applied to the Now view. The gate went red within a minute of
  the change.
- The editor grew to seven columns and the name column collapsed to 8px wide
  on every engine. Chrome's axe missed it by two pixels; the reflow assertion
  did not, because the input's contents scrolled.
- A `<nav>` placed beside the editor took 128px the editor did not have at
  the narrowest tier. A media query asks about the viewport; the editor's
  width is a fact about its container. Container queries replaced it.

**What it did not catch, and why that matters too.** The gate measures
whether the page scrolls. It said nothing while Chrome's `<input type="time">`
rendered wider than any other engine's and overflowed its cell without
overflowing the page, and it had been passing for a week on text alone before
any interactive control was under it. A green gate is a claim about the code
*and* a claim about what the gate measures. Widen the second before trusting
the first.

**The lesson.** A rule in a document ("every page reflows to 320px") is a
wish. A rule in CI is a fact about every commit after it. The repo's
`AGENTS.md` calls the reflow gate "a blocking check, not optional polish"
because of this section.

The same lesson wearing different clothes:

- The `lint:md` npm script had never once been run. It was not a shortcut;
  it was an untested claim that the docs lint clean. They did not.
- The security headers were configured in `next.config.ts` and reached every
  `/_next/*` asset and not one page, for a week, because the `headers()`
  matcher was wrong. A security header is not configured until a request has
  come back carrying it. `curl -I` is the test, and it takes four seconds.

## 2. A stub that succeeds immediately proves nothing

BellTab stubs its browser boundaries in Playwright: the Wake Lock API, the
Notification permission, the service worker, the clipboard. Every one of the
stubs was written to succeed, promptly, on the happy path. Three bugs hid in
the gap between "promptly" and "when the browser actually would".

- **The service worker was used before it was active.** The page lives at
  `/bell` and the worker's scope is `/bell/`, so `serviceWorker.ready` never
  resolves; the code registered the worker and called `showNotification` on
  the registration straight away. A real worker is `installing` for a few
  hundred milliseconds. A bell in that window was swallowed. Measured on a
  real Chrome, not deduced. The stub had resolved with an already-active
  worker, so nothing in CI could have seen it. The fix waits for `active`
  explicitly, and the stub now has `hold` and `activate` controls so the test
  drives the lifecycle instead of skipping it.
- **The wake-lock retry made a double-request race reachable.** Re-acquiring
  on `visibilitychange` and on the next gesture, with a request still in
  flight, produced two locks and one released. The stub resolved
  synchronously, so the race had no window in which to exist. An in-flight
  guard fixed it; the stub grew a way to resolve later.
- **A `setTimeout` inside a stub never fires under Playwright's paused
  clock.** The fake worker's "activate in a moment" was written with a timer,
  and every test that installed the clock hung. Microtasks are not the clock's
  business; `Promise.resolve().then(activate)` is.

**The lesson.** The interesting behaviour of every browser API is in its
timing and its refusals. A stub that models only its success models nothing
worth testing. Give each stub a refusing mode and a slow mode from the start,
and write at least one test through each.

A corollary from the same suite: deleting only the stub's own
`navigator.serviceWorker` property re-exposed the real one underneath, because
the real API is a prototype accessor. Removing a stub is a claim that the
real thing is gone; check which object the real thing lives on.

## 3. The test passed for the wrong reason

Six times a green test was reporting something other than what its name said.

- **A fixture installed on every navigation.** Playwright's `addInitScript`
  re-runs on reload, so a fixture that cleared `localStorage` before the app
  loaded also cleared it on the reload the persistence test performed. The
  test "preferences survive a reload" passed on a build where they did not,
  because it was asserting the seed value, which the fixture kept
  re-seeding. A fixture that is *installed* is not the same as one that ran
  *once*.
- **Three "engine failures" that were bad expectations.** The tests asserted
  the wrong minute at three period boundaries. A failing assertion is a claim
  that two things disagree, not proof of which one is wrong; the code was
  right all three times.
- **A ported test that could not fail for the reason it printed.**
  `element?.textContent !== null` is always true when `element` is missing,
  so the test would pass on an empty page. `?.` beside a `!== null` comparison
  is a bug pattern, not an idiom.
- **A reflow test that asserted a guarantee nobody had made.** It required a
  control to fit at 320px that the design never promised would. A red gate is
  a claim about the code and a claim about the test; this one was the test.
- **An installed Playwright clock is not a stopped one.** `clock.install`
  keeps time moving; only `clock.pauseAt` freezes it. Two tests were flaky
  because the countdown moved one second between arrange and assert, and both
  halves were invisible until something on the page changed.
- **The E2E clock was four hours off, only on other machines.** The fixture
  set the fake time with `new Date("2026-09-02T10:20")` — a wall-clock string
  parsed in the *runner's* timezone — so a colleague in a different zone (and
  GitHub's runners, in UTC) started every test in a different period. A
  fixture that reads as a wall-clock time is not one until the timezone is
  pinned; the Playwright project now sets `timezoneId`.

Two more that were about the harness rather than the assertion:

- A refactor script rewrote code inside string literals, because a regex does
  not know what a string is. Any codemod over source needs a parser or a
  review of every hunk.
- The test harness corrupted the file it was testing: an encoding round-trip
  written with the wrong flag. When a test fails on something as low-level as
  character encoding, suspect the test's own I/O before the code's.

**The lesson.** Read a green test the way you read a red one: what would have
to be true for this to pass, and is that the thing the name claims? The
cheapest check is to break the code on purpose and watch the test go red for
the stated reason.

## 4. A comment is an unmeasured claim

Four comments in the codebase asserted things that were false at the time
they were read, and each was believed because it was written with confidence
in the place a fact would go.

- `/* never below the 4.5:1 contrast floor */` sat above `opacity: 0.55`,
  which put the soft foreground at 3.9:1 on the dark theme. A comment
  asserting a contrast ratio is a measurement claim. Measure it, or delete
  the comment; the token-based fix replaced the opacity with a colour that
  was actually checked.
- `/* overflow-wrap: break-word lets long names wrap */` was true and
  irrelevant. `break-word` lets a word wrap but does not reduce the element's
  min-content contribution, so an intrinsically-sized ancestor still grows to
  fit the unbroken word. `anywhere` is the value that does both. A CSS
  property whose name sounds like the requirement is the most dangerous kind.
- "WebKit has no `type="time"`" was true of one Playwright build and not of
  the engine. A workaround built on it was wrong on every real Safari.
- A stylesheet section heading is a claim about what is inside. Two rules
  under "Day view" belonged to the Now view (§1).

And the mirror image — a claim in the code that had quietly stopped being
one: after Big mode was renamed from a view to a mode, two CSS selectors kept
matching by coincidence and stopped meaning anything. A selector that still
matches after a rename is not a selector that still means what it says.

**The lesson.** In the browser, a claim about behaviour is a claim about a
specific engine on a specific date. BellTab's `AGENTS.md` now requires
browser-behaviour claims to carry a citation or a test; the rule exists
because of this section.

## 5. The page is not the page you wrote

A framework, a browser and an assistive-technology scanner each add and
remove things. Six bugs were about forgetting that.

- **Next ships an `aria-live="assertive"` region into every page** (the route
  announcer). A test asserting "no live regions on the countdown" — the
  repo's rule that the tab title and countdown must never announce — failed
  on a page that had none of its own. "The page contains only what I put
  there" stops being true the moment a framework is involved.
- **The App Router overwrites `document.title` a frame after you set it.**
  The countdown's title kept flashing back to the metadata title. Two owners
  of one piece of DOM is the bug, not the ordering; the fix moved the title
  to the one place the router does not touch.
- **`next build` rewrites `tsconfig.json` behind you.** A tidy-up commit
  reverted a change Next had made and the next build made it again. Build is
  not read-only with respect to the repo.
- **Chrome's modal tab cycle passes through `<body>`.** A focus-trap test
  written for Firefox's behaviour failed on Chrome, and the first draft of
  the fix asserted the wrong engine was wrong. Neither was; they differ.
- **WebKit paints a `<select>`'s text outside the `<select>`** at the
  narrowest widths, and Chrome's `<input type="time">` is wider than any
  other engine's. Both are facts about engines, not about the CSS, and both
  were found only by looking at screenshots from all three.
- **`hidden` is an `HTMLElement` property, not an `SVGElement` one.** Setting
  `svg.hidden = true` does nothing. The convenience IDL properties (`hidden`,
  `dataset`, `title`) are not on every element.

Two from the same family, at the level of the whole app rather than one
element:

- A `<dialog>` is part of the page, and `confirm()` never was. Replacing the
  browser primitive with a page-level one handed the app every job the
  browser had been doing: focus return, the Escape key, the backdrop, the
  scroll lock, and being counted by the a11y scanner. A finding measured
  *through* that dialog ("the modal closes on any route") inherited its reach;
  it was one route.
- `role="alert"` is not free, and `[aria-live]` does not find it. ARIA roles
  carry implicit properties, and attribute selectors see attributes.

**The lesson.** Test on three engines, look at the screenshots, and assume the
framework has opinions about your DOM until you have read where it puts them.

## 6. Identity, not appearance

Three bugs came from keying a decision on what was displayed rather than on
what a thing was.

- **A name is not an identity.** The "is this schedule already in the
  library?" guard compared names. Two schedules called "Regular" — one the
  seed, one arriving over a shared link — were treated as the same schedule.
  A guard keyed on what is *displayed* is keyed on the wrong thing; schedules
  carry ids for exactly this.
- **Overlap errors were attributed by sort order, not edit order.** The
  validator sorted the periods, found the overlap, and blamed the later of
  the sorted pair — which was not the row the user had just typed in. The
  error now lands on the field that changed.
- **A cap that discarded the wrong end, and a date the type system waved
  through.** The override list was capped by dropping the *newest* entry
  (the one just added), and a `string` date reached the calendar unparsed.
  This was "parse, don't validate" applied to schedules and not to the
  calendar beside them; the boundary now covers both.

**The lesson.** Parse at the boundary into a type that cannot represent the
invalid state, and then key every comparison on the field that means
identity. Half-applying an invariant is a way of documenting where the next
bug is.

## 7. The plan drifted, and the code did not say so

BellTab's `AGENTS.md` asks that deviations from the plan be recorded under a
**Deviations** heading in the build log, with what is owed. Twelve
deviations were recorded. Two are worth the space here.

- **Big mode was never in the plan's Phase 6.** It was built because the
  projector case was obvious in the room, and the plan was amended
  afterwards. That order — build, then amend — is the wrong one, and the log
  says so, because a phase document that lags the code stops being a plan
  and becomes a changelog with worse formatting.
- **The Day view was owed by the port and never delivered.** The pre-React
  build had a full Day view. The React port dropped it with a note, the
  note aged into an open gap, and the gap was closed by mistake during a
  tidy-up — it took the user asking "what happened to the full day view?" to
  reopen it. Restored code is new code: the restoration carried two contrast
  failures (§4) and needed its own tests.

**The lesson.** A parked feature needs a phase, not a note. A deviation that
exists only in the code is indistinguishable from a mistake six weeks later.

## 8. Only a person could see it

Nothing in CI flagged these. Each was a correct implementation of the wrong
thing, and each was found by the person the tool is for, using it.

- **The settings copy was accurate and unfriendly.** "The countdown runs on
  the most recent valid schedule" is true and reads like a specification.
  Two passes rewrote it in the user's own words; the second pass happened
  because the first was still too matter-of-fact.
- **A shared link filed the schedule away instead of showing it.** Opening a
  link offered to *add* the schedule and kept showing the regular day. The
  person clicked a link to see a schedule; now the page runs it immediately,
  with "Keep it" and "No thanks" underneath, and "No thanks" puts the regular
  day back.
- **The day-as-blocks strip was rebuilt in the wrong place.** The first
  restoration put a strip under the progress bar; the original had *replaced*
  the bar, edge to edge. Then the blocks were too short to hover and the
  separators marked every boundary instead of every change of kind.
- **The supplied mockups were internally inconsistent** — three different
  header heights across three screens — and the first implementation
  faithfully reproduced one of them.

**The lesson.** Run a dev server and put the thing in front of the person
before merging. Ask what they meant, not whether it matches the ticket.

## 9. The cutover, and what a proxy cannot see

Moving BellTab under `biscuitlab.net/bell` reused the runbook written for
Puzzle Lab, so most of the mistakes had already been made once. The four from
the first cutover, kept because they will recur on the next zone:

- **The origin pointed at a deployment-pinned URL.** `*-<hash>-*.vercel.app`
  aliases are pinned to one deployment and always protected. The rewrite
  needs the stable production alias, or better, a dedicated origin host.
- **Deployment Protection blocked the rewrite.** A server-side `rewrites()`
  proxy carries no OIDC token, so "Trusted Sources" does not cover it. The
  first fix turned protection off; the correct one attaches a custom origin
  host (`origin-puzzles.biscuitlab.net`, later `origin-bell.biscuitlab.net`),
  which Standard Protection never covers, and re-locks the generated alias.
  BellTab's cutover did this in the right order the first time because the
  runbook said to.
- **A relative auth-client `baseURL` threw at build.** `new URL('/relative')`
  throws. Caught by the preview build on a draft PR, which is why the change
  was staged as a draft.
- **DNS was at Cloudflare, which an audit had said to avoid.** The audit meant
  the proxy. Grey-cloud records to Vercel are fine; the rule is to keep every
  record grey-cloud.

And one from BellTab's own cutover: the hub's `headers()` matcher applied the
hub's headers to the zone's pages, overwriting the zone's own. A negative
lookahead in the matcher lets each zone's headers through. Verified with
`curl -I` on the live URL — see §1.

**The lesson.** A zone behind a rewrite is invisible to every dashboard
except the request log. Verify with a request, and write the runbook before
the second zone, not after.

## 10. What the build log was for

Every entry above came out of a file that `AGENTS.md` requires be updated
with every change, not at the end of a phase: dated session entries,
decisions with the reasoning, open gaps, and bugs with the lesson. The rule
that mattered most was **append, don't rewrite** — a reversed decision gets a
new entry that supersedes the old one, and the old one stays. Several of the
lessons above are visible only because the wrong turn was still on the page
next to the right one.

Numbers, for scale: 189 decisions, 94 closed gaps, 117 session entries and
43 bug entries across ten days of building, and one open gap (undo, declined
on purpose). None of it was written afterwards.

## The short list

1. A rule in CI is a fact; a rule in a document is a wish. The reflow gate
   found five bugs that reading the CSS never would have.
2. A stub that succeeds immediately proves nothing. Give every boundary stub
   a refusing mode and a slow mode.
3. Read a green test like a red one. Break the code on purpose and watch it
   fail for the stated reason.
4. A comment asserting a measurement is a claim. Measure it or delete it.
   Browser-behaviour claims carry a citation or a test.
5. The page is not the page you wrote. Frameworks add DOM, engines differ,
   and the a11y scanner counts all of it.
6. Key comparisons on identity, never on what is displayed. Parse at the
   boundary, and apply the invariant everywhere or note where you have not.
7. A parked feature needs a phase, not a note. Restored code is new code.
8. Some mistakes are only visible to the person the tool is for. Put it in
   front of them before merging.
9. A proxied zone is invisible to every dashboard. Verify with a request.
10. Write the log while the wrong turn is fresh. It is the only place the
    reason survives.
