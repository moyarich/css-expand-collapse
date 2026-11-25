import { expect, it } from "vitest";
import { validateCss } from "../../src/index.js";

it("prioritizes invalid declarations over indeterminate values", () => {
  expect(validateCss(".card { margin: var(--space); padding: red; }").valid).toBe(
    false,
  );
});
