import AxeBuilder from '@axe-core/playwright';
import { test, expect } from './fixtures';

// Automated WCAG 2.2 AA scan (catches contrast, labels, landmarks, ARIA misuse) in both themes.
for (const path of ['/', '/work/mykaab']) {
  for (const scheme of ['light', 'dark'] as const) {
    test(`${path} has no WCAG AA violations in ${scheme} mode`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: scheme, reducedMotion: 'reduce' }); // reduce = everything visible at once
      await page.goto(path);
      const { violations } = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
      expect(violations.map(v => `${v.id}: ${v.help} (${v.nodes.length}× e.g. ${v.nodes[0]?.target})`)).toEqual([]);
    });
  }
}
