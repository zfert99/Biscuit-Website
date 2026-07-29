import { test, expect } from "@playwright/test";

/**
 * Reflow gate (WCAG 2.2 SC 1.4.10). Every hub page must stay usable with no
 * two-dimensional scrolling down to 320 CSS px. Any horizontal overflow blocks
 * merge. See AGENTS.md — Accessibility & Performance Floor.
 */
const WIDTHS = [320, 375, 768, 1024, 1440];
const PATHS = ["/"];

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
