import { expect, it } from "vitest";
import { validateCss } from "../../src/index.js";

it("reports an unresolved stylesheet variable as indeterminate", () => {
  expect(validateCss(".card { margin: var(--space); }")).toMatchObject({
    valid: null,
    diagnostics: [{ code: "unresolved-value", property: "margin" }],
  });
});
