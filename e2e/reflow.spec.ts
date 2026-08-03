import { test, expect } from "@playwright/test";

/**
 * Reflow gate (WCAG 2.2 SC 1.4.10). Every hub page must stay usable with no
 * two-dimensional scrolling down to 320 CSS px. Any horizontal overflow blocks
 * merge. See AGENTS.md — Accessibility & Performance Floor.
 */
const WIDTHS = [320, 375, 768, 1024, 1440];
const PATHS = [
  "/",
  "/log",
  "/log/ksudoku-source-vs-docs",
  // Carries the widest content on the site — a 6-column data table plus three
  // figures — so it is the post most likely to break reflow.
  "/log/no-hard-4x4-killer-sudoku",
  "/log/idempotent-until-i-made-it-random",
];

for (const path of PATHS) {
  for (const width of WIDTHS) {
    test(`no horizontal overflow at ${width}px — ${path}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(path);
      const overflow = await page.evaluate(
        () =>
          document.documentElement.scrollWidth -
          document.documentElement.clientWidth,
      );
      expect(overflow).toBeLessThanOrEqual(1);
    });
  }
}
