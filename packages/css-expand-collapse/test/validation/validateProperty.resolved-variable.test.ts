import { expect, it } from "vitest";
import { validateProperty } from "../../src/index.js";

it("validates a supplied custom property value", () => {
  expect(
    validateProperty("margin", "var(--space)", {
      customProperties: { "--space": "8px" },
    }),
  ).toEqual({ valid: true, diagnostics: [] });
});
