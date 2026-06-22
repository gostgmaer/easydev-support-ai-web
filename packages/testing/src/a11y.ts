import { axe } from 'vitest-axe';
import type AxeCore from 'axe-core';
import { expect } from 'vitest';

// vitest-axe@0.1.0 ships its matcher type augmentation against Vitest's legacy
// `Vi` namespace, which Vitest 3 no longer uses. Augment Vitest's own
// `Assertion` interface directly so `toHaveNoViolations()` type-checks here.
declare module 'vitest' {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  interface Assertion<T = any> {
    toHaveNoViolations(): T;
  }
  interface AsymmetricMatchersContaining {
    toHaveNoViolations(): void;
  }
}

/** Runs axe-core against a rendered container and asserts zero violations (WCAG 2.1 AA). */
export async function expectNoA11yViolations(
  container: Element,
  options?: AxeCore.RunOptions,
): Promise<void> {
  const results = await axe(container, options);
  expect(results).toHaveNoViolations();
}
