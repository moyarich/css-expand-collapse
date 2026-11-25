import { expect, it } from "vitest";
import { validateCss } from "../../src/index.js";

it("validates declarations in nested media rules", () => {
  expect(
    validateCss("@media (min-width: 1px) { .card { padding: red; } }"),
  ).toMatchObject({
    valid: false,
    diagnostics: [{ property: "padding", code: "invalid-property-value" }],
  });
});
